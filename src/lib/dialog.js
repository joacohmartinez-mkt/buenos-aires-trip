// Diálogos de confirmación propios (reemplazan window.confirm / window.alert).
// ConfirmHost (montado en App) registra el handler; confirmDialog() devuelve
// una promesa que resuelve true/false. Si el host no está montado todavía,
// cae al confirm nativo para no bloquear.

let handler = null

export function registerDialogHandler(h) {
  handler = h
  return () => {
    if (handler === h) handler = null
  }
}

/**
 * opts: {
 *   title: string,
 *   message?: string,
 *   confirmLabel?: string   (default "Confirmar")
 *   cancelLabel?: string|null (default "Cancelar"; null = solo un botón, estilo alert)
 *   danger?: boolean        (rojo en el botón de confirmar)
 * }
 * → Promise<boolean>
 */
export function confirmDialog(opts) {
  if (handler) return handler(opts)
  const text = [opts.title, opts.message].filter(Boolean).join('\n')
  return Promise.resolve(opts.cancelLabel === null ? (window.alert(text), true) : window.confirm(text))
}

// Azúcar para el caso "alert": un solo botón.
export function alertDialog(title, message = '') {
  return confirmDialog({ title, message, confirmLabel: 'OK', cancelLabel: null })
}
