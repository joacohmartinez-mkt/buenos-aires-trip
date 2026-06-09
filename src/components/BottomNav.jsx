import { NavLink } from 'react-router-dom'
import { CalendarDays, MapPinned } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Itinerario', Icon: CalendarDays, end: true },
  { to: '/mapa', label: 'Mapa & Ratings', Icon: MapPinned, end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-gray-200 bg-white/90 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-app items-stretch gap-2 px-3 pt-2">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
