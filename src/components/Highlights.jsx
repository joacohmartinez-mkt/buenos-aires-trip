import { Sparkles, ArrowUpRight } from 'lucide-react'
import { HIGHLIGHTS } from '../data/trip'

export default function Highlights() {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2 px-4">
        <Sparkles size={18} className="text-amber-500" />
        <h2 className="text-base font-bold text-gray-800">Imperdibles del viaje</h2>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {HIGHLIGHTS.map((h) => (
          <a
            key={h.title}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-36 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-gray-800 shadow-md"
          >
            <img
              src={h.image}
              alt={h.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
            <span className="absolute left-2 top-2 text-2xl drop-shadow-md">{h.emoji}</span>
            <span className="absolute right-2 top-2 rounded-full bg-white/20 p-1 text-white backdrop-blur-sm">
              <ArrowUpRight size={14} />
            </span>
            <div className="relative p-3 text-white">
              <h3 className="text-sm font-bold leading-tight drop-shadow">{h.title}</h3>
              <p className="text-[11px] font-medium leading-tight text-white/85">{h.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
