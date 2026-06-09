import { useEffect, useState } from 'react'

// Candado de edición "suave": un PIN del lado de la app. Frena ediciones
// accidentales y a cualquiera casual. No es seguridad fuerte (alguien técnico
// con el link podría saltearlo). Guardamos solo el hash del PIN, no el PIN.
const PIN_SHA256 = '06843e3f58776ec2eb5e0cc7a44a3c3fc1b4b9af2e75504da3d299dc566cc395'
const KEY = 'ba_edit_unlocked'
const EVENT = 'edit-mode-change'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isEditing() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export async function tryUnlock(pin) {
  const hash = await sha256(String(pin).trim())
  if (hash === PIN_SHA256) {
    sessionStorage.setItem(KEY, '1')
    window.dispatchEvent(new Event(EVENT))
    return true
  }
  return false
}

export function lock() {
  sessionStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function onEditChange(cb) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

// Hook de React para saber si estamos en modo edición.
export function useEditMode() {
  const [editing, setEditing] = useState(isEditing())
  useEffect(() => onEditChange(() => setEditing(isEditing())), [])
  return editing
}
