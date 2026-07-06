import { useEffect, useMemo, useState } from 'react'
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  photoUrl,
  deletePhoto,
  getPhotos,
  getPhotosByEvent,
  getPhotosByAlbum,
  onPhotosChange,
  isVideo,
} from '../lib/photos'
import { getEventById } from '../lib/events'

// source: { kind: 'all' | 'none' | 'album' | 'event' | 'single', name?, eventId?, id? }
function resolvePhotos(source) {
  if (!source) return []
  switch (source.kind) {
    case 'all':
      return getPhotos()
    case 'none':
      return getPhotosByAlbum(null)
    case 'album':
      return getPhotosByAlbum(source.name)
    case 'event':
      return getPhotosByEvent(source.eventId)
    case 'single':
      return getPhotos().filter((p) => p.id === source.id)
    default:
      return []
  }
}

export default function Lightbox({ source, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)

  // Refresca cada vez que cambia la caché de fotos (borrado, subida, etc.).
  useEffect(() => onPhotosChange(() => setVersion((v) => v + 1)), [])

  const photos = useMemo(() => resolvePhotos(source), [source, version])

  // Si se acabaron las fotos (todas borradas), cerrar.
  useEffect(() => {
    if (photos.length === 0) onClose()
  }, [photos.length, onClose])

  const safe = Math.min(index, Math.max(0, photos.length - 1))
  const photo = photos[safe]
  if (!photo) return null
  const ev = photo.event_id ? getEventById(photo.event_id) : null
  const isVid = isVideo(photo)

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm('¿Borrar este recuerdo? No se puede deshacer.')) return
    setBusy(true)
    try {
      await deletePhoto(photo)
      setIndex((i) => Math.max(0, Math.min(i, photos.length - 2)))
    } catch {
      // noop — dejamos que se recupere
    } finally {
      setBusy(false)
    }
  }

  const go = (delta) => (e) => {
    e.stopPropagation()
    setIndex((i) => (i + delta + photos.length) % photos.length)
  }

  // Cierra al tocar el backdrop. Los botones y el media hacen stopPropagation.
  return (
    <div
      className="fixed inset-0 z-[1200] flex flex-col bg-black/95"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Barra superior: cerrar + borrar */}
      <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-full bg-white/10 p-2 backdrop-blur hover:bg-white/20"
        >
          <X size={22} />
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          aria-label="Borrar"
          className="rounded-full bg-white/10 p-2 text-rose-300 backdrop-blur hover:bg-white/20 disabled:opacity-40"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Media (imagen o video). Toca fuera del media para cerrar. */}
      <div className="relative flex flex-1 items-center justify-center px-3">
        {isVid ? (
          <video
            key={photo.id}
            src={photoUrl(photo.path)}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            src={photoUrl(photo.path)}
            alt={photo.caption || 'foto'}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={go(-1)}
              aria-label="Anterior"
              className="absolute left-2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={go(1)}
              aria-label="Siguiente"
              className="absolute right-2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Pie: caption + evento + contador. Backdrop clic también cierra desde acá. */}
      <div className="px-4 pb-6 pt-3 text-center text-white">
        <div onClick={(e) => e.stopPropagation()} className="inline-block max-w-full">
          {photo.caption && <p className="text-sm">{photo.caption}</p>}
          {photo.album && (
            <p className="mt-1 text-xs text-white/70">📁 {photo.album}</p>
          )}
          {ev && <p className="mt-1 text-xs text-white/60">📍 {ev.title}</p>}
          {photos.length > 1 && (
            <p className="mt-1 text-[11px] text-white/40">
              {safe + 1} / {photos.length}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
