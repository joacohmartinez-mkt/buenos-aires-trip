import { NavLink } from 'react-router-dom'
import { CalendarDays, MapPinned, Image } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Itinerario', Icon: CalendarDays, end: true },
  { to: '/mapa', label: 'Mapa', Icon: MapPinned, end: false },
  { to: '/fotos', label: 'Fotos', Icon: Image, end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-gray-200 bg-white/90 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-app items-stretch gap-1.5 px-3 pt-2">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition-colors',
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
