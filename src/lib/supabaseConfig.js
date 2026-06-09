// ───────────────────────────────────────────────────────────────────────────
// CONFIG DE SUPABASE  ·  para que las calificaciones se compartan entre los dos
// ───────────────────────────────────────────────────────────────────────────
//
// Mientras estos dos valores estén vacíos, la app guarda las calificaciones en
// localStorage (solo en tu dispositivo). Apenas los completes, pasan a guardarse
// en la nube y los ven los dos, sincronizadas.
//
// Cómo obtenerlos (gratis, ~5 min):
//   1. Entrá a https://supabase.com y creá un proyecto.
//   2. Project Settings → Data API (o "API"): copiá la "Project URL".
//   3. Project Settings → API Keys: copiá la clave "anon / public".
//   4. Pegalas acá abajo.
//   5. En el SQL Editor de Supabase, pegá y corré el contenido de
//      `supabase-setup.sql` (está en la raíz del proyecto) para crear la tabla.
//
// La clave "anon" es pública por diseño (queda en el JS del sitio); está bien
// que se vea. La seguridad la da la tabla con RLS del archivo SQL.

export const SUPABASE_URL = 'https://hhyvuywboqkbqjbturgf.supabase.co'
// Clave pública (publishable). Segura para estar en el front; la protege el RLS.
export const SUPABASE_ANON_KEY = 'sb_publishable_aZ3YFSzj-KbsrT2R8DMaHw_-RaPxIGT'
