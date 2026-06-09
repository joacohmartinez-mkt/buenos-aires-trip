// Capa de datos de EVENTOS (itinerario editable).
// Igual idea que ratings.js: caché en memoria (lectura sync para el render) +
// backend async en Supabase. Si no hay Supabase o la tabla no existe todavía,
// cae al itinerario estático de data/trip.js (la app nunca se rompe).

import { supabase, isSupabaseConfigured } from './supabase'
import { DAYS, SPOTS } from '../data/trip'

const EVENT = 'events-changed'
const COLS = 'id, day, time_sort, time, title, type, place, duration, tip, highlight, lat, lng'
const EDITABLE = ['day', 'time_sort', 'time', 'title', 'type', 'place', 'duration', 'tip', 'highlight', 'lat', 'lng']

// ---- Helpers de hora ----
export function timeToMinutes(t) {
  if (!t) return 0
  // admite "8:00 AM" o "08:00" (24h)
  const ampm = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (ampm) {
    let h = parseInt(ampm[1], 10)
    const m = parseInt(ampm[2], 10)
    const ap = ampm[3].toUpperCase()
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
    return h * 60 + m
  }
  const h24 = String(t).match(/^(\d{1,2}):(\d{2})$/)
  if (h24) return parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10)
  return 0
}

// minutos -> "8:00 AM"
export function minutesToDisplay(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

// minutos -> "08:00" (para <input type="time">)
export function minutesToInput(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ---- Fallback: eventos derivados del itinerario estático ----
function seedEvents() {
  const spotById = (id) => SPOTS.find((s) => s.id === id)
  const out = []
  DAYS.forEach((d) => {
    d.activities.forEach((a, i) => {
      const spot = a.spotId ? spotById(a.spotId) : null
      out.push({
        id: `seed-${d.id}-${i}`,
        day: d.id,
        time_sort: timeToMinutes(a.time),
        time: a.time,
        title: a.title,
        type: a.type,
        place: a.place ?? '',
        duration: a.duration ?? '',
        tip: a.tip ?? '',
        highlight: a.highlight ?? null,
        lat: spot?.lat ?? null,
        lng: spot?.lng ?? null,
      })
    })
  })
  return out
}

let cache = seedEvents()
let usingDb = false
let triedSeed = false

const notify = () => window.dispatchEvent(new Event(EVENT))

// ---- Lecturas sincrónicas (desde la caché) ----
export const getEvents = () => cache
export const isUsingDb = () => usingDb

export function getEventsByDay(day) {
  return cache.filter((e) => e.day === day).sort((a, b) => a.time_sort - b.time_sort)
}

export function getMapEvents() {
  return cache.filter((e) => e.lat != null && e.lng != null)
}

export const getEventById = (id) => cache.find((e) => e.id === id)

// ---- Carga / guardado ----
export async function loadEvents() {
  if (!isSupabaseConfigured) {
    cache = seedEvents()
    usingDb = false
    notify()
    return cache
  }
  const { data, error } = await supabase.from('events').select(COLS).order('day').order('time_sort')
  if (error) {
    // tabla inexistente / sin conexión -> itinerario estático
    cache = seedEvents()
    usingDb = false
    notify()
    return cache
  }
  if (!data || data.length === 0) {
    // tabla existe pero vacía -> sembrar una vez con el itinerario base
    if (!triedSeed) {
      triedSeed = true
      const rows = seedEvents().map(({ id, ...r }) => r) // sin id: la DB genera uuid
      const { error: seedErr } = await supabase.from('events').insert(rows)
      if (!seedErr) return loadEvents() // re-leer ya sembrado
    }
    cache = seedEvents()
    usingDb = false
    notify()
    return cache
  }
  cache = data
  usingDb = true
  notify()
  return cache
}

function clean(ev) {
  const out = {}
  for (const k of EDITABLE) out[k] = ev[k] ?? (k === 'highlight' || k === 'lat' || k === 'lng' ? null : '')
  out.day = Number(ev.day)
  out.time_sort = Number(ev.time_sort) || 0
  return out
}

export async function saveEvent(ev) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const payload = clean(ev)
  const isExisting = ev.id && !String(ev.id).startsWith('seed-')
  const res = isExisting
    ? await supabase.from('events').update(payload).eq('id', ev.id)
    : await supabase.from('events').insert(payload)
  if (res.error) throw res.error
  await loadEvents()
}

export async function deleteEvent(id) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  if (String(id).startsWith('seed-')) return // un evento sembrado-fallback no vive en la DB
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
  await loadEvents()
}

export function onEventsChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('focus', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('focus', cb)
  }
}
