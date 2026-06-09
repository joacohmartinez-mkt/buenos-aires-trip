// Capa de datos de FOTOS. Sube a Supabase Storage (bucket "fotos", público) y
// guarda metadatos en la tabla photos. Caché en memoria + evento para refrescar.

import { supabase, isSupabaseConfigured } from './supabase'

const EVENT = 'photos-changed'
const BUCKET = 'fotos'
const COLS = 'id, event_id, lat, lng, caption, path, created_at'

let cache = []
const notify = () => window.dispatchEvent(new Event(EVENT))

// ---- Lecturas sincrónicas ----
export const getPhotos = () => cache
export const getPhotosByEvent = (eventId) => cache.filter((p) => p.event_id === eventId)
export const countByEvent = (eventId) => cache.filter((p) => p.event_id === eventId).length
export const getFreePhotos = () => cache.filter((p) => !p.event_id && p.lat != null && p.lng != null)

export function photoUrl(path) {
  if (!supabase || !path) return ''
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// ---- Carga ----
export async function loadPhotos() {
  if (!isSupabaseConfigured) {
    cache = []
    notify()
    return cache
  }
  const { data, error } = await supabase
    .from('photos')
    .select(COLS)
    .order('created_at', { ascending: false })
  if (!error && Array.isArray(data)) {
    cache = data
    notify()
  }
  return cache
}

// ---- Resize en el cliente (para que carguen rápido) ----
async function resizeImage(file, maxSide = 1400, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    let { width, height } = bitmap
    const scale = Math.min(1, maxSide / Math.max(width, height))
    width = Math.round(width * scale)
    height = Math.round(height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
    bitmap.close?.()
    return blob ?? file
  } catch {
    // si no se puede decodificar (ej: HEIC en algunos navegadores), sube original
    return file
  }
}

// ---- Subir / borrar ----
export async function uploadPhoto(file, { eventId = null, lat = null, lng = null, caption = '' } = {}) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const blob = await resizeImage(file)
  const path = `${crypto.randomUUID()}.jpg`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (upErr) throw upErr
  const { error: insErr } = await supabase
    .from('photos')
    .insert({ event_id: eventId, lat, lng, caption: caption ?? '', path })
  if (insErr) throw insErr
  await loadPhotos()
}

export async function deletePhoto(photo) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  await supabase.storage.from(BUCKET).remove([photo.path])
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
  await loadPhotos()
}

export function onPhotosChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('focus', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('focus', cb)
  }
}
