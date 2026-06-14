import { TRIP } from '../data/trip'

// Días enteros desde hoy (00:00 local) hasta una fecha ISO 'YYYY-MM-DD'.
function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target - today) / 86400000)
}

// Estado de la cuenta regresiva según en qué momento del viaje estamos.
function status() {
  const toStart = daysUntil(TRIP.start)
  const toEnd = daysUntil(TRIP.end)

  if (toStart > 1)
    return { big: toStart, unit: 'días', label: 'Cuenta regresiva', title: `Faltan ${toStart} días para Buenos Aires` }
  if (toStart === 1)
    return { big: 1, unit: 'día', label: 'Cuenta regresiva', title: '¡Falta 1 día! Mañana es el gran día' }
  if (toStart === 0)
    return { big: '¡Hoy!', unit: '', label: 'Llegó el día', title: '¡Arranca el viaje! Buen viaje ❤️' }
  if (toEnd >= 0) {
    const n = 1 - toStart // 1, 2, 3, 4…
    return { big: n, unit: n === 1 ? 'día' : 'días', label: 'En Buenos Aires', title: `Día ${n} del viaje · disfrútenlo` }
  }
  return { big: '❤️', unit: '', label: 'Recuerdos', title: 'Nuestro viaje a Buenos Aires' }
}

export default function Countdown() {
  const s = status()
  const isNumber = typeof s.big === 'number'

  return (
    <section className="relative z-10 mx-4 -mt-6">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-inner">
          <span className={`font-bold leading-none ${isNumber ? 'text-3xl' : 'text-2xl'}`}>{s.big}</span>
          {s.unit && <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">{s.unit}</span>}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-500">{s.label}</p>
          <p className="text-base font-bold leading-tight text-gray-900">{s.title}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{TRIP.datesLong}</p>
        </div>
      </div>
    </section>
  )
}
