import { useEffect, useRef, useState } from 'react'
import { Heart, Lock } from 'lucide-react'
import { verifyAppPin, unlockApp } from '../lib/appAccess'

const PIN_LENGTH = 4

// Pantalla de entrada de la app: foto de portada + PIN de la pareja.
export default function LockScreen() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const [opening, setOpening] = useState(false)
  const inputRef = useRef(null)

  // Al completar los 4 dígitos, probar automáticamente.
  useEffect(() => {
    if (pin.length !== PIN_LENGTH || checking) return
    let alive = true
    setChecking(true)
    verifyAppPin(pin).then((ok) => {
      if (!alive) return
      if (ok) {
        // Pausa breve con el corazón lleno y recién ahí entrar.
        setOpening(true)
        setTimeout(unlockApp, 600)
      } else {
        setError(true)
        setPin('')
        setChecking(false)
        setTimeout(() => setError(false), 900)
      }
    })
    return () => {
      alive = false
    }
  }, [pin, checking])

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    setPin(digits)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden bg-gray-900">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-rose-950/80" />

      {/* Contenido */}
      <div
        className={[
          'relative flex w-full max-w-xs flex-col items-center px-6 text-center transition-all duration-500',
          opening ? 'scale-110 opacity-0' : 'opacity-100',
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
        <p className="mt-6 text-xs font-medium uppercase tracking-widest text-white/60">
          Nuestro número
        </p>

        {/* Cajitas del PIN (el input real está invisible encima) */}
        <label className={['relative mt-3 block cursor-text', error ? 'animate-shake' : ''].join(' ')}>
          <input
            ref={inputRef}
            autoFocus
            value={pin}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
            type="password"
            autoComplete="off"
            aria-label="PIN de entrada"
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
          />
          <span className="flex gap-2.5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => {
              const filled = i < pin.length
              return (
                <span
                  key={i}
                  className={[
                    'flex h-14 w-12 items-center justify-center rounded-2xl border text-2xl font-bold text-white backdrop-blur transition-all',
                    filled
                      ? 'border-rose-300/70 bg-white/20'
                      : 'border-white/25 bg-white/10',
                    error ? 'border-rose-400' : '',
                  ].join(' ')}
                >
                  {filled ? '•' : ''}
                </span>
              )
            })}
          </span>
        </label>

        <p
          className={[
            'mt-4 h-5 text-sm font-medium transition-opacity',
            error ? 'text-rose-300 opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-live="polite"
        >
          Ese no es nuestro número 💔
        </p>

        <p className="mt-10 text-[11px] text-white/40">
          Un rincón solo para nosotros dos ✨
        </p>
      </div>
    </div>
  )
}
