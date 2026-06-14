import { useEffect, useState } from 'react'
import { getTripWeather, describeWeather } from '../lib/weather'
import { DAYS } from '../data/trip'

// Etiqueta corta del día a partir del iso ('Vie 3 jul' → 'Vie 3').
function shortLabel(iso) {
  const day = DAYS.find((d) => d.iso === iso)
  if (day?.date) return day.date.replace(/\s*jul\.?$/i, '')
  return iso?.slice(5) ?? ''
}

export default function WeatherStrip() {
  const [days, setDays] = useState(null)

  useEffect(() => {
    let alive = true
    getTripWeather()
      .then((d) => alive && setDays(d))
      .catch(() => alive && setDays([]))
    return () => {
      alive = false
    }
  }, [])

  if (!days || !days.length) return null
  const historical = days.some((d) => d.kind === 'historical')

  return (
    <section className="mx-4 mt-4">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Clima del viaje</h3>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-sky-600 ring-1 ring-sky-100">
            {historical ? 'Promedio histórico' : 'Pronóstico'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {days.map((d) => {
            const w = describeWeather(d.code)
            return (
              <div key={d.date} className="rounded-xl bg-white/70 p-2 text-center" title={w.label}>
                <p className="text-[11px] font-semibold text-gray-500">{shortLabel(d.date)}</p>
                <p className="my-1 text-2xl leading-none">{w.emoji}</p>
                <p className="text-sm font-bold text-gray-900">
                  {d.max}°<span className="font-medium text-gray-400">/{d.min}°</span>
                </p>
                {d.pop != null && d.pop >= 30 && (
                  <p className="mt-0.5 text-[10px] font-semibold text-sky-600">💧 {d.pop}%</p>
                )}
              </div>
            )
          })}
        </div>

        {historical && (
          <p className="mt-2 text-[10px] leading-snug text-gray-400">
            Promedio de años anteriores. El pronóstico exacto aparece cuando falten ≤16 días.
          </p>
        )}
      </div>
    </section>
  )
}
