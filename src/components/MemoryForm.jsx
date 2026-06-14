import { useRef, useState } from 'react'
import { X, ImagePlus, Camera } from 'lucide-react'
import { addMemory, MEMORY_KINDS } from '../lib/memories'
import { AUTHORS } from '../lib/ratings'

const today = () => new Date().toISOString().slice(0, 10)
const LAST_AUTHOR = 'memoryAuthor'

export default function MemoryForm({ onClose }) {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [kind, setKind] = useState(MEMORY_KINDS[0].id)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [author, setAuthor] = useState(() => localStorage.getItem(LAST_AUTHOR) || AUTHORS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Ponele un título al recuerdo.')
      return
    }
    setBusy(true)
    setError('')
    try {
      localStorage.setItem(LAST_AUTHOR, author)
      await addMemory({ title, note, kind, date, author, file })
      onClose()
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar. Probá de nuevo.')
      setBusy(false)
    }
  }

  const label = 'mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400'

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
          <h3 className="text-lg font-bold text-gray-900">Nuevo recuerdo</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {/* Foto (opcional) */}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
          {preview ? (
            <button onClick={() => fileRef.current?.click()} className="mt-4 block w-full overflow-hidden rounded-2xl">
              <img src={preview} alt="preview" className="max-h-72 w-full object-cover" />
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
            >
              <ImagePlus size={26} />
              <span className="text-sm font-semibold">Agregar foto</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Camera size={12} /> opcional
              </span>
            </button>
          )}

          {/* Tipo */}
          <p className={label}>Tipo</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEMORY_KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  kind === k.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {k.emoji} {k.label}
              </button>
            ))}
          </div>

          {/* Título */}
          <p className={label}>Título</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: nuestra primera cita ❤️"
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
          />

          {/* Nota */}
          <p className={label}>
            Nota <span className="font-normal lowercase text-gray-300">(opcional)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Contá un poco más…"
            className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />

          {/* Fecha */}
          <p className={label}>Fecha</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
          />

          {/* Autor */}
          <p className={label}>¿Quién lo agrega?</p>
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

          {error && <p className="mt-3 text-xs font-medium text-rose-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {busy ? 'Guardando…' : 'Guardar recuerdo'}
          </button>
        </div>
      </div>
    </div>
  )
}
