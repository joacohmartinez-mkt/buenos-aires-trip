import { useState } from 'react'
import HeroHeader from '../components/HeroHeader'
import LodgingCard from '../components/LodgingCard'
import Highlights from '../components/Highlights'
import DayTabs from '../components/DayTabs'
import ActivityCard from '../components/ActivityCard'
import { DAYS } from '../data/trip'
import { dayTheme } from '../lib/styles'

export default function Itinerary() {
  const [activeId, setActiveId] = useState(DAYS[0].id)
  const day = DAYS.find((d) => d.id === activeId) ?? DAYS[0]
  const theme = dayTheme(day.color)

  return (
    <div>
      <HeroHeader />
      <LodgingCard />
      <Highlights />
      <DayTabs days={DAYS} activeId={activeId} onSelect={setActiveId} />

      {/* Encabezado del día */}
      <div className={`mx-4 mt-5 rounded-2xl ${theme.soft} p-4 ${theme.border} border`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{day.emoji}</span>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${theme.text}`}>
              {day.label} · {day.date}
            </p>
            <h2 className="text-lg font-bold leading-tight text-gray-900">{day.tagline}</h2>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-gray-500">
          {day.activities.length} actividades planeadas
        </p>
      </div>

      {/* Timeline vertical */}
      <div className="relative mt-4 px-4 pb-4">
        <span className="absolute bottom-6 left-[26px] top-3 w-0.5 bg-gray-200" />
        <div className="space-y-3">
          {day.activities.map((a, i) => (
            <ActivityCard key={`${day.id}-${i}`} activity={a} />
          ))}
        </div>
      </div>
    </div>
  )
}
