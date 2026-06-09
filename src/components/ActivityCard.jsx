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
  ChevronDown,
  Pencil,
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

// Tarjeta de evento colapsable: hora + título + categoría siempre visibles, y al
// tocarla se despliega lugar + tip. En modo edición muestra un lápiz fantasma.
export default function ActivityCard({ activity, editing = false, onEdit }) {
  const [open, setOpen] = useState(false)
  const style = typeStyle(activity.type)
  const Icon = ICONS[activity.type] ?? MapPin
  const hasDetails = Boolean(activity.place || activity.tip)

  return (
    <div className="relative pl-10">
      <span
        className={`absolute left-[10px] top-5 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 ring-gray-50 ${style.dot}`}
      />

      <article className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div
          onClick={() => hasDetails && setOpen((v) => !v)}
          className={`flex items-start gap-3 p-3 ${hasDetails ? 'cursor-pointer' : ''}`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.chipBg} ${style.chipText}`}>
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <Clock size={12} />
              <span>{activity.time}</span>
              {activity.duration && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{activity.duration}</span>
                </>
              )}
            </div>
            <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-gray-900">{activity.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chipBg} ${style.chipText}`}>
                {style.emoji} {style.label}
              </span>
              {activity.highlight && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  {activity.highlight}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {editing && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Editar evento"
              >
                <Pencil size={15} />
              </button>
            )}
            {hasDetails && (
              <ChevronDown
                size={18}
                className={`mt-0.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            )}
          </div>
        </div>

        {open && hasDetails && (
          <div className="animate-fade-in space-y-2 px-3 pb-3 pl-[52px]">
            {activity.place && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={13} className="shrink-0" />
                <span>{activity.place}</span>
              </p>
            )}
            {activity.tip && (
              <div className="rounded-xl bg-amber-50/70 p-2.5 text-xs leading-relaxed text-gray-700 ring-1 ring-amber-100">
                {activity.tip}
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  )
}
