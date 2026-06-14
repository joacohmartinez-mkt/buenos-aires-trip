// ───────────────────────────────────────────────────────────────────────────
// Capa de datos del CLIMA para los días del viaje.
// Usa Open-Meteo (gratis, sin API key). Estrategia:
//   1) Pide el PRONÓSTICO real para las fechas del viaje (disponible cuando
//      faltan ≤16 días).
//   2) Para los días que el pronóstico todavía no cubre, cae a un PROMEDIO
//      HISTÓRICO de los últimos años (mismos días del calendario).
// Cachea el resultado en sessionStorage (1 fetch por día). Nunca rompe la app:
// si todo falla, devuelve [] y el componente simplemente no se muestra.
// ───────────────────────────────────────────────────────────────────────────

import { TRIP, DAYS } from '../data/trip'

const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive'
const TZ = 'America/Argentina/Buenos_Aires'
const DAILY_FC = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
const DAILY_HX = 'weather_code,temperature_2m_max,temperature_2m_min'

// Códigos WMO → emoji + descripción corta (es). https://open-meteo.com/en/docs
const WMO = {
  0: { emoji: '☀️', label: 'Despejado' },
  1: { emoji: '🌤️', label: 'Mayormente despejado' },
  2: { emoji: '⛅', label: 'Parcialmente nublado' },
  3: { emoji: '☁️', label: 'Nublado' },
  45: { emoji: '🌫️', label: 'Niebla' },
  48: { emoji: '🌫️', label: 'Niebla' },
  51: { emoji: '🌦️', label: 'Llovizna leve' },
  53: { emoji: '🌦️', label: 'Llovizna' },
  55: { emoji: '🌦️', label: 'Llovizna intensa' },
  56: { emoji: '🌧️', label: 'Llovizna helada' },
  57: { emoji: '🌧️', label: 'Llovizna helada' },
  61: { emoji: '🌧️', label: 'Lluvia leve' },
  63: { emoji: '🌧️', label: 'Lluvia' },
  65: { emoji: '🌧️', label: 'Lluvia intensa' },
  66: { emoji: '🌧️', label: 'Lluvia helada' },
  67: { emoji: '🌧️', label: 'Lluvia helada' },
  71: { emoji: '🌨️', label: 'Nieve leve' },
  73: { emoji: '🌨️', label: 'Nieve' },
  75: { emoji: '🌨️', label: 'Nieve intensa' },
  77: { emoji: '🌨️', label: 'Aguanieve' },
  80: { emoji: '🌦️', label: 'Chaparrones' },
  81: { emoji: '🌦️', label: 'Chaparrones' },
  82: { emoji: '⛈️', label: 'Chaparrones fuertes' },
  85: { emoji: '🌨️', label: 'Chaparrones de nieve' },
  86: { emoji: '🌨️', label: 'Chaparrones de nieve' },
  95: { emoji: '⛈️', label: 'Tormenta' },
  96: { emoji: '⛈️', label: 'Tormenta con granizo' },
  99: { emoji: '⛈️', label: 'Tormenta con granizo' },
}

export function describeWeather(code) {
  return WMO[code] ?? { emoji: '🌡️', label: 'Clima' }
}

const tripDates = () => DAYS.map((d) => d.iso).filter(Boolean)
const tripYear = () => Number(TRIP.start.slice(0, 4))

// Convierte la respuesta diaria de Open-Meteo en { 'YYYY-MM-DD': {…} }.
function mapDaily(json, kind) {
  const d = json && json.daily
  if (!d || !d.time) return {}
  const out = {}
  d.time.forEach((date, i) => {
    const max = d.temperature_2m_max?.[i]
    const min = d.temperature_2m_min?.[i]
    if (max == null || min == null) return // día sin datos (fuera de ventana)
    const pop = d.precipitation_probability_max?.[i]
    out[date] = {
      date,
      code: d.weather_code?.[i] ?? 0,
      max: Math.round(max),
      min: Math.round(min),
      pop: pop == null ? null : Math.round(pop),
      kind,
    }
  })
  return out
}

async function fetchForecast() {
  const { coords, start, end } = TRIP
  const url =
    `${FORECAST}?latitude=${coords.lat}&longitude=${coords.lng}` +
    `&daily=${DAILY_FC}&timezone=${encodeURIComponent(TZ)}` +
    `&start_date=${start}&end_date=${end}`
  const r = await fetch(url)
  if (!r.ok) throw new Error('forecast unavailable')
  return mapDaily(await r.json(), 'forecast')
}

function mode(arr) {
  const c = {}
  let best = arr[0]
  let bestN = 0
  for (const x of arr) {
    c[x] = (c[x] || 0) + 1
    if (c[x] > bestN) {
      bestN = c[x]
      best = x
    }
  }
  return best
}

const avg = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length

// Promedio histórico de los últimos 3 años para las fechas que falten.
async function fetchHistorical(missing) {
  const { coords } = TRIP
  const years = [tripYear() - 1, tripYear() - 2, tripYear() - 3]
  const mdStart = missing[0].slice(5) // 'MM-DD'
  const mdEnd = missing[missing.length - 1].slice(5)

  const reqs = years.map((y) =>
    fetch(
      `${ARCHIVE}?latitude=${coords.lat}&longitude=${coords.lng}` +
        `&daily=${DAILY_HX}&timezone=${encodeURIComponent(TZ)}` +
        `&start_date=${y}-${mdStart}&end_date=${y}-${mdEnd}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  )
  const results = (await Promise.all(reqs)).filter(Boolean)
  if (!results.length) return {}

  // Acumula por mes-día (MM-DD) a través de los años.
  const acc = {} // 'MM-DD' -> { max:[], min:[], codes:[] }
  for (const json of results) {
    const d = json.daily
    if (!d || !d.time) continue
    d.time.forEach((date, i) => {
      const md = date.slice(5)
      const max = d.temperature_2m_max?.[i]
      const min = d.temperature_2m_min?.[i]
      if (max == null || min == null) return
      const bucket = (acc[md] ||= { max: [], min: [], codes: [] })
      bucket.max.push(max)
      bucket.min.push(min)
      bucket.codes.push(d.weather_code?.[i] ?? 0)
    })
  }

  const out = {}
  for (const date of missing) {
    const b = acc[date.slice(5)]
    if (!b || !b.max.length) continue
    out[date] = {
      date,
      code: mode(b.codes),
      max: Math.round(avg(b.max)),
      min: Math.round(avg(b.min)),
      pop: null,
      kind: 'historical',
    }
  }
  return out
}

export async function getTripWeather() {
  const dates = tripDates()
  if (!dates.length || !TRIP.coords) return []

  const today = new Date().toISOString().slice(0, 10)
  const key = `baw:${TRIP.start}:${today}`
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) return JSON.parse(cached)
  } catch {}

  let byDate = {}
  try {
    byDate = await fetchForecast()
  } catch {}

  const missing = dates.filter((d) => !byDate[d])
  if (missing.length) {
    try {
      const hist = await fetchHistorical(missing)
      byDate = { ...hist, ...byDate } // el pronóstico real tiene prioridad
    } catch {}
  }

  const out = dates.map((d) => byDate[d]).filter(Boolean)
  // Solo cacheamos si está completo, para reintentar si la red falló.
  if (out.length === dates.length) {
    try {
      sessionStorage.setItem(key, JSON.stringify(out))
    } catch {}
  }
  return out
}
