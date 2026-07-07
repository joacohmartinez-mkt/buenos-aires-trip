import { useEffect, useState } from 'react'

// Puerta de entrada de la app: PIN compartido de la pareja.
// Igual que editAccess es un candado "suave" (la app es estática), pero frena
// a cualquier persona con el link. Se guarda solo el hash, y el desbloqueo
// queda recordado en el dispositivo (localStorage) — se entra una sola vez.
// PIN actual: el mismo de edición (0103). Para cambiarlo: generar el sha256
// del nuevo PIN y reemplazar la constante.
const PIN_SHA256 = '06843e3f58776ec2eb5e0cc7a44a3c3fc1b4b9af2e75504da3d299dc566cc395'
const KEY = 'ba_app_unlocked'
const EVENT = 'app-access-change'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isAppUnlocked() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// Solo verifica el PIN, sin desbloquear (para animar la entrada antes).
export async function verifyAppPin(pin) {
  const hash = await sha256(String(pin).trim())
  return hash === PIN_SHA256
}

// Compromete el desbloqueo (persiste + notifica).
export function unlockApp() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* modo incógnito sin storage: sigue funcionando en la sesión */
  }
  window.dispatchEvent(new Event(EVENT))
}

export async function tryUnlockApp(pin) {
  if (await verifyAppPin(pin)) {
    unlockApp()
    return true
  }
  return false
}

export function lockApp() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useAppUnlocked() {
  const [unlocked, setUnlocked] = useState(isAppUnlocked())
  useEffect(() => {
    const cb = () => setUnlocked(isAppUnlocked())
    window.addEventListener(EVENT, cb)
    return () => window.removeEventListener(EVENT, cb)
  }, [])
  return unlocked
}
