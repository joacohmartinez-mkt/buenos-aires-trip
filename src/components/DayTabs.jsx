import { dayTheme } from '../lib/styles'

export default function DayTabs({ days, activeId, onSelect }) {
  return (
    <div className="no-scrollbar mt-6 flex gap-2.5 overflow-x-auto px-4">
      {days.map((d) => {
        const active = d.id === activeId
        const theme = dayTheme(d.color)
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={[
              'flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-4 py-2.5 transition-all',
              active
                ? `${theme.activeTab} scale-105`
                : 'bg-white text-gray-500 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50',
            ].join(' ')}
          >
            <span className="text-xl leading-none">{d.emoji}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{d.label}</span>
            <span className={`text-[11px] font-medium ${active ? 'text-white/90' : 'text-gray-400'}`}>
              {d.date}
            </span>
          </button>
        )
      })}
    </div>
  )
}
