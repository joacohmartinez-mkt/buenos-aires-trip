import { useState } from 'react'
import { Heart, Trash2, ChevronDown, Pencil } from 'lucide-react'
import { kindById, kindTone, memoryPhotoUrl, deleteMemory } from '../lib/memories'

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

export default function MemoryCard({ memory, rotate = 0, featured = false, defaultOpen = false, onEdit, onLike, who, editing = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const kind = kindById(memory.kind)
  const url = memoryPhotoUrl(memory.path)
  const likeCount = memory.liked_by?.length ?? 0
  const liked = Boolean(who && memory.liked_by?.includes(who))

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm('¿Borrar este recuerdo?')) return
    if (!window.confirm('¿Estás muy seguro? Esta acción no se puede deshacer.')) return
    try {
      await deleteMemory(memory)
    } catch (err) {
      console.error('No se pudo borrar el recuerdo', err)
    }
  }

  function handleLike(e) {
    e.stopPropagation()
    onLike?.(memory)
  }

  function handleEdit(e) {
    e.stopPropagation()
    onEdit?.(memory)
  }

  const chip = (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${kindTone(memory.kind)}`}>
      {kind.emoji} {kind.label}
    </span>
  )

  return (
    <div
      className="relative transition-transform duration-200"
      style={{ transform: `rotate(${open ? 0 : rotate}deg)` }}
    >
      {/* Cinta washi arriba */}
      <span className="absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-amber-200/80 shadow-sm ring-1 ring-amber-300/40" />

      {open ? (
        // ── Expandido: página de cuaderno ─────────────────────────────
        <div
          onClick={() => setOpen(false)}
          className="animate-fade-in cursor-pointer overflow-hidden rounded-2xl bg-[#fffdf6] p-4 shadow-xl ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between gap-2">
            {chip}
            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
              {formatDate(memory.memory_date)}
              <ChevronDown size={14} className="rotate-180" />
            </span>
          </div>

          {url && (
            <img
              src={url}
              alt={memory.title || 'recuerdo'}
              loading="lazy"
              className="mt-3 max-h-72 w-full rounded-lg object-cover shadow-sm"
            />
          )}

          {memory.title && (
            <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-gray-900">{memory.title}</h3>
          )}

          {memory.note && (
            <div className="relative mt-2">
              <span className="absolute bottom-0 left-7 top-0 w-px bg-rose-300/70" />
              <p className="notebook-lines whitespace-pre-wrap pl-11 pr-1 text-[15px] text-gray-700">{memory.note}</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            {memory.author ? (
              <span className="font-display text-sm italic text-gray-500">— {memory.author}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-transform active:scale-90 ${
                  liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'
                }`}
                aria-label={liked ? 'Quitar mi me gusta' : 'Me gusta'}
              >
                <Heart size={14} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
                {likeCount > 0 && likeCount}
              </button>
              {editing && (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-gray-300 transition-colors hover:text-gray-600"
                    aria-label="Editar recuerdo"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-300 transition-colors hover:text-rose-400"
                    aria-label="Borrar recuerdo"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ── Colapsado: notita pegada (título + adelanto) ───────────────
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-2xl bg-white p-3.5 shadow-lg ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between gap-2">
            {chip}
            <span className="text-[11px] font-medium text-gray-400">{formatDate(memory.memory_date)}</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {memory.title && (
                <h3 className="line-clamp-1 font-display text-base font-semibold leading-tight text-gray-900">
                  {memory.title}
                </h3>
              )}
              <p className="mt-0.5 truncate text-sm text-gray-400">
                {url && '📷 '}
                {memory.note || 'Ver recuerdo'}
              </p>
            </div>
            <ChevronDown size={16} className="shrink-0 text-gray-300" />
          </div>
        </div>
      )}

      {featured && (
        <span className="absolute -right-2 -top-3 z-10 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          ✨ Recuerdo del día
        </span>
      )}
    </div>
  )
}
