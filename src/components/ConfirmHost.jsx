import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { registerDialogHandler } from '../lib/dialog'
import useLockBodyScroll from '../lib/useLockBodyScroll'

// Host global de confirmaciones. Montar UNA vez en App.
// Renderiza un bottom sheet (mobile) / diálogo centrado (desktop) con la
// estética de la app, en reemplazo de window.confirm / alert.
export default function ConfirmHost() {
  const [dialog, setDialog] = useState(null) // { opts, resolve } | null

  useEffect(
    () =>
      registerDialogHandler(
        (opts) =>
          new Promise((resolve) => {
            setDialog({ opts, resolve })
          })
      ),
    []
  )

  useLockBodyScroll(!!dialog)

  if (!dialog) return null
  const { opts, resolve } = dialog
  const close = (result) => {
    setDialog(null)
    resolve(result)
  }
  const isAlert = opts.cancelLabel === null

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => close(false)}
      role="dialog"
      aria-modal="true"
      aria-label={opts.title}
    >
      <div
        className="animate-fade-in w-full max-w-app rounded-t-3xl bg-white p-5 pb-7 sm:max-w-sm sm:rounded-3xl sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {opts.danger && (
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertTriangle size={22} />
          </div>
        )}
        <h3 className="text-base font-bold text-gray-900">{opts.title}</h3>
        {opts.message && <p className="mt-1 text-sm text-gray-500">{opts.message}</p>}

        <div className="mt-5 flex gap-2">
          {!isAlert && (
            <button
              onClick={() => close(false)}
              className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200"
            >
              {opts.cancelLabel || 'Cancelar'}
            </button>
          )}
          <button
            autoFocus
            onClick={() => close(true)}
            className={[
              'flex-1 rounded-xl py-3 text-sm font-bold text-white',
              opts.danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-900 hover:bg-gray-800',
            ].join(' ')}
          >
            {opts.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
