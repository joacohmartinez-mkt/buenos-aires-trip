// Capa de datos de FOTOS + VIDEOS. Sube a Supabase Storage (bucket "fotos", público)
// y guarda metadatos en la tabla photos. Caché en memoria + evento para refrescar.

import { supabase, isSupabaseConfigured } from './supabase'

const EVENT = 'photos-changed'
const BUCKET = 'fotos'
const COLS = 'id, event_id, lat, lng, caption, path, media_type, album, thumb_path, created_at'
const COLS_LEGACY = 'id, event_id, lat, lng, caption, path, media_type, album, created_at'

// Compatibilidad: si la DB todavía no tiene la columna thumb_path (migración
// pendiente), caemos al esquema viejo y no generamos miniaturas.
let hasThumbCol = true

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

// URL de la miniatura (~320px) para grillas. Fallback para fotos viejas sin
// thumb: la imagen original. Para videos sin thumb devuelve '' (la grilla
// cae al <video preload="metadata"> de siempre).
export function thumbUrl(p) {
  if (!supabase || !p) return ''
  if (p.thumb_path) return photoUrl(p.thumb_path)
  return isVideo(p) ? '' : photoUrl(p.path)
}

// ---- Carga ----
export async function loadPhotos() {
  if (!isSupabaseConfigured) {
    cache = []
    notify()
    return cache
  }
  let { data, error } = await supabase
    .from('photos')
    .select(hasThumbCol ? COLS : COLS_LEGACY)
    .order('created_at', { ascending: false })
  // Migración pendiente: reintentar sin thumb_path.
  if (error && hasThumbCol && /thumb_path/i.test(error.message || '')) {
    hasThumbCol = false
    ;({ data, error } = await supabase
      .from('photos')
      .select(COLS_LEGACY)
      .order('created_at', { ascending: false }))
  }
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

// ---- Miniatura de video (primer frame → JPEG) ----
// Best-effort: si el navegador no puede decodificar el video, devuelve null
// y la grilla cae al <video preload="metadata"> de siempre.
function makeVideoThumb(file, maxSide = 320, quality = 0.7) {
  return new Promise((resolve) => {
    let settled = false
    const finish = (blob) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(url)
      resolve(blob ?? null)
    }
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = url
    video.onerror = () => finish(null)
    video.onloadeddata = () => {
      // Saltar un toque adelante para evitar el frame negro inicial.
      try {
        video.currentTime = Math.min(0.5, (video.duration || 1) / 2)
      } catch {
        finish(null)
      }
    }
    video.onseeked = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => finish(blob), 'image/jpeg', quality)
      } catch {
        finish(null)
      }
    }
    setTimeout(() => finish(null), 8000)
  })
}

// Pool simple de concurrencia: corre `tasks` con hasta `limit` en paralelo.
async function runPool(tasks, limit = 3) {
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const idx = next++
      await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
}

// ---- Subir / borrar ----
// Prepara y sube UN archivo (media + thumb + insert). Usado por uploadPhotos.
async function uploadOne(f, meta) {
  const isVid = (f.type || '').startsWith('video/')
  const media_type = isVid ? 'video' : 'image'
  const id = crypto.randomUUID()
  const ext = isVid ? extForFile(f) : 'jpg'
  const contentType = isVid ? (f.type || 'video/mp4') : 'image/jpeg'
  const path = `${id}.${ext}`

  // Media principal + miniatura (~320px) en paralelo.
  const [blob, thumbBlob] = await Promise.all([
    isVid ? Promise.resolve(f) : resizeImage(f),
    hasThumbCol ? (isVid ? makeVideoThumb(f) : resizeImage(f, 320, 0.7)) : Promise.resolve(null),
  ])

  // La miniatura es best-effort: si falla, la grilla usa el archivo original.
  let thumb_path = null
  if (hasThumbCol && thumbBlob && thumbBlob !== f) {
    const tp = `${id}_thumb.jpg`
    const { error: tErr } = await supabase.storage
      .from(BUCKET)
      .upload(tp, thumbBlob, { contentType: 'image/jpeg', upsert: false })
    if (!tErr) thumb_path = tp
  }

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType, upsert: false })
  if (upErr) throw upErr

  const cleanAlbum = meta.album && meta.album.trim() ? meta.album.trim() : null
  const record = {
    event_id: meta.eventId ?? null,
    lat: meta.lat ?? null,
    lng: meta.lng ?? null,
    caption: meta.caption ?? '',
    path,
    media_type,
    album: cleanAlbum,
  }
  if (hasThumbCol) record.thumb_path = thumb_path
  const { error: insErr } = await supabase.from('photos').insert(record)
  if (insErr) throw insErr
}

export async function uploadPhoto(file, meta = {}) {
  const res = await uploadPhotos([file], meta)
  if (res.errors.length) throw res.errors[0]
}

// Subir varios archivos con la misma metadata, de a 3 en paralelo.
// onProgress(done, total) tras cada uno.
export async function uploadPhotos(files, meta = {}, onProgress) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const list = Array.from(files)
  const errors = []
  let done = 0
  const tasks = list.map((f) => async () => {
    try {
      await uploadOne(f, meta)
    } catch (e) {
      console.error('uploadPhotos error', e)
      errors.push(e)
    }
    done += 1
    onProgress?.(done, list.length)
  })
  await runPool(tasks, 3)
  await loadPhotos()
  return { done, total: list.length, errors }
}

// ---- Mutaciones optimistas ----
// Patrón: mutar la caché local primero (la UI responde al instante), después
// sincronizar con Supabase; si falla, restaurar el snapshot y re-lanzar.
async function optimistic(mutate, sync) {
  const snapshot = cache
  cache = mutate(cache)
  notify()
  try {
    await sync()
  } catch (e) {
    cache = snapshot
    notify()
    throw e
  }
  // Refresco en segundo plano para converger con el server (sin bloquear la UI).
  loadPhotos()
}

export async function deletePhoto(photo) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  await optimistic(
    (list) => list.filter((p) => p.id !== photo.id),
    async () => {
      const { error } = await supabase.from('photos').delete().eq('id', photo.id)
      if (error) throw error
      const paths = [photo.path, photo.thumb_path].filter(Boolean)
      supabase.storage.from(BUCKET).remove(paths)
    }
  )
}

// Mueve N fotos a un álbum (null = "Sin álbum").
export async function movePhotosToAlbum(photoIds, albumName) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  if (!photoIds || photoIds.length === 0) return
  const clean = albumName && albumName.trim() ? albumName.trim() : null
  const ids = new Set(photoIds)
  await optimistic(
    (list) => list.map((p) => (ids.has(p.id) ? { ...p, album: clean } : p)),
    async () => {
      const { error } = await supabase.from('photos').update({ album: clean }).in('id', photoIds)
      if (error) throw error
    }
  )
}

// Renombra un álbum en todas las fotos que lo tengan.
export async function renameAlbum(oldName, newName) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const from = (oldName || '').trim()
  const to = (newName || '').trim()
  if (!from || !to || from === to) return
  await optimistic(
    (list) => list.map((p) => (p.album === from ? { ...p, album: to } : p)),
    async () => {
      const { error } = await supabase.from('photos').update({ album: to }).eq('album', from)
      if (error) throw error
    }
  )
}

// Saca el álbum de todas las fotos (las deja en "Sin álbum") — no borra archivos.
export async function emptyAlbum(name) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  const from = (name || '').trim()
  if (!from) return
  await optimistic(
    (list) => list.map((p) => (p.album === from ? { ...p, album: null } : p)),
    async () => {
      const { error } = await supabase.from('photos').update({ album: null }).eq('album', from)
      if (error) throw error
    }
  )
}

// Borra en batch.
export async function deletePhotos(photos) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  if (!photos || photos.length === 0) return
  const ids = new Set(photos.map((p) => p.id))
  await optimistic(
    (list) => list.filter((p) => !ids.has(p.id)),
    async () => {
      const { error } = await supabase.from('photos').delete().in('id', [...ids])
      if (error) throw error
      const paths = photos.flatMap((p) => [p.path, p.thumb_path]).filter(Boolean)
      if (paths.length) supabase.storage.from(BUCKET).remove(paths)
    }
  )
}

export function onPhotosChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('focus', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('focus', cb)
  }
}
