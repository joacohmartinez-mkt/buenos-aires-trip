// Estilos temáticos por TIPO de lugar y por DÍA.
// Se usan strings de clase completos (no interpolados) para que Tailwind no los
// purgue del build final.

export const TYPE_STYLES = {
  alojamiento: {
    emoji: '🏠',
    label: 'Alojamiento',
    marker: '#f59e0b',
    dot: 'bg-amber-500',
    chipBg: 'bg-amber-100',
    chipText: 'text-amber-700',
  },
  paseo: {
    emoji: '🚶',
    label: 'Paseo',
    marker: '#0ea5e9',
    dot: 'bg-sky-500',
    chipBg: 'bg-sky-100',
    chipText: 'text-sky-700',
  },
  gastronomia: {
    emoji: '🍽️',
    label: 'Gastronomía',
    marker: '#f97316',
    dot: 'bg-orange-500',
    chipBg: 'bg-orange-100',
    chipText: 'text-orange-700',
  },
  cultura: {
    emoji: '🎨',
    label: 'Cultura',
    marker: '#8b5cf6',
    dot: 'bg-violet-500',
    chipBg: 'bg-violet-100',
    chipText: 'text-violet-700',
  },
  'aire-libre': {
    emoji: '🌳',
    label: 'Aire libre',
    marker: '#10b981',
    dot: 'bg-emerald-500',
    chipBg: 'bg-emerald-100',
    chipText: 'text-emerald-700',
  },
  hamburgueseria: {
    emoji: '🍔',
    label: 'Hamburguesería',
    marker: '#ef4444',
    dot: 'bg-red-500',
    chipBg: 'bg-red-100',
    chipText: 'text-red-700',
  },
  bar: {
    emoji: '🍸',
    label: 'Bar',
    marker: '#6366f1',
    dot: 'bg-indigo-500',
    chipBg: 'bg-indigo-100',
    chipText: 'text-indigo-700',
  },
  teatro: {
    emoji: '🎭',
    label: 'Teatro',
    marker: '#f43f5e',
    dot: 'bg-rose-500',
    chipBg: 'bg-rose-100',
    chipText: 'text-rose-700',
  },
  ciencia: {
    emoji: '🪐',
    label: 'Ciencia',
    marker: '#3b82f6',
    dot: 'bg-blue-500',
    chipBg: 'bg-blue-100',
    chipText: 'text-blue-700',
  },
  ferry: {
    emoji: '⛴️',
    label: 'Ferry',
    marker: '#0d9488',
    dot: 'bg-teal-500',
    chipBg: 'bg-teal-100',
    chipText: 'text-teal-700',
  },
  otro: {
    emoji: '📍',
    label: 'Otro',
    marker: '#64748b',
    dot: 'bg-slate-500',
    chipBg: 'bg-slate-100',
    chipText: 'text-slate-700',
  },
}

export const typeStyle = (type) => TYPE_STYLES[type] ?? TYPE_STYLES.paseo

export const DAY_THEMES = {
  amber: {
    activeTab: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
    text: 'text-amber-600',
    soft: 'bg-amber-50',
    border: 'border-amber-200',
    line: 'bg-amber-200',
    gradient: 'from-amber-400 to-orange-500',
  },
  emerald: {
    activeTab: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    text: 'text-emerald-600',
    soft: 'bg-emerald-50',
    border: 'border-emerald-200',
    line: 'bg-emerald-200',
    gradient: 'from-emerald-400 to-teal-500',
  },
  rose: {
    activeTab: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
    text: 'text-rose-600',
    soft: 'bg-rose-50',
    border: 'border-rose-200',
    line: 'bg-rose-200',
    gradient: 'from-rose-400 to-pink-500',
  },
  sky: {
    activeTab: 'bg-sky-500 text-white shadow-lg shadow-sky-500/30',
    text: 'text-sky-600',
    soft: 'bg-sky-50',
    border: 'border-sky-200',
    line: 'bg-sky-200',
    gradient: 'from-sky-400 to-blue-500',
  },
}

export const dayTheme = (color) => DAY_THEMES[color] ?? DAY_THEMES.amber
