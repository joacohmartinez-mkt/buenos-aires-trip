-- ───────────────────────────────────────────────────────────────────────────
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
  (1, 480, '8:00 AM', 'Joaquín llega y se instala', 'alojamiento', 'Soldado de la Independencia 810', '1 hr', 'Arrancá con medialunas con manteca y un cortado en la cuadra. Ideal para reconocer el barrio mientras se acomoda todo.', null, -34.5727, -58.4391),
  (1, 660, '11:00 AM', 'Nicole llega desde Uruguay', 'ferry', 'Terminal Buquebus, Puerto Madero', '~1 hr', 'Llega en ferry cruzando el Río de la Plata desde Uruguay, a la Terminal de Buquebus en Puerto Madero (Dársena Norte). Desde ahí son ~15–20 min hasta el depto en Palermo.', '❤️ El momento', null, null),
  (1, 720, '12:00 PM', 'Paseo por Palermo Soho', 'paseo', 'Honduras, El Salvador y Thames', '1 hr', 'Calles empedradas, boutiques de diseño y murales. Caminen sin apuro por Honduras, El Salvador y Thames.', null, -34.5881, -58.427),
  (1, 780, '1:00 PM', 'Almuerzo en El Preferido de Palermo', 'gastronomia', 'Borges 2108', '1.5 hrs', 'Bodegón porteño clásico: revuelto gramajo y vino a la jarra. Conviene reservar con anticipación.', null, -34.5872, -58.4275),
  (1, 930, '3:30 PM', 'Hipódromo de Palermo', 'cultura', 'Av. del Libertador 4101', '2 hrs', 'Arquitectura estilo francés, jardines enormes y carreras en julio. Mirá la cartelera en jockeyclub.org.ar.', '🏇 ¡Vecino!', -34.571, -58.418),
  (1, 1200, '8:00 PM', 'Cena en The Laundry', 'hamburgueseria', 'Lafinur 3223', '2 hrs', 'DJ sets y las mejores hamburguesas de Palermo Hollywood. Pedí el cheddar ahumado y lleguen antes de las 21h.', '🍔 MUST', -34.5843, -58.4329),
  (2, 540, '9:00 AM', 'Jardín Botánico', 'aire-libre', 'Av. Santa Fe 3951', '1.5 hrs', '8 hectáreas de flora de todo el mundo… y muchos gatos. La entrada es libre y gratuita.', '🌿 Aire libre', -34.5822, -58.4196),
  (2, 660, '11:00 AM', 'Rosedal y Lagos de Palermo', 'aire-libre', 'Bosques de Palermo', '2 hrs', 'Puentes, lago y 12.000 rosales. Alquilen un bote de remo y lleven abrigo, que en julio sopla fresco.', '🌹 Romántico', -34.576, -58.422),
  (2, 840, '2:00 PM', 'Almuerzo en La Cabrera', 'gastronomia', 'Cabrera 5127', '2 hrs', 'La parrilla más famosa del barrio. Pidan el bife de chorizo con sus mini guarniciones.', null, -34.5868, -58.4291),
  (2, 990, '4:30 PM', 'Planetario Galileo Galilei', 'ciencia', 'Av. Sarmiento y Belisario Roldán, Bosques de Palermo', '2 hrs', 'Cúpula de cine inmersivo bajo el domo icónico, con el lago enfrente. Los sábados las funciones van de 13:30 a 19:30 y al atardecer sacan telescopios para observar el cielo. Sacá la entrada online en planetario.buenosaires.gob.ar porque se agota.', '🪐 Ciencia', -34.5697, -58.4116),
  (2, 1260, '9:00 PM', 'Frank''s Bar', 'bar', 'Arévalo 1445', '2 hrs', 'Bar clandestino detrás de una cabina telefónica. Hay que llamar al teléfono para entrar y solo aceptan efectivo.', '🍸 Secreto', -34.5825, -58.435),
  (3, 570, '9:30 AM', 'Feria de San Telmo', 'paseo', 'Calle Defensa, San Telmo', '2.5 hrs', 'Antigüedades, tango en la calle y empanadas a lo largo de Defensa. Lleguen temprano para esquivar el gentío.', null, -34.6214, -58.3716),
  (3, 720, '12:00 PM', 'Mercado de San Telmo', 'gastronomia', 'Bolívar 1052', '1.5 hrs', 'Mercado cubierto icónico de 1897. Las empanadas de La Porteña son imperdibles.', null, -34.6212, -58.3722),
  (3, 870, '2:30 PM', 'Caminito — La Boca', 'cultura', 'Caminito, La Boca', '2 hrs', 'Casas de colores, murales y tango callejero. Quédense siempre dentro de la zona turística.', null, -34.6356, -58.3635),
  (3, 1050, '5:30 PM', 'Café La Biela en Recoleta', 'gastronomia', 'Av. Quintana 596', '1.5 hrs', 'Bajo el ombú centenario, con mesas en la vereda frente al cementerio. Un clásico para la merienda.', null, -34.5884, -58.3934),
  (3, 1200, '8:00 PM', 'El Camarín de las Musas', 'teatro', 'Mario Bravo 960', '2 hrs', 'Teatro independiente con un jardín interior precioso. Reserven online en elcamarindelasmusas.com.', '🎭 Teatro', -34.5943, -58.41),
  (4, 420, '7:00 AM', 'Último café con medialunas', 'gastronomia', 'Palermo, CABA', '1 hr', 'Despídanse de la ciudad con medialunas de manteca y un café con leche bien porteño.', null, null, null),
  (4, 480, '8:00 AM', 'Checkout y vuelta a casa', 'alojamiento', 'Soldado de la Independencia 810', '1 hr', 'Llévense alfajores Havanna y un dulce de leche para alargar el viaje un poquito más.', '🧳 Checkout 9 AM', -34.5727, -58.4391)
) as seed(day, time_sort, time, title, type, place, duration, tip, highlight, lat, lng)
where not exists (select 1 from public.events);
