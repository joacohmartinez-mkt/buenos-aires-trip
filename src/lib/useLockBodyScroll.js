import { useEffect } from 'react'

// Bloquea el scroll del body mientras un modal/sheet está montado.
// Cuenta los locks activos para soportar modales anidados (ej: AlbumPicker
// arriba del Lightbox).
let locks = 0

export default function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return
    locks += 1
    if (locks === 1) document.body.style.overflow = 'hidden'
    return () => {
      locks -= 1
      if (locks === 0) document.body.style.overflow = ''
    }
  }, [active])
}
