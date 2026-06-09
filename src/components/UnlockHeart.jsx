import { useEffect } from 'react'

// Animación que se muestra al desbloquear con el PIN correcto: un candado que se
// abre y revela un corazón. Se cierra solo (~1.5s).
export default function UnlockHeart({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="uh-overlay fixed inset-0 z-[1300] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <svg viewBox="0 0 100 120" className="h-28 w-28 drop-shadow-xl">
        <path
          className="uh-shackle"
          d="M30 55 V38 a20 20 0 0 1 40 0 V55"
          fill="none"
          stroke="white"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <rect x="20" y="52" width="60" height="50" rx="12" fill="white" />
        <path
          className="uh-heart"
          d="M50 90 C 39 81, 32 73, 38 67 C 41 63, 47 63, 50 68 C 53 63, 59 63, 62 67 C 68 73, 61 81, 50 90 Z"
          fill="#fb7185"
        />
      </svg>
      <p className="mt-3 text-base font-bold text-white">¡Desbloqueado! 💗</p>
    </div>
  )
}
