// Genera supabase-events-setup.sql a partir de src/data/trip.js, así el
// sembrado de eventos queda idéntico al itinerario actual (sin tipear a mano).
// Uso: node scripts/gen-seed.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { DAYS, SPOTS } from '../src/data/trip.js'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'supabase-events-setup.sql')

const spotById = (id) => SPOTS.find((s) => s.id === id)

function toMinutes(t) {
  const m = String(t).match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + min
}

const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const num = (v) => (v == null ? 'null' : v)

const rows = []
for (const d of DAYS) {
  for (const a of d.activities) {
    const spot = a.spotId ? spotById(a.spotId) : null
    rows.push(
      `  (${d.id}, ${toMinutes(a.time)}, ${q(a.time)}, ${q(a.title)}, ${q(a.type)}, ` +
        `${q(a.place ?? '')}, ${q(a.duration ?? '')}, ${q(a.tip ?? '')}, ${q(a.highlight ?? null)}, ` +
        `${num(spot?.lat)}, ${num(spot?.lng)})`,
    )
  }
}

const sql = `-- ───────────────────────────────────────────────────────────────────────────
-- Setup de EVENTOS + FOTOS (editables) para Buenos Aires trip.
-- Generado automáticamente desde src/data/trip.js — no editar a mano.
-- Pegá TODO en: Supabase → SQL Editor → New query → Run.
-- ───────────────────────────────────────────────────────────────────────────

-- ===== Tabla de eventos (itinerario editable) =====
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  day        smallint not null check (day between 1 and 4),
  time_sort  smallint not null default 0,   -- minutos desde medianoche (para ordenar)
  time       text not null,                 -- display, ej "8:00 AM"
  title      text not null,
  type       text not null default 'paseo',
  place      text default '',
  duration   text default '',
  tip        text default '',
  highlight  text,
  lat        double precision,
  lng        double precision,
  created_at timestamptz default now()
);

-- ===== Tabla de fotos =====
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete set null,
  lat        double precision,
  lng        double precision,
  caption    text default '',
  path       text not null,                 -- ruta del archivo en Storage
  created_at timestamptz default now()
);

-- ===== RLS abierto (el "candado" del PIN es del lado de la app) =====
alter table public.events enable row level security;
alter table public.photos enable row level security;

drop policy if exists "events_all" on public.events;
create policy "events_all" on public.events for all using (true) with check (true);

drop policy if exists "photos_all" on public.photos;
create policy "photos_all" on public.photos for all using (true) with check (true);

-- ===== Bucket de fotos (público) =====
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos_read"   on storage.objects;
drop policy if exists "fotos_insert" on storage.objects;
drop policy if exists "fotos_delete" on storage.objects;

create policy "fotos_read"   on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos_insert" on storage.objects for insert with check (bucket_id = 'fotos');
create policy "fotos_delete" on storage.objects for delete using (bucket_id = 'fotos');

-- ===== Sembrado del itinerario actual (solo si la tabla está vacía) =====
insert into public.events (day, time_sort, time, title, type, place, duration, tip, highlight, lat, lng)
select * from (values
${rows.join(',\n')}
) as seed(day, time_sort, time, title, type, place, duration, tip, highlight, lat, lng)
where not exists (select 1 from public.events);
`

writeFileSync(out, sql)
console.log(`OK: ${rows.length} eventos sembrados -> ${out}`)
