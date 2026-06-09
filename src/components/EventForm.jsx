import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { DAYS } from '../data/trip'
import { TYPE_STYLES } from '../lib/styles'
import {
  saveEvent,
  deleteEvent,
  timeToMinutes,
  minutesToInput,
  minutesToDisplay,
} from '../lib/events'
import LocationPicker from './LocationPicker'

const TYPES = Object.entries(TYPE_STYLES)

export default function EventForm({ event, defaultDay = 1, onClose }) {
  const isEdit = Boolean(event)
  const [day, setDay] = useState(event?.day ?? defaultDay)
  const [timeInput, setTimeInput] = useState(
    minutesToInput(event ? (event.time_sort ?? timeToMinutes(event.time)) : 720),
  )
  const [title, setTitle] = useState(event?.title ?? '')
  const [type, setType] = useState(event?.type ?? 'paseo')
  const [place, setPlace] = useState(event?.place ?? '')
  const [loc, setLoc] = useState(
    event && event.lat != null ? { lat: event.lat, lng: event.lng } : null,
  )
  const [duration, setDuration] = useState(event?.duration ?? '')
  const [tip, setTip] = useState(event?.tip ?? '')
  const [highlight, setHighlight] = useState(event?.highlight ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!title.trim()) {
      setError('Ponele un título.')
      return
    }
    setSaving(true)
    setError('')
    const time_sort = timeToMinutes(timeInput)
    try {
      await saveEvent({
        id: event?.id,
        day: Number(day),
        time_sort,
        time: minutesToDisplay(time_sort),
        title: title.trim(),
        type,
        place: place.trim(),
        duration: duration.trim(),
        tip: tip.trim(),
        highlight: highlight.trim() || null,
        lat: loc?.lat ?? null,
        lng: loc?.lng ?? null,
      })
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar. ¿Corriste el SQL de eventos en Supabase?')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Borrar "${event.title}"? No se puede deshacer.`)) return
    setSaving(true)
    try {
      await deleteEvent(event.id)
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo borrar.')
      setSaving(false)
    }
  }

  const label = 'mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400'
  const input =
    'mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none'

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in flex max-h-[92vh] w-full max-w-app flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Editar evento' : 'Nuevo evento'}
          </h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {/* Día */}
          <p className={label}>Día</p>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDay(d.id)}
                className={`rounded-xl py-2 text-center text-xs font-semibold transition-colors ${
                  Number(day) === d.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="block text-base leading-none">{d.emoji}</span>
                {d.date}
              </button>
            ))}
          </div>

          {/* Hora + Título */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className={label}>Hora</p>
              <input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className={input} />
            </div>
            <div className="col-span-2">
              <p className={label}>Título</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Cena en La Cabrera"
                className={input}
              />
            </div>
          </div>

          {/* Categoría */}
          <p className={label}>Categoría</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {TYPES.map(([key, st]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition ${
                  type === key
                    ? `${st.chipBg} ${st.chipText} ring-2 ring-gray-900/10`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span>{st.emoji}</span>
                <span className="truncate">{st.label}</span>
              </button>
            ))}
          </div>

          {/* Lugar / dirección */}
          <p className={label}>Lugar / dirección</p>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Ej: Cabrera 5127, Palermo"
            className={input}
          />

          {/* Ubicación en el mapa */}
          <p className={label}>Ubicación en el mapa <span className="font-normal lowercase text-gray-300">(opcional)</span></p>
          <div className="mt-1.5">
            <LocationPicker value={loc} onChange={setLoc} />
          </div>

          {/* Opcionales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={label}>Duración</p>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="2 hrs" className={input} />
            </div>
            <div>
              <p className={label}>Destacado</p>
              <input value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="🍔 MUST" className={input} />
            </div>
          </div>

          <p className={label}>Tip <span className="font-normal lowercase text-gray-300">(opcional)</span></p>
          <textarea
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            rows={2}
            placeholder="Un consejo para este lugar…"
            className={`${input} resize-none`}
          />

          {error && <p className="mt-3 text-xs font-medium text-rose-500">{error}</p>}

          <div className="mt-5 flex gap-2">
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center justify-center rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
