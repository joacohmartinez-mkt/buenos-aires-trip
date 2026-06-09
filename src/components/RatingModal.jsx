import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import { AUTHORS, getRatingBy, saveRating } from '../lib/ratings'
import { typeStyle } from '../lib/styles'

export default function RatingModal({ spot, onClose }) {
  const [author, setAuthor] = useState(AUTHORS[0])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  // Al abrir el modal o cambiar de autor, precargar la calificación existente.
  useEffect(() => {
    const existing = getRatingBy(spot.id, author)
    setRating(existing?.rating ?? 0)
    setComment(existing?.comment ?? '')
    setHover(0)
  }, [spot.id, author])

  const style = typeStyle(spot.type)

  async function handleSave() {
    if (!rating || saving) return
    setSaving(true)
    try {
      await saveRating({
        spot_id: spot.id,
        spot_name: spot.name,
        rating,
        comment: comment.trim(),
        author,
      })
      onClose()
    } catch (e) {
      console.error('No se pudo guardar la calificación', e)
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in w-full max-w-app rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
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
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Autor */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          ¿Quién califica?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {AUTHORS.map((a) => (
            <button
              key={a}
              onClick={() => setAuthor(a)}
              className={[
                'rounded-xl py-2.5 text-sm font-semibold transition-colors',
                author === a
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Estrellas */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Tu puntaje
        </p>
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
                <Star
                  size={36}
                  className={filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                  strokeWidth={2}
                />
              </button>
            )
          })}
        </div>

        {/* Comentario */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Comentario <span className="font-normal lowercase text-gray-300">(opcional)</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="¿Qué les pareció?"
          className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />

        <button
          onClick={handleSave}
          disabled={!rating || saving}
          className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? 'Guardando…' : 'Guardar calificación'}
        </button>
      </div>
    </div>
  )
}
