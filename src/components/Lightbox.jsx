import { useEffect, useState } from 'react'
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { photoUrl, deletePhoto } from '../lib/photos'
import { getEventById } from '../lib/events'
import { useEditMode } from '../lib/editAccess'

export default function Lightbox({ photos, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const [busy, setBusy] = useState(false)
  const editing = useEditMode()

  useEffect(() => {
    if (!photos.length) onClose()
  }, [photos.length, onClose])

  const safe = Math.min(index, photos.length - 1)
  const photo = photos[safe]
  if (!photo) return null
  const ev = photo.event_id ? getEventById(photo.event_id) : null

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm('¿Borrar esta foto? No se puede deshacer.')) return
    setBusy(true)
    try {
      await deletePhoto(photo)
      setIndex((i) => Math.max(0, i - 1))
    } catch {
      setBusy(false)
    }
  }

  const go = (delta) => (e) => {
    e.stopPropagation()
    setIndex((i) => (i + delta + photos.length) % photos.length)
  }

  return (
    <div className="fixed inset-0 z-[1200] flex flex-col bg-black/95" onClick={onClose}>
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} aria-label="Cerrar">
          <X size={26} />
        </button>
        {editing && (
          <button onClick={handleDelete} disabled={busy} className="text-rose-400 disabled:opacity-40">
            <Trash2 size={22} />
          </button>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center px-3" onClick={(e) => e.stopPropagation()}>
        <img
          src={photoUrl(photo.path)}
          alt={photo.caption || 'foto'}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
        {photos.length > 1 && (
          <>
            <button onClick={go(-1)} className="absolute left-1 rounded-full bg-white/15 p-2 text-white backdrop-blur">
              <ChevronLeft size={22} />
            </button>
            <button onClick={go(1)} className="absolute right-1 rounded-full bg-white/15 p-2 text-white backdrop-blur">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 text-center text-white" onClick={(e) => e.stopPropagation()}>
        {photo.caption && <p className="text-sm">{photo.caption}</p>}
        {ev && <p className="mt-1 text-xs text-white/60">📍 {ev.title}</p>}
        {photos.length > 1 && (
          <p className="mt-1 text-[11px] text-white/40">
            {safe + 1} / {photos.length}
          </p>
        )}
      </div>
    </div>
  )
}
