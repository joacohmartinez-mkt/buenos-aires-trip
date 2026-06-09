import { useState } from 'react'
import {
  Home,
  Footprints,
  UtensilsCrossed,
  Landmark,
  Trees,
  Beef,
  Martini,
  Drama,
  Telescope,
  Ship,
  Clock,
  MapPin,
  Lightbulb,
  ChevronDown,
} from 'lucide-react'
import { typeStyle } from '../lib/styles'

const ICONS = {
  alojamiento: Home,
  paseo: Footprints,
  gastronomia: UtensilsCrossed,
  cultura: Landmark,
  'aire-libre': Trees,
  hamburgueseria: Beef,
  bar: Martini,
  teatro: Drama,
  ciencia: Telescope,
  ferry: Ship,
  otro: MapPin,
}

export default function ActivityCard({ activity }) {
  const [open, setOpen] = useState(false)
  const style = typeStyle(activity.type)
  const Icon = ICONS[activity.type] ?? MapPin

  return (
    <div className="relative pl-10">
      {/* Punto sobre la línea del timeline */}
      <span
        className={`absolute left-[10px] top-5 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 ring-gray-50 ${style.dot}`}
      />

      <article className="animate-fade-in rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.chipBg} ${style.chipText}`}>
            <Icon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Clock size={13} />
              <span>{activity.time}</span>
              {activity.duration && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{activity.duration}</span>
                </>
              )}
            </div>

            <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-gray-900">
              {activity.title}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chipBg} ${style.chipText}`}>
                {style.emoji} {style.label}
              </span>
              {activity.highlight && (
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {activity.highlight}
                </span>
              )}
            </div>

            {activity.place && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={13} className="shrink-0" />
                <span className="truncate">{activity.place}</span>
              </div>
            )}
          </div>
        </div>

        {activity.tip && (
          <>
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-500" />
                {open ? 'Ocultar tips' : 'Ver tips'}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="animate-fade-in mt-2 rounded-xl bg-amber-50/70 p-3 text-xs leading-relaxed text-gray-700 ring-1 ring-amber-100">
                <p>{activity.tip}</p>
                {activity.place && (
                  <p className="mt-2 flex items-center gap-1.5 font-medium text-gray-500">
                    <MapPin size={12} />
                    {activity.place}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </article>
    </div>
  )
}
