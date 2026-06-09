import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig'

// Si hay credenciales, usamos Supabase (calificaciones compartidas en la nube).
// Si no, la app cae a localStorage automáticamente (ver lib/ratings.js).
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
