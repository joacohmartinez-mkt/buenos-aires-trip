import { Star } from 'lucide-react'

// Muestra un rating promedio con estrellas (medias incluidas) y, opcional, el
// conteo de reseñas.
export default function Stars({ value = 0, count = null, size = 16 }) {
  const rounded = Math.round(value * 10) / 10
  const label =
    value > 0
      ? `${rounded} de 5 estrellas${count != null && count > 0 ? ` con ${count} ${count === 1 ? 'reseña' : 'reseñas'}` : ''}`
      : 'Sin calificar'
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={label}>
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)))
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-gray-300" strokeWidth={2} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400 fill-amber-400" strokeWidth={2} />
              </span>
            </span>
          )
        })}
      </div>
      {value > 0 && (
        <span className="text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
      )}
      {count != null && count > 0 && (
        <span className="text-xs text-gray-400">
          ({count} {count === 1 ? 'reseña' : 'reseñas'})
        </span>
      )}
    </div>
  )
}
