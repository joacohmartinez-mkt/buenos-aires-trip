import { useEffect, useRef, useState } from 'react'
import { Star, X, ImagePlus, Trash2 } from 'lucide-react'
import { AUTHORS, getRatingBy, saveRating, deleteRating } from '../lib/ratings'
import { getPhotosByEvent, photoUrl, uploadPhoto, loadPhotos, onPhotosChange } from '../lib/photos'
import { typeStyle } from '../lib/styles'
import Lightbox from './Lightbox'

export default function RatingModal({ spot, onClose }) {
  const [author, setAuthor] = useState(AUTHORS[0])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [, setPv] = useState(0)
  const [lb, setLb] = useState(null)
  const fileRef = useRef(null)

  // Al abrir o cambiar de autor, precargar la calificación existente.
  useEffect(() => {
    const existing = getRatingBy(spot.id, author)
    setRating(existing?.rating ?? 0)
    setComment(existing?.comment ?? '')
    setHover(0)
  }, [spot.id, author])

  useEffect(() => {
    loadPhotos()
    return onPhotosChange(() => setPv((v) => v + 1))
  }, [])

  const style = typeStyle(spot.type)
  const photos = getPhotosByEvent(spot.id)
  const existing = getRatingBy(spot.id, author)

  async function handleSave() {
    if (!rating || saving) return
    setSaving(true)
    try {
      await saveRating({ spot_id: spot.id, spot_name: spot.name, rating, comment: comment.trim(), author })
      onClose()
    } catch (e) {
      console.error('No se pudo guardar la calificación', e)
      setSaving(false)
    }
  }

  async function handleDeleteRating() {
    if (!window.confirm(`¿Borrar la calificación de ${author}?`)) return
    setSaving(true)
    try {
      await deleteRating(spot.id, author)
      onClose()
    } catch {
      setSaving(false)
    }
  }

  async function addPhoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploadingPhoto(true)
    try {
      await uploadPhoto(f, { eventId: spot.id })
    } catch (err) {
      console.error(err)
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  const label = 'mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400'

  return (
    <>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="animate-fade-in max-h-[92vh] w-full max-w-app overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{style.emoji}</span>
              <div>
                <h3 className="text-lg font-bold leading-tight text-gray-900">{spot.name}</h3>
                <p className="text-xs text-gray-400">{spot.address}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Autor */}
          <p className={label}>¿Quién califica?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AUTHORS.map((a) => (
              <button
                key={a}
                onClick={() => setAuthor(a)}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  author === a ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Estrellas */}
          <p className={label}>Tu puntaje</p>
          <div className="mt-2 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const filled = i <= (hover || rating)
              return (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${i} estrellas`}
                >
                  <Star size={36} className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} strokeWidth={2} />
                </button>
              )
            })}
          </div>

          {/* Comentario */}
          <p className={label}>
            Comentario <span className="font-normal lowercase text-gray-300">(opcional)</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="¿Qué les pareció?"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />

          {/* Fotos del lugar */}
          <p className={label}>Fotos del lugar</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={addPhoto} className="hidden" />
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {photos.map((p, i) => (
              <button key={p.id} onClick={() => setLb(i)} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img src={photoUrl(p.path)} alt={p.caption || 'foto'} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <span className="text-[9px] font-semibold">Subiendo…</span>
              ) : (
                <>
                  <ImagePlus size={16} />
                  <span className="text-[9px] font-semibold">Foto</span>
                </>
              )}
            </button>
          </div>

          {/* Guardar / borrar calificación */}
          <div className="mt-5 flex gap-2">
            {existing && (
              <button
                onClick={handleDeleteRating}
                disabled={saving}
                className="flex items-center justify-center rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                aria-label="Borrar calificación"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!rating || saving}
              className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? 'Guardando…' : existing ? 'Guardar cambios' : 'Guardar calificación'}
            </button>
          </div>
        </div>
      </div>

      {lb != null && <Lightbox photos={photos} initialIndex={lb} onClose={() => setLb(null)} />}
    </>
  )
}
