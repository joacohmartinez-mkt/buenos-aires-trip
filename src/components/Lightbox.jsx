import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Trash2, ChevronLeft, ChevronRight, FolderInput } from 'lucide-react'
import {
  photoUrl,
  deletePhoto,
  getPhotos,
  getPhotosByEvent,
  getPhotosByAlbum,
  onPhotosChange,
  isVideo,
  movePhotosToAlbum,
} from '../lib/photos'
import { getEventById } from '../lib/events'
import { confirmDialog } from '../lib/dialog'
import useLockBodyScroll from '../lib/useLockBodyScroll'
import AlbumPicker from './AlbumPicker'

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

const SWIPE_MIN = 48 // px de arrastre para que cuente como swipe

export default function Lightbox({ source, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)
  const [moving, setMoving] = useState(false)
  const [drag, setDrag] = useState(null) // { dx, dy } mientras se arrastra
  const touchRef = useRef(null) // { x, y } de inicio

  useLockBodyScroll(true)

  // Refresca cada vez que cambia la caché de fotos (borrado, subida, etc.).
  useEffect(() => onPhotosChange(() => setVersion((v) => v + 1)), [])

  const photos = useMemo(() => resolvePhotos(source), [source, version])

  // Si se acabaron las fotos (todas borradas), cerrar.
  useEffect(() => {
    if (photos.length === 0) onClose()
  }, [photos.length, onClose])

  const count = photos.length
  const go = (delta) => {
    if (count > 1) setIndex((i) => (i + delta + count) % count)
  }

  // Teclado: Escape cierra, flechas navegan. Ignorar si hay un picker arriba.
  useEffect(() => {
    function onKey(e) {
      if (moving) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, moving, onClose])

  const safe = Math.min(index, Math.max(0, photos.length - 1))
  const photo = photos[safe]
  if (!photo) return null
  const ev = photo.event_id ? getEventById(photo.event_id) : null
  const isVid = isVideo(photo)

  async function handleDelete(e) {
    e.stopPropagation()
    const ok = await confirmDialog({
      title: '¿Borrar este recuerdo?',
      message: 'No se puede deshacer.',
      confirmLabel: 'Borrar',
      danger: true,
    })
    if (!ok) return
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

  // ---- Gestos táctiles: swipe horizontal navega, swipe-down cierra ----
  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchMove(e) {
    if (!touchRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - touchRef.current.x
    const dy = e.touches[0].clientY - touchRef.current.y
    setDrag({ dx, dy })
  }
  function onTouchEnd() {
    const d = drag
    touchRef.current = null
    setDrag(null)
    if (!d) return
    const absX = Math.abs(d.dx)
    const absY = Math.abs(d.dy)
    if (absX > SWIPE_MIN && absX > absY) {
      go(d.dx < 0 ? 1 : -1)
    } else if (d.dy > SWIPE_MIN * 1.5 && absY > absX) {
      onClose()
    }
  }

  // Feedback visual del arrastre (solo trasladar; sin animar layout).
  const dragStyle = drag
    ? {
        transform: `translate(${drag.dx * 0.6}px, ${Math.max(0, drag.dy) * 0.5}px)`,
        opacity: Math.max(0.4, 1 - Math.max(0, drag.dy) / 400),
        transition: 'none',
      }
    : { transform: 'translate(0,0)', opacity: 1, transition: 'transform 0.2s ease-out, opacity 0.2s ease-out' }

  // Cierra al tocar el backdrop. Los botones y el media hacen stopPropagation.
  return (
    <div
      className="fixed inset-0 z-[1200] flex flex-col bg-black/95"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Barra superior: cerrar + mover + borrar */}
      <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-full bg-white/10 p-2 backdrop-blur hover:bg-white/20"
        >
          <X size={22} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMoving(true)}
            disabled={busy}
            aria-label="Mover a álbum"
            className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 disabled:opacity-40"
          >
            <FolderInput size={20} />
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
      </div>

      {/* Media (imagen o video). Swipe para navegar / bajar para cerrar. */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-3"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isVid ? (
          <video
            key={photo.id}
            src={photoUrl(photo.path)}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="max-h-full max-w-full rounded-lg"
            style={dragStyle}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            key={photo.id}
            src={photoUrl(photo.path)}
            alt={photo.caption || 'foto'}
            className="max-h-full max-w-full rounded-lg object-contain"
            style={dragStyle}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {count > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label="Anterior"
              className="absolute left-2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
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
          {count > 1 && (
            <p className="mt-1 text-[11px] text-white/40">
              {safe + 1} / {count}
            </p>
          )}
        </div>
      </div>

      {moving && (
        <div onClick={(e) => e.stopPropagation()}>
          <AlbumPicker
            title="Mover a álbum"
            currentAlbum={photo.album || null}
            onPick={async (name) => {
              setBusy(true)
              try {
                await movePhotosToAlbum([photo.id], name)
              } catch {
                /* noop */
              } finally {
                setBusy(false)
                setMoving(false)
              }
            }}
            onClose={() => setMoving(false)}
          />
        </div>
      )}
    </div>
  )
}
