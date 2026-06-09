import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import HeroHeader from '../components/HeroHeader'
import LodgingCard from '../components/LodgingCard'
import Highlights from '../components/Highlights'
import DayTabs from '../components/DayTabs'
import ActivityCard from '../components/ActivityCard'
import EventForm from '../components/EventForm'
import { DAYS } from '../data/trip'
import { dayTheme } from '../lib/styles'
import { getEventsByDay, loadEvents, onEventsChange } from '../lib/events'
import { loadPhotos, onPhotosChange } from '../lib/photos'
import { useEditMode } from '../lib/editAccess'

export default function Itinerary() {
  const [activeId, setActiveId] = useState(DAYS[0].id)
  const [, setV] = useState(0)
  const [form, setForm] = useState(null) // null | { event } | { isNew: true }
  const editing = useEditMode()

  useEffect(() => {
    loadEvents()
    loadPhotos()
    const offE = onEventsChange(() => setV((v) => v + 1))
    const offP = onPhotosChange(() => setV((v) => v + 1))
    return () => {
      offE()
      offP()
    }
  }, [])

  const day = DAYS.find((d) => d.id === activeId) ?? DAYS[0]
  const theme = dayTheme(day.color)
  const activities = getEventsByDay(activeId)

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
          {activities.length} {activities.length === 1 ? 'actividad planeada' : 'actividades planeadas'}
        </p>
      </div>

      {/* Timeline vertical */}
      <div className="relative mt-4 px-4 pb-4">
        <span className="absolute bottom-6 left-[26px] top-3 w-0.5 bg-gray-200" />
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="relative">
              <ActivityCard activity={a} />
              {editing && (
                <button
                  onClick={() => setForm({ event: a })}
                  className="absolute right-3 top-3 z-[5] flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white shadow-md"
                  aria-label="Editar evento"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <button
            onClick={() => setForm({ isNew: true })}
            className="ml-10 mt-3 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            <Plus size={18} /> Agregar evento al {day.label}
          </button>
        )}
      </div>

      {form && (
        <EventForm event={form.event ?? null} defaultDay={activeId} onClose={() => setForm(null)} />
      )}
    </div>
  )
}
