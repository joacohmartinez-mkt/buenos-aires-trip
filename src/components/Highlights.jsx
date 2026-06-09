import { Sparkles } from 'lucide-react'
import { HIGHLIGHTS } from '../data/trip'

const gradients = {
  amber: 'from-amber-400 to-orange-500',
  emerald: 'from-emerald-400 to-teal-500',
  red: 'from-rose-400 to-red-500',
  indigo: 'from-indigo-400 to-violet-500',
  rose: 'from-rose-400 to-pink-500',
}

export default function Highlights() {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2 px-4">
        <Sparkles size={18} className="text-amber-500" />
        <h2 className="text-base font-bold text-gray-800">Imperdibles del viaje</h2>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {HIGHLIGHTS.map((h) => (
          <article
            key={h.title}
            className={`relative flex h-32 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-white shadow-md ${gradients[h.color]}`}
          >
            <span className="absolute right-2 top-2 text-3xl drop-shadow-sm">{h.emoji}</span>
            <h3 className="text-sm font-bold leading-tight drop-shadow">{h.title}</h3>
            <p className="text-[11px] font-medium leading-tight text-white/90">{h.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
