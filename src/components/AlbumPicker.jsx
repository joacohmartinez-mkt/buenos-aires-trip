import { useMemo, useState } from 'react'
import { X, Folder, FolderPlus, Check, Ban } from 'lucide-react'
import { getAlbums } from '../lib/photos'

// Bottom sheet para elegir un álbum destino (o quitar de álbum).
// Reutilizable desde: modo seleccionar en Photos, Lightbox, futuro.
//
// Props:
//   title:        string   (default "Mover a álbum")
//   currentAlbum: string|null — resalta el álbum actual y no lo ofrece como destino
//   onPick(name)  — se llama con nombre nuevo o null para "Sin álbum"
//   onClose()
export default function AlbumPicker({
  title = 'Mover a álbum',
  currentAlbum = null,
  onPick,
  onClose,
}) {
  const [newName, setNewName] = useState('')

  const albums = useMemo(() => getAlbums().filter((a) => a.name !== null), [])

  function submitNew(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onPick(name)
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in flex max-h-[80vh] w-full max-w-app flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-3 py-3">
          {/* Álbum nuevo */}
          <form onSubmit={submitNew} className="mb-2 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 focus-within:border-gray-400 focus-within:bg-white">
            <FolderPlus size={18} className="shrink-0 text-gray-400" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Crear álbum nuevo…"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="shrink-0 rounded-lg bg-gray-900 px-3 py-1 text-xs font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              Crear
            </button>
          </form>

          {/* Sin álbum */}
          <button
            onClick={() => onPick(null)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <Ban size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-gray-800">Sin álbum</span>
              <span className="block text-[11px] text-gray-500">Sacar del álbum actual</span>
            </span>
            {currentAlbum === null && <Check size={16} className="text-emerald-500" />}
          </button>

          {/* Álbumes existentes */}
          {albums.map((a) => {
            const isCurrent = currentAlbum === a.name
            return (
              <button
                key={a.name}
                onClick={() => (isCurrent ? onClose() : onPick(a.name))}
                disabled={isCurrent}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <Folder size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-gray-800">{a.name}</span>
                  <span className="block text-[11px] text-gray-500">
                    {a.count} {a.count === 1 ? 'foto/video' : 'fotos/videos'}
                  </span>
                </span>
                {isCurrent && <Check size={16} className="text-emerald-500" />}
              </button>
            )
          })}

          {albums.length === 0 && (
            <p className="mt-2 px-3 py-4 text-center text-xs text-gray-400">
              Todavía no hay álbumes. Creá uno arriba.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
