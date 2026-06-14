-- ============================================================================
-- RECUERDOS — tabla nueva para la sección "Recuerdos" (muro polaroid).
-- Correr UNA vez en: Supabase -> SQL Editor -> New query -> Run.
-- Idempotente: se puede correr varias veces sin romper.
-- (Las fotos de los recuerdos reusan el bucket "fotos" que ya existe.)
-- ============================================================================

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title       text not null,
  note        text default '',
  kind        text not null default 'momento',  -- momento | sueno | promesa | cancion | lugar
  memory_date date not null default current_date,
  author      text,                             -- 'Joaquín' | 'Nicole'
  hearts      integer not null default 0,
  path        text,                             -- ruta de la foto en Storage (opcional)
  created_at  timestamptz default now()
);

alter table public.memories enable row level security;
drop policy if exists "memories_all" on public.memories;
create policy "memories_all" on public.memories for all using (true) with check (true);
