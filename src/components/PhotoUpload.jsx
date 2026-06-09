import { useMemo, useRef, useState } from 'react'
import { X, ImagePlus, Camera } from 'lucide-react'
import { getEvents } from '../lib/events'
import { uploadPhoto } from '../lib/photos'
import LocationPicker from './LocationPicker'

export default function PhotoUpload({ defaultEventId = null, onClose }) {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [attach, setAttach] = useState(defaultEventId ? 'event' : 'none')
  const [eventId, setEventId] = useState(defaultEventId ?? '')
  const [loc, setLoc] = useState(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const events = useMemo(
    () => [...getEvents()].sort((a, b) => a.day - b.day || a.time_sort - b.time_sort),
    [],
  )

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  async function handleUpload() {
    if (!file) {
      setError('Elegí una foto primero.')
      return
    }
    if (attach === 'event' && !eventId) {
      setError('Elegí a qué evento atarla.')
      return
    }
    if (attach === 'map' && !loc) {
      setError('Tocá el mapa para marcar dónde va.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await uploadPhoto(file, {
        eventId: attach === 'event' ? eventId : null,
        lat: attach === 'map' ? loc.lat : null,
        lng: attach === 'map' ? loc.lng : null,
        caption: caption.trim(),
      })
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo subir. Probá de nuevo.')
      setBusy(false)
    }
  }

  const seg = (key, label) => (
    <button
      onClick={() => setAttach(key)}
      className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
        attach === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

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
          <h3 className="text-lg font-bold text-gray-900">Subir foto</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {/* Selector de archivo / preview */}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
          {preview ? (
            <button onClick={() => fileRef.current?.click()} className="mt-4 block w-full overflow-hidden rounded-2xl">
              <img src={preview} alt="preview" className="max-h-72 w-full object-cover" />
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
            >
              <ImagePlus size={28} />
              <span className="text-sm font-semibold">Elegir foto del celu</span>
              <span className="flex items-center gap-1 text-[11px]"><Camera size={12} /> cámara o galería</span>
            </button>
          )}

          {/* ¿Dónde va? */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">¿Dónde va?</p>
          <div className="mt-2 flex gap-2">
            {seg('event', '📌 A un evento')}
            {seg('map', '🗺️ Punto en mapa')}
            {seg('none', '🖼️ Solo galería')}
          </div>

          {attach === 'event' && (
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
            >
              <option value="">Elegí un evento…</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  Día {ev.day} · {ev.time} · {ev.title}
                </option>
              ))}
            </select>
          )}

          {attach === 'map' && (
            <div className="mt-3">
              <LocationPicker value={loc} onChange={setLoc} />
            </div>
          )}

          {/* Título */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Título <span className="font-normal lowercase text-gray-300">(opcional)</span>
          </p>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ej: el atardecer en el Rosedal 🌅"
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
          />

          {error && <p className="mt-3 text-xs font-medium text-rose-500">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {busy ? 'Subiendo…' : 'Subir foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
