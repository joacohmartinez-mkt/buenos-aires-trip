-- ───────────────────────────────────────────────────────────────────────────
-- Setup de Supabase para las calificaciones de spots.
-- Pegá TODO esto en: Supabase → SQL Editor → New query → Run.
-- ───────────────────────────────────────────────────────────────────────────

-- Tabla de calificaciones. Una por (spot_id, author): la restricción UNIQUE
-- permite el "upsert" (si ya existe la del mismo autor para ese lugar, la pisa).
create table if not exists public.spot_ratings (
  id uuid primary key default gen_random_uuid(),
  spot_id   text not null,
  spot_name text not null,
  rating    smallint not null check (rating between 1 and 5),
  comment   text default '',
  author    text not null,
  updated_at timestamptz default now(),
  unique (spot_id, author)
);

-- Seguridad a nivel de fila.
alter table public.spot_ratings enable row level security;

-- App privada para dos personas: permitimos leer y escribir con la clave anon.
-- (Si algún día querés cerrarlo más, acá se ajustan las políticas.)
drop policy if exists "lectura publica"  on public.spot_ratings;
drop policy if exists "alta publica"     on public.spot_ratings;
drop policy if exists "update publico"   on public.spot_ratings;

create policy "lectura publica" on public.spot_ratings
  for select using (true);

create policy "alta publica" on public.spot_ratings
  for insert with check (true);

create policy "update publico" on public.spot_ratings
  for update using (true) with check (true);
