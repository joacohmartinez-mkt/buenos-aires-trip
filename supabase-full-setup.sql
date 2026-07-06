-- ============================================================================
-- SETUP COMPLETO DE SUPABASE — Buenos Aires trip
-- Correr TODO esto en: Supabase -> SQL Editor -> New query -> Run.
-- (El cartel rojo de "destructive operation" es por los `drop policy`; es
--  seguro, no borra datos. Dale "Run query".)
-- Idempotente: se puede correr varias veces sin romper.
-- ============================================================================

-- ---------- CALIFICACIONES ----------
create table if not exists public.spot_ratings (
  id uuid primary key default gen_random_uuid(),
  spot_id   text not null,          -- = events.id (uuid) del lugar calificado
  spot_name text not null,
  rating    smallint not null check (rating between 1 and 5),
  comment   text default '',
  author    text not null,          -- 'Joaquín' | 'Nicole'
  unique (spot_id, author)
);
alter table public.spot_ratings enable row level security;
drop policy if exists "lectura publica" on public.spot_ratings;
drop policy if exists "alta publica"    on public.spot_ratings;
drop policy if exists "update publico"  on public.spot_ratings;
drop policy if exists "ratings_delete"  on public.spot_ratings;
create policy "lectura publica" on public.spot_ratings for select using (true);
create policy "alta publica"    on public.spot_ratings for insert with check (true);
create policy "update publico"  on public.spot_ratings for update using (true) with check (true);
create policy "ratings_delete"  on public.spot_ratings for delete using (true);

-- ---------- EVENTOS (itinerario editable) ----------
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
alter table public.events enable row level security;
drop policy if exists "events_all" on public.events;
create policy "events_all" on public.events for all using (true) with check (true);

-- ---------- FOTOS / VIDEOS ----------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete set null,
  lat        double precision,
  lng        double precision,
  caption    text default '',
  path       text not null,                 -- ruta del archivo en Storage
  media_type text not null default 'image', -- 'image' | 'video'
  album      text,                          -- nombre libre de carpeta/álbum
  created_at timestamptz default now()
);
-- Para bases creadas antes de estas columnas:
alter table public.photos add column if not exists media_type text not null default 'image';
alter table public.photos add column if not exists album text;
alter table public.photos enable row level security;
drop policy if exists "photos_all" on public.photos;
create policy "photos_all" on public.photos for all using (true) with check (true);

-- ---------- RECUERDOS (muro polaroid de la pareja) ----------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title       text not null,
  note        text default '',
  kind        text not null default 'momento',  -- momento | sueno | promesa | cancion | lugar
  memory_date date not null default current_date,
  author      text,                             -- 'Joaquín' | 'Nicole'
  hearts      integer not null default 0,
  liked_by    text[] not null default '{}',     -- quiénes dieron like (Joaquín / Nicole)
  path        text,                             -- ruta de la foto en Storage (opcional)
  created_at  timestamptz default now()
);
-- Para bases creadas antes de la columna de likes por persona:
alter table public.memories add column if not exists liked_by text[] not null default '{}';
alter table public.memories enable row level security;
drop policy if exists "memories_all" on public.memories;
create policy "memories_all" on public.memories for all using (true) with check (true);

-- ---------- STORAGE (bucket público de fotos) ----------
insert into storage.buckets (id, name, public) values ('fotos','fotos',true)
  on conflict (id) do nothing;
drop policy if exists "fotos_read"   on storage.objects;
drop policy if exists "fotos_insert" on storage.objects;
drop policy if exists "fotos_delete" on storage.objects;
create policy "fotos_read"   on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos_insert" on storage.objects for insert with check (bucket_id = 'fotos');
create policy "fotos_delete" on storage.objects for delete using (bucket_id = 'fotos');

-- NOTA: los eventos se SIEMBRAN SOLOS desde src/data/trip.js la primera vez que
-- la app encuentra la tabla `events` vacía. No hace falta ningún INSERT manual.
-- (ratings y photos arrancan vacías y se llenan desde la app.)
