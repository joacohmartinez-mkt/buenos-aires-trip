// Capa de datos de FOTOS + VIDEOS. Sube a Supabase Storage (bucket "fotos", público)
// y guarda metadatos en la tabla photos. Caché en memoria + evento para refrescar.

import { supabase, isSupabaseConfigured } from './supabase'

const EVENT = 'photos-changed'
const BUCKET = 'fotos'
const COLS = 'id, event_id, lat, lng, caption, path, media_type, album, created_at'

let cache = []
const notify = () => window.dispatchEvent(new Event(EVENT))

// ---- Lecturas sincrónicas ----
export const getPhotos = () => cache
export const getPhotosByEvent = (eventId) => cache.filter((p) => p.event_id === eventId)
export const countByEvent = (eventId) => cache.filter((p) => p.event_id === eventId).length
export const getFreePhotos = () => cache.filter((p) => !p.event_id && p.lat != null && p.lng != null)

export const isVideo = (p) => p?.media_type === 'video'

// Álbumes distintos con conteo + cover (primer item = más reciente por orden de cache).
// Devuelve { name, count, cover } — name === null representa "Sin álbum".
export function getAlbums() {
  const map = new Map()
  for (const p of cache) {
    const key = p.album && p.album.trim() ? p.album.trim() : null
    if (!map.has(key)) map.set(key, { name: key, count: 0, cover: p })
    map.get(key).count += 1
  }
  const list = Array.from(map.values())
  // Álbumes con nombre primero (alfabético), "Sin álbum" al final.
  list.sort((a, b) => {
    if (a.name === null) return 1
    if (b.name === null) return -1
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  })
  return list
}

export function getPhotosByAlbum(name) {
  if (name === null || name === undefined) {
    return cache.filter((p) => !p.album || !p.album.trim())
  }
  return cache.filter((p) => (p.album || '').trim() === name)
}

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

// ---- Resize en el cliente (solo imágenes) ----
export async function resizeImage(file, maxSide = 1400, quality = 0.82) {
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

// Extrae extensión razonable a partir del nombre / mime del archivo.
function extForFile(file) {
  const fromName = (file?.name || '').split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName
  const mime = file?.type || ''
  if (mime.startsWith('video/')) return mime.split('/')[1] || 'mp4'
  return 'jpg'
}

// ---- Subir / borrar ----
export async function uploadPhoto(
  file,
  { eventId = null, lat = null, lng = null, caption = '', album = null } = {}
) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const isVid = (file?.type || '').startsWith('video/')
  const media_type = isVid ? 'video' : 'image'
  const blob = isVid ? file : await resizeImage(file)
  const ext = isVid ? extForFile(file) : 'jpg'
  const contentType = isVid ? (file.type || 'video/mp4') : 'image/jpeg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType, upsert: false })
  if (upErr) throw upErr
  const cleanAlbum = album && album.trim() ? album.trim() : null
  const { error: insErr } = await supabase
    .from('photos')
    .insert({ event_id: eventId, lat, lng, caption: caption ?? '', path, media_type, album: cleanAlbum })
  if (insErr) throw insErr
  await loadPhotos()
}

// Subir varios archivos con la misma metadata. onProgress(i, total) tras cada uno.
export async function uploadPhotos(files, meta = {}, onProgress) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const list = Array.from(files)
  const errors = []
  let done = 0
  for (const f of list) {
    try {
      const isVid = (f.type || '').startsWith('video/')
      const media_type = isVid ? 'video' : 'image'
      const blob = isVid ? f : await resizeImage(f)
      const ext = isVid ? extForFile(f) : 'jpg'
      const contentType = isVid ? (f.type || 'video/mp4') : 'image/jpeg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType, upsert: false })
      if (upErr) throw upErr
      const cleanAlbum = meta.album && meta.album.trim() ? meta.album.trim() : null
      const { error: insErr } = await supabase.from('photos').insert({
        event_id: meta.eventId ?? null,
        lat: meta.lat ?? null,
        lng: meta.lng ?? null,
        caption: meta.caption ?? '',
        path,
        media_type,
        album: cleanAlbum,
      })
      if (insErr) throw insErr
    } catch (e) {
      console.error('uploadPhotos error', e)
      errors.push(e)
    }
    done += 1
    onProgress?.(done, list.length)
  }
  await loadPhotos()
  return { done, total: list.length, errors }
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
