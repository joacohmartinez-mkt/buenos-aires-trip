import { useState } from 'react'
import { Lock, Unlock, X } from 'lucide-react'
import { useEditMode, tryUnlock, lock } from '../lib/editAccess'
import UnlockHeart from './UnlockHeart'

export default function EditFab() {
  const editing = useEditMode()
  const [showPin, setShowPin] = useState(false)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const [showUnlock, setShowUnlock] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (await tryUnlock(pin)) {
      setShowPin(false)
      setPin('')
      setErr(false)
      setShowUnlock(true)
    } else {
      setErr(true)
      setPin('')
    }
  }

  return (
    <>
      <button
        onClick={() => (editing ? lock() : setShowPin(true))}
        className={`fixed bottom-24 right-4 z-[900] flex h-12 items-center gap-2 rounded-full px-4 shadow-lg transition ${
          editing ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
        }`}
      >
        {editing ? <Unlock size={18} /> : <Lock size={18} />}
        <span className="text-sm font-bold">{editing ? 'Editando' : 'Editar'}</span>
      </button>

      {showPin && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowPin(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="animate-fade-in w-full max-w-xs rounded-3xl bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">PIN para editar</h3>
              <button type="button" onClick={() => setShowPin(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>
            <input
              autoFocus
              inputMode="numeric"
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setErr(false)
              }}
              placeholder="••••"
              className={`mt-4 w-full rounded-xl border bg-gray-50 px-3 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none ${
                err ? 'border-rose-400' : 'border-gray-200'
              }`}
            />
            {err && <p className="mt-2 text-center text-xs text-rose-500">PIN incorrecto</p>}
            <button type="submit" className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white">
              Entrar
            </button>
          </form>
        </div>
      )}

      {showUnlock && <UnlockHeart onDone={() => setShowUnlock(false)} />}
    </>
  )
}
