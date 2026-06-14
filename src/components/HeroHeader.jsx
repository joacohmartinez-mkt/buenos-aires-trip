import { TRIP } from '../data/trip'

// Foto del hero (Joaquín & Nicole ❤️). El archivo está en public/portada.jpg.
// Si la imagen no carga, se muestra automáticamente la ilustración del skyline.
// Para cambiarla: reemplazá public/portada.jpg por otra con el mismo nombre.
const HERO_IMAGE = './portada.jpg'

export default function HeroHeader() {
  return (
    <header className="relative h-80 overflow-hidden">
      {/* Cielo de atardecer porteño */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-rose-500 to-amber-300" />

      {/* Resplandor del sol bajo en el horizonte */}
      <div className="absolute left-1/2 top-[55%] h-40 w-40 -translate-x-1/2 rounded-full bg-amber-200/80 blur-2xl" />
      <div className="absolute left-1/2 top-[58%] h-20 w-20 -translate-x-1/2 rounded-full bg-yellow-100/90 blur-md" />

      {/* Skyline ilustrado de Buenos Aires con el Obelisco */}
      <Skyline />

      {/* Foto por encima de la ilustración (con fallback si falla) */}
      {HERO_IMAGE && (
        <img
          src={HERO_IMAGE}
          alt="Tango en Buenos Aires"
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}

      {/* Velo oscuro para legibilidad del texto sobre la foto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

      {/* Contenido */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
          {TRIP.badge}
        </span>
        <h1 className="mt-2 font-display text-5xl font-bold leading-none text-white drop-shadow-md">
          {TRIP.city}
        </h1>
        <p className="mt-1 text-lg font-semibold text-white/95 drop-shadow">
          {TRIP.couple} <span className="text-rose-300">❤️</span>
        </p>
      </div>
    </header>
  )
}

function Skyline() {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 h-44 w-full"
      viewBox="0 0 640 180"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* Edificios lejanos */}
      <g className="text-indigo-950/40" fill="currentColor">
        <rect x="20" y="95" width="36" height="85" />
        <rect x="70" y="110" width="28" height="70" />
        <rect x="430" y="100" width="40" height="80" />
        <rect x="520" y="115" width="30" height="65" />
        <rect x="580" y="90" width="40" height="90" />
      </g>
      {/* Edificios cercanos */}
      <g className="text-indigo-950/80" fill="currentColor">
        <rect x="0" y="120" width="50" height="60" />
        <rect x="110" y="105" width="44" height="75" />
        <rect x="160" y="125" width="34" height="55" />
        <rect x="240" y="118" width="46" height="62" />
        <rect x="360" y="112" width="42" height="68" />
        <rect x="470" y="122" width="38" height="58" />
        <rect x="548" y="128" width="34" height="52" />
        {/* Cúpula tipo Congreso */}
        <circle cx="210" cy="118" r="16" />
        <rect x="200" y="118" width="20" height="62" />
      </g>
      {/* Obelisco */}
      <g className="text-white/90" fill="currentColor">
        <polygon points="312,40 320,30 328,40 326,180 314,180" />
        <rect x="305" y="172" width="30" height="8" className="text-indigo-950/80" fill="currentColor" />
      </g>
    </svg>
  )
}
