// Persistencia de calificaciones de spots.
// Forma de cada registro:
//   { spot_id, spot_name, rating (1-5), comment, author ("Joaquín" | "Nicole") }
// Regla: una calificación por (spot_id, author). Si ya existe, se actualiza.
//
// Backend: si hay credenciales de Supabase (lib/supabaseConfig.js) las
// calificaciones se guardan en la nube y se comparten entre los dos. Si no, se
// usa localStorage (solo en este dispositivo).
//
// Para que los componentes puedan leer de forma sincrónica durante el render,
// mantenemos una caché en memoria que se refresca con loadRatings() y avisa a
// los suscriptores con el evento 'ratings-updated'.

import { supabase, isSupabaseConfigured } from './supabase'

const LS_KEY = 'ba_spot_ratings_v1'
const EVENT = 'ratings-updated'
const COLS = 'spot_id, spot_name, rating, comment, author'

export const AUTHORS = ['Joaquín', 'Nicole']

// Caché en memoria. Arranca con lo que haya en localStorage (instantáneo);
// si Supabase está activo, loadRatings() la reemplaza con lo de la nube.
let cache = readLocal()

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* almacenamiento lleno o no disponible: ignorar */
  }
}

function notify() {
  window.dispatchEvent(new Event(EVENT))
}

// ----- Lecturas sincrónicas (desde la caché) -----

export function getRatings() {
  return cache
}

export function getRatingsForSpot(spotId) {
  return cache.filter((r) => r.spot_id === spotId)
}

export function getAverage(spotId) {
  const list = getRatingsForSpot(spotId)
  if (!list.length) return { avg: 0, count: 0 }
  const sum = list.reduce((acc, r) => acc + Number(r.rating), 0)
  return { avg: sum / list.length, count: list.length }
}

export function getRatingBy(spotId, author) {
  return cache.find((r) => r.spot_id === spotId && r.author === author)
}

// ----- Carga / guardado (async) -----

// Refresca la caché desde el backend activo. Llamar al montar la app.
export async function loadRatings() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('spot_ratings').select(COLS)
    if (!error && Array.isArray(data)) {
      cache = data
      notify()
    }
  } else {
    cache = readLocal()
    notify()
  }
  return cache
}

export async function saveRating({ spot_id, spot_name, rating, comment, author }) {
  const record = { spot_id, spot_name, rating, comment: comment ?? '', author }

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('spot_ratings')
      .upsert(record, { onConflict: 'spot_id,author' })
    if (error) throw error
    await loadRatings()
  } else {
    const list = readLocal()
    const idx = list.findIndex((r) => r.spot_id === spot_id && r.author === author)
    if (idx >= 0) list[idx] = record
    else list.push(record)
    writeLocal(list)
    cache = list
    notify()
  }
  return record
}

// Suscripción para refrescar la UI cuando cambia una calificación
// (incluye cambios en otra pestaña vía el evento 'storage').
export function onRatingsChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
