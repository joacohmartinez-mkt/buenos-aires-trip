import { useCallback, useEffect, useState } from 'react'
import { Heart, Lock, Delete } from 'lucide-react'
import { verifyAppPin, unlockApp } from '../lib/appAccess'

const PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', 'del']

// Pantalla de entrada: portada + teclado numérico propio (no depende del
// teclado del sistema, que en mobile daba problemas de foco/autofill).
export default function LockScreen() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const [opening, setOpening] = useState(false)

  const submit = useCallback(async (candidate) => {
    setChecking(true)
    const ok = await verifyAppPin(candidate)
    if (ok) {
      setOpening(true)
      setTimeout(unlockApp, 600)
    } else {
      setError(true)
      setTimeout(() => {
        setPin('')
        setError(false)
        setChecking(false)
      }, 700)
    }
  }, [])

  const press = useCallback(
    (key) => {
      if (checking || opening) return
      if (key === 'del') {
        setError(false)
        setPin((p) => p.slice(0, -1))
        return
      }
      setPin((p) => {
        if (p.length >= PIN_LENGTH) return p
        const next = p + key
        if (next.length === PIN_LENGTH) submit(next)
        return next
      })
    },
    [checking, opening, submit]
  )

  // Teclado físico (para PC).
  useEffect(() => {
    function onKey(e) {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-between overflow-hidden bg-gray-900">
      {/* Foto de fondo con velo cálido */}
      <img
        src="./portada.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-rose-950/85" />

      {/* Cabecera */}
      <div
        className={[
          'relative flex flex-col items-center px-6 pt-16 text-center transition-all duration-500',
          opening ? 'scale-105 opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-lg ring-1 ring-white/30 backdrop-blur',
            opening ? 'animate-pulse' : '',
          ].join(' ')}
        >
          {opening ? <Heart size={28} className="fill-rose-400 text-rose-400" /> : <Lock size={26} />}
        </div>

        <h1 className="mt-5 font-display text-5xl font-bold leading-none text-white drop-shadow-md">
          Buenos Aires
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/90">
          Joaquín & Nicole <span className="text-rose-300">❤️</span>
        </p>
        <p className="mt-8 text-xs font-medium uppercase tracking-widest text-white/60">
          Nuestro número
        </p>

        {/* Puntos del PIN */}
        <div className={['mt-4 flex gap-4', error ? 'animate-shake' : ''].join(' ')} aria-live="polite">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length
            return (
              <span
                key={i}
                className={[
                  'h-4 w-4 rounded-full border-2 transition-all',
                  error
                    ? 'border-rose-400 bg-rose-400'
                    : filled
                    ? 'border-white bg-white'
                    : 'border-white/50 bg-transparent',
                ].join(' ')}
              />
            )
          })}
        </div>

        <p
          className={[
            'mt-4 h-5 text-sm font-medium transition-opacity',
            error ? 'text-rose-300 opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          Ese no es nuestro número 💔
        </p>
      </div>

      {/* Teclado numérico propio */}
      <div
        className={[
          'relative w-full max-w-xs px-8 pb-10 transition-all duration-500',
          opening ? 'translate-y-4 opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <div className="grid grid-cols-3 gap-4">
          {KEYS.map((key, i) => {
            if (key === null) return <span key={i} />
            const isDel = key === 'del'
            return (
              <button
                key={i}
                type="button"
                onClick={() => press(key)}
                disabled={checking || opening}
                aria-label={isDel ? 'Borrar' : key}
                className={[
                  'flex h-16 w-16 items-center justify-center justify-self-center rounded-full text-2xl font-semibold text-white transition-transform active:scale-90 disabled:opacity-40',
                  isDel
                    ? 'text-white/80'
                    : 'bg-white/15 ring-1 ring-white/25 backdrop-blur hover:bg-white/25',
                ].join(' ')}
              >
                {isDel ? <Delete size={24} /> : key}
              </button>
            )
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/40">
          Un rincón solo para nosotros dos ✨
        </p>
      </div>
    </div>
  )
}
