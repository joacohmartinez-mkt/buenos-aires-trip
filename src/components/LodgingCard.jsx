import { MapPin, LogIn, LogOut } from 'lucide-react'
import { TRIP } from '../data/trip'

export default function LodgingCard() {
  const { address, checkin, checkout } = TRIP.lodging
  return (
    <section className="relative z-10 mt-4 px-4">
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-900/5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Nuestro alojamiento
            </p>
            <p className="text-sm font-semibold leading-snug text-gray-800">{address}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StayBlock
            tone="green"
            Icon={LogIn}
            label="Check-in"
            day={checkin.day}
            time={checkin.time}
          />
          <StayBlock
            tone="red"
            Icon={LogOut}
            label="Check-out"
            day={checkout.day}
            time={checkout.time}
          />
        </div>
      </div>
    </section>
  )
}

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100',
}

function StayBlock({ tone, Icon, label, day, time }) {
  return (
    <div className={`rounded-2xl p-3 ring-1 ${tones[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium opacity-90">{day}</p>
      <p className="text-lg font-bold leading-tight">{time}</p>
    </div>
  )
}
