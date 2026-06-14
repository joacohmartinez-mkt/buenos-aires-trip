// ───────────────────────────────────────────────────────────────────────────
// Capa de datos de RECUERDOS (muro estilo polaroid de la pareja).
// Mismo patrón que photos/events/ratings: caché en memoria para lecturas
// sincrónicas + funciones async contra Supabase + evento de window para
// refrescar. Reusa el bucket "fotos" para las imágenes (resize en el cliente).
// Si Supabase no está, devuelve cache vacío y la app sigue funcionando.
// ───────────────────────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from './supabase'
import { resizeImage } from './photos'

const EVENT = 'memories-changed'
const BUCKET = 'fotos'
const COLS = 'id, title, note, kind, memory_date, author, hearts, path, created_at'

let cache = []
const notify = () => window.dispatchEvent(new Event(EVENT))

// Tipos de recuerdo: emoji + etiqueta + color (clases Tailwind literales abajo).
export const MEMORY_KINDS = [
  { id: 'momento', emoji: '❤️', label: 'Momento', color: 'rose' },
  { id: 'sueno', emoji: '✨', label: 'Sueño', color: 'violet' },
  { id: 'promesa', emoji: '🤝', label: 'Promesa', color: 'emerald' },
  { id: 'cancion', emoji: '🎵', label: 'Canción', color: 'sky' },
  { id: 'lugar', emoji: '📍', label: 'Lugar', color: 'amber' },
]

export const kindById = (id) => MEMORY_KINDS.find((k) => k.id === id) ?? MEMORY_KINDS[0]

// Clases de color por tipo (strings literales completos → Tailwind las conserva).
const KIND_TONE = {
  rose: 'bg-rose-100 text-rose-700',
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  sky: 'bg-sky-100 text-sky-700',
  amber: 'bg-amber-100 text-amber-700',
}
export const kindTone = (id) => KIND_TONE[kindById(id).color] ?? KIND_TONE.rose

// ---- Lecturas sincrónicas ----
export const getMemories = () => cache

export function memoryPhotoUrl(path) {
  if (!supabase || !path) return ''
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// ---- Carga ----
export async function loadMemories() {
  if (!isSupabaseConfigured) {
    cache = []
    notify()
    return cache
  }
  const { data, error } = await supabase
    .from('memories')
    .select(COLS)
    .order('memory_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (!error && Array.isArray(data)) {
    cache = data
    notify()
  }
  return cache
}

// ---- Agregar / borrar ----
export async function addMemory({ title, note = '', kind = 'momento', date, author, file = null }) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  let path = null
  if (file) {
    const blob = await resizeImage(file)
    path = `mem-${crypto.randomUUID()}.jpg`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (upErr) throw upErr
  }
  const { error } = await supabase.from('memories').insert({
    title: title.trim(),
    note: note.trim(),
    kind,
    memory_date: date,
    author,
    path,
    hearts: 0,
  })
  if (error) throw error
  await loadMemories()
}

export async function deleteMemory(memory) {
  if (!isSupabaseConfigured) throw new Error('Supabase no configurado')
  if (memory.path) await supabase.storage.from(BUCKET).remove([memory.path])
  const { error } = await supabase.from('memories').delete().eq('id', memory.id)
  if (error) throw error
  await loadMemories()
}

// Sumar un corazón (reacción compartida). Optimista: actualiza la caché ya y
// revierte si Supabase falla.
export async function addHeart(memory) {
  const m = cache.find((x) => x.id === memory.id)
  if (!m) return
  m.hearts = (m.hearts ?? 0) + 1
  notify()
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('memories').update({ hearts: m.hearts }).eq('id', m.id)
  if (error) {
    m.hearts -= 1
    notify()
  }
}

export function onMemoriesChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('focus', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('focus', cb)
  }
}
