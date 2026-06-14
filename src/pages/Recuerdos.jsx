import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { getMemories, loadMemories, onMemoriesChange } from '../lib/memories'
import MemoryCard from '../components/MemoryCard'
import MemoryForm from '../components/MemoryForm'

// Índice "del día": estable durante el día, cambia cada jornada.
function dailyIndex(len) {
  if (len <= 0) return 0
  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
  return seed % len
}

export default function Recuerdos() {
  const [, setV] = useState(0)
  // null = cerrado · { memory: null } = nuevo · { memory } = editando
  const [form, setForm] = useState(null)

  useEffect(() => {
    loadMemories()
    return onMemoriesChange(() => setV((v) => v + 1))
  }, [])

  const openNew = () => setForm({ memory: null })
  const openEdit = (m) => setForm({ memory: m })

  const memories = getMemories()
  const featured = memories.length >= 3 ? memories[dailyIndex(memories.length)] : null

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-400 px-5 pb-7 pt-7 text-white">
        <h1 className="font-display text-3xl font-bold drop-shadow-sm">Recuerdos</h1>
        <p className="mt-0.5 text-sm font-medium text-white/90">
          {memories.length === 0
            ? 'El muro de momentos de ustedes dos'
            : `💞 ${memories.length} ${memories.length === 1 ? 'recuerdo guardado' : 'recuerdos juntos'}`}
        </p>
      </div>

      {/* Botón agregar */}
      <div className="px-4">
        <button
          onClick={openNew}
          className="-mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800"
        >
          <Plus size={18} /> Agregar recuerdo
        </button>
      </div>

      {/* Recuerdo del día */}
      {featured && (
        <div className="mt-7 px-6">
          <MemoryCard memory={featured} featured defaultOpen onEdit={openEdit} />
        </div>
      )}

      {/* Muro */}
      {memories.length === 0 ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div className="mt-8 space-y-8 px-6">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} rotate={i % 2 === 0 ? 1.2 : -1.2} onEdit={openEdit} />
          ))}
        </div>
      )}

      {form && <MemoryForm memory={form.memory} onClose={() => setForm(null)} />}
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="mt-8 px-6 text-center">
      <p className="text-sm font-medium text-gray-400">
        Todavía no hay recuerdos. Guarden el primero <span className="text-rose-400">❤️</span>
      </p>
      <button
        onClick={onAdd}
        className="mx-auto mt-5 block w-full max-w-xs rotate-[-1.5deg] rounded-2xl border-2 border-dashed border-gray-300 bg-white py-12 text-gray-400 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50/40 hover:text-rose-400"
      >
        <Plus size={28} className="mx-auto" />
        <span className="mt-2 block text-sm font-semibold">Crear un recuerdo</span>
      </button>
    </div>
  )
}
