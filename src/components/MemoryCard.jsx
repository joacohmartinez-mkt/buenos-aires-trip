import { Heart, Trash2 } from 'lucide-react'
import { kindById, kindTone, memoryPhotoUrl, addHeart, deleteMemory } from '../lib/memories'

// Fecha 'YYYY-MM-DD' → '14 jun 2026'
function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function MemoryCard({ memory, rotate = 0, featured = false }) {
  const kind = kindById(memory.kind)
  const url = memoryPhotoUrl(memory.path)

  async function handleDelete() {
    if (!window.confirm('¿Borrar este recuerdo?')) return
    try {
      await deleteMemory(memory)
    } catch (e) {
      console.error('No se pudo borrar el recuerdo', e)
    }
  }

  return (
    <div className="relative" style={{ transform: `rotate(${rotate}deg)` }}>
      {/* Cinta washi arriba */}
      <span className="absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-amber-200/80 shadow-sm ring-1 ring-amber-300/40" />

      <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
        {url && (
          <img
            src={url}
            alt={memory.title || 'recuerdo'}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        )}

        <div className={url ? 'mt-3' : ''}>
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${kindTone(memory.kind)}`}>
              {kind.emoji} {kind.label}
            </span>
            <span className="text-[11px] font-medium text-gray-400">{formatDate(memory.memory_date)}</span>
          </div>

          {memory.title && (
            <h3 className="mt-2 font-display text-lg font-semibold leading-tight text-gray-900">{memory.title}</h3>
          )}
          {memory.note && <p className="mt-1 text-sm leading-snug text-gray-600">{memory.note}</p>}

          <div className="mt-3 flex items-center justify-between">
            {memory.author ? (
              <span className="text-xs italic text-gray-400">— {memory.author}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => addHeart(memory)}
                className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-500 transition-transform active:scale-90"
                aria-label="Sumar un corazón"
              >
                <Heart size={14} className="fill-rose-500" />
                {memory.hearts > 0 && memory.hearts}
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-300 transition-colors hover:text-rose-400"
                aria-label="Borrar recuerdo"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {featured && (
        <span className="absolute -right-2 -top-3 z-10 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          ✨ Recuerdo del día
        </span>
      )}
    </div>
  )
}
