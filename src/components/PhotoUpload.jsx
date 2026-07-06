import { useMemo, useRef, useState } from 'react'
import { X, ImagePlus, Camera, Film, FolderPlus } from 'lucide-react'
import { uploadPhoto, getAlbums } from '../lib/photos'
import PhotoPlacePicker from './PhotoPlacePicker'

export default function PhotoUpload({ defaultEventId = null, defaultAlbum = null, onClose }) {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [place, setPlace] = useState(defaultEventId ? { eventId: defaultEventId } : null)
  const [caption, setCaption] = useState('')
  const [album, setAlbum] = useState(defaultAlbum || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const existingAlbums = useMemo(
    () => getAlbums().map((a) => a.name).filter(Boolean),
    []
  )

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setIsVideo((f.type || '').startsWith('video/'))
    setError('')
  }

  async function handleUpload() {
    if (!file) {
      setError('Elegí una foto o video primero.')
      return
    }
    if (!place) {
      setError('Tocá una actividad o un punto del mapa para ubicarlo.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await uploadPhoto(file, {
        eventId: place.eventId ?? null,
        lat: place.lat ?? null,
        lng: place.lng ?? null,
        caption: caption.trim(),
        album: album.trim() || null,
      })
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo subir. Probá de nuevo.')
      setBusy(false)
    }
  }

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
          <h3 className="text-lg font-bold text-gray-900">Subir recuerdo</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {/* Selector de archivo / preview */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={pickFile}
            className="hidden"
          />
          {preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 block w-full overflow-hidden rounded-2xl bg-black"
            >
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  playsInline
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <img src={preview} alt="preview" className="max-h-72 w-full object-cover" />
              )}
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
            >
              <div className="flex items-center gap-2">
                <ImagePlus size={26} />
                <Film size={26} />
              </div>
              <span className="text-sm font-semibold">Elegir foto o video</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Camera size={12} /> cámara o galería
              </span>
            </button>
          )}

          {/* Ubicación en el mapa de actividades */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">¿Dónde fue?</p>
          <div className="mt-2">
            <PhotoPlacePicker value={place} onChange={setPlace} />
          </div>

          {/* Álbum */}
          <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <FolderPlus size={12} /> Álbum <span className="font-normal lowercase text-gray-300">(opcional)</span>
          </p>
          <input
            list="album-suggestions"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Ej: Rosedal, Cena, San Telmo…"
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
          />
          <datalist id="album-suggestions">
            {existingAlbums.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          {existingAlbums.length > 0 && !album && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {existingAlbums.slice(0, 6).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlbum(a)}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-200"
                >
                  {a}
                </button>
              ))}
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
            {busy ? 'Subiendo…' : isVideo ? 'Subir video' : 'Subir foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
