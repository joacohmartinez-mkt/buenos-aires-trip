# 🤝 HANDOFF — Buenos Aires trip

Documento de traspaso para **continuar este proyecto en otra conversación de Claude Code**.
Es **self-contained**: tiene todo lo necesario sin depender de la memoria de otra sesión.

> **TL;DR para el nuevo Claude:** Es una app de itinerario de viaje **ya construida, funcionando y deployada**. NO la rehagas. Leé este doc, mirá el código, y hacé cambios incrementales verificando con el preview. El repo ya está clonado en `/Users/joaquinmartinez/Documents/workspace/buenos-aires-trip` con dependencias instaladas y Supabase conectado.

---

## 1. Qué es

App **mobile-first** de itinerario de viaje para una pareja (**Joaquín & Nicole**) a **Buenos Aires, 3–6 julio 2026**. Es un regalo. Pensada para usarse entre los dos: ver el plan, editarlo, calificar lugares y subir fotos, todo **compartido y sincronizado**.

- **En vivo:** https://joacohmartinez-mkt.github.io/buenos-aires-trip/
- **Repo:** https://github.com/joacohmartinez-mkt/buenos-aires-trip
- **Carpeta local:** `/Users/joaquinmartinez/Documents/workspace/buenos-aires-trip`

Tiene **4 pestañas** (nav inferior): **Itinerario** (`/`), **Mapa & Ratings** (`/mapa`), **Fotos** (`/fotos`), **Recuerdos** (`/recuerdos`).

---

## 2. Estado actual (qué está hecho)

✅ Itinerario de 4 días, eventos **colapsables** (tap para desplegar lugar + tip).
✅ **Cuenta regresiva** al viaje + **clima** de los días (en la portada del itinerario).
✅ Mapa interactivo (Leaflet) con marcadores por tipo, fly-to, filtros por día.
✅ **Eventos editables** (agregar/editar/borrar) con selector de ubicación (tap mapa + búsqueda de dirección). Detrás de **PIN**.
✅ **Calificaciones** compartidas (estrellas, comentario, autor) + **fotos** + editar/borrar.
✅ **Sección de Fotos**: galería, subida desde el celu (con resize), fotos en el mapa (badge por evento + miniaturas sueltas) y por evento.
✅ **Sección de Recuerdos** (4ª tab): muro estilo polaroid de momentos de la pareja (no solo del viaje). Notitas colapsables (título + adelanto) que al tocarlas se abren como **página de cuaderno** (papel rayado). Tipos (momento/sueño/promesa/canción/lugar), foto opcional, **likes por persona** (toggle, máx 2), "Recuerdo del día" al azar. Agregar/editar/borrar **detrás del PIN**; likear queda abierto.
✅ **Supabase** como backend (datos compartidos y sincronizados).
✅ Deploy automático en **GitHub Pages** (cuenta personal).
✅ Detalles: fotos propias (pareja + Casa Rosada), portada sin chips (limpia), imperdibles con foto y link, animación de candado-corazón al desbloquear.

---

## 3. Stack

- **Vite 5** + **React 18** (JS, no TS) + **Tailwind 3**
- **react-router-dom 6** con **HashRouter** (clave para GitHub Pages)
- **react-leaflet 4** + **leaflet** (mapas, tiles CartoDB Positron + OpenStreetMap)
- **lucide-react** (íconos)
- **@supabase/supabase-js 2** (base de datos + storage)
- Deploy: **GitHub Actions** → GitHub Pages

---

## 4. Estructura de archivos

```
buenos-aires-trip/
├── src/
│   ├── data/trip.js          ← Datos "semilla" + metadatos: TRIP, SPOTS, DAYS,
│   │                            DAY_FILTERS, HIGHLIGHTS. Fuente del auto-seed.
│   ├── lib/
│   │   ├── supabaseConfig.js  ← URL + publishable key de Supabase (editar acá)
│   │   ├── supabase.js        ← cliente supabase (o null si no hay claves)
│   │   ├── events.js          ← capa de datos de EVENTOS (cache+async+seed+fallback)
│   │   ├── ratings.js         ← capa de datos de CALIFICACIONES
│   │   ├── photos.js          ← capa de datos de FOTOS (upload+resize+storage; exporta resizeImage)
│   │   ├── memories.js        ← capa de datos de RECUERDOS (CRUD + likes por persona + identidad)
│   │   ├── weather.js         ← clima del viaje (Open-Meteo: pronóstico ≤16d / histórico)
│   │   ├── editAccess.js      ← candado PIN (hash sha256 + sessionStorage + hook)
│   │   └── styles.js          ← TYPE_STYLES (colores/emoji por tipo) y DAY_THEMES
│   ├── components/
│   │   ├── HeroHeader.jsx     ← portada con foto de la pareja (HERO_IMAGE)
│   │   ├── Countdown.jsx      ← cuenta regresiva (tarjeta solapada al hero)
│   │   ├── WeatherStrip.jsx   ← tira de clima de los 4 días
│   │   ├── MemoryCard.jsx     ← notita polaroid colapsable / vista cuaderno (like+editar+borrar)
│   │   ├── MemoryForm.jsx     ← form alta/edición de recuerdo (foto opcional)
│   │   ├── LodgingCard.jsx, DayTabs.jsx, Stars.jsx, BottomNav.jsx
│   │   ├── Highlights.jsx     ← imperdibles (foto + link externo)
│   │   ├── ActivityCard.jsx   ← tarjeta de evento colapsable (+ lápiz editar)
│   │   ├── EventForm.jsx      ← form agregar/editar evento
│   │   ├── LocationPicker.jsx ← mini-mapa: tap + geocoding (Nominatim) para EVENTOS
│   │   ├── PhotoPlacePicker.jsx ← mapa con actividades para ubicar FOTOS
│   │   ├── PhotoUpload.jsx    ← modal subir foto (file + place + caption)
│   │   ├── Lightbox.jsx       ← visor de foto a pantalla completa (+ borrar)
│   │   ├── RatingModal.jsx    ← calificar (estrellas+comentario+fotos+borrar)
│   │   ├── EditFab.jsx        ← botón flotante candado + modal PIN
│   │   └── UnlockHeart.jsx    ← animación SVG candado→corazón al desbloquear
│   ├── pages/
│   │   ├── Itinerary.jsx      ← "/"  (hero, lodging, imperdibles, tabs, timeline)
│   │   ├── MapRatings.jsx     ← "/mapa" (banner Casa Rosada, filtros, mapa, lista)
│   │   ├── Photos.jsx         ← "/fotos" (galería)
│   │   └── Recuerdos.jsx      ← "/recuerdos" (muro polaroid, recuerdo del día, likes, candado)
│   ├── App.jsx, main.jsx, index.css
├── public/                   ← portada.jpg (pareja), mapa-buenosaires.jpg (Casa Rosada), favicon.svg
├── scripts/gen-seed.mjs      ← genera SQL de seed desde trip.js (ya no se usa; el seed es automático)
├── supabase-full-setup.sql   ← SQL completo de Supabase (todas las tablas, correr una vez)
├── supabase-memories-setup.sql ← SQL de la tabla `memories` (Recuerdos) — incl. columna liked_by
├── .github/workflows/deploy.yml ← deploy automático
├── .claude/launch.json       ← config del dev server (puerto 5188) — está en la RAÍZ del workspace
└── README.md
```

---

## 5. Modelo de datos (Supabase)

Proyecto Supabase: **`hhyvuywboqkbqjbturgf`** (cuenta personal: `joacohmartinez@gmail.com`).

| Tabla | Campos | Notas |
|---|---|---|
| **events** | id(uuid), day(1-4), time_sort(min), time(texto), title, type, place, duration, tip, highlight, lat, lng | Itinerario. RLS `events_all` (todo abierto). |
| **photos** | id, event_id(fk→events, on delete set null), lat, lng, caption, path | `path` = ruta en Storage. RLS `photos_all`. |
| **spot_ratings** | spot_id(= events.id), spot_name, rating(1-5), comment, author | 1 por (spot_id, author). RLS select/insert/update/delete abiertos. |
| **memories** | id(uuid), title, note, kind, memory_date, author, hearts(legacy), **liked_by(text[])**, path, created_at | Recuerdos. `liked_by` = nombres que dieron like (Joaquín/Nicole). `path` = foto en bucket `fotos` (opcional). RLS `memories_all` (todo abierto). |

- **Storage**: bucket público **`fotos`** (políticas read/insert/delete abiertas). Las fotos de **Recuerdos** reusan este mismo bucket.
- ⚠️ La columna **`liked_by`** se agregó después de crear la tabla. Si clonás/recreás, está en `supabase-full-setup.sql` y en `supabase-memories-setup.sql` (ambos idempotentes, con `alter table ... add column if not exists`).
- **Claves** (en `src/lib/supabaseConfig.js`): la **publishable key** es **pública por diseño** (va en el JS del sitio). La seguridad la dan las políticas RLS.
- Para recrear todo de cero: correr **`supabase-full-setup.sql`** en el SQL Editor.

---

## 6. Arquitectura / convenciones (importante)

**Patrón de las capas de datos** (`events.js`, `ratings.js`, `photos.js`): cada una mantiene una **caché en memoria** (para que los componentes lean **sincrónicamente** durante el render) + funciones **async** que pegan a Supabase + un **evento de `window`** para avisar cambios (`onXChange`). Si Supabase falla o no está, **caen a los datos estáticos de `trip.js`** (la app nunca se rompe).

- **Eventos** se identifican por **uuid**. Ratings y fotos referencian al evento por ese id.
- **Auto-seed**: la primera vez que `events` está vacía, la app la siembra desde `trip.js` (`loadEvents()` en `events.js`). `trip.js` es la "fuente semilla".
- **Borrar un evento** hace **cascada**: borra sus fotos (+archivos de storage) y calificaciones (`deleteEvent` en `events.js`).
- **El mapa y el itinerario leen de `events.js`** → cualquier cambio se refleja en ambos automáticamente.

**Recuerdos** (`memories.js` / `Recuerdos.jsx` / `MemoryCard.jsx` / `MemoryForm.jsx`):
- Misma arquitectura de capa de datos (caché + async + evento `memories-changed` + fallback). `loadMemories()` usa `select('*')` a propósito (resiliente: no se rompe si falta alguna columna).
- **Likes POR PERSONA**: columna `liked_by` (array de nombres). `toggleLike(memory, persona)` agrega/saca a la persona (máx 1 c/u → máx 2). Reemplaza al viejo contador `hearts` que se podía spamear (ya no se usa para mostrar; el conteo sale de `liked_by.length`).
- **Identidad** ("¿quién sos?") por dispositivo: `localStorage` clave `memoryAuthor` (la misma que setea el form al elegir autor). Si no está y tocás un like, la app pregunta una vez (modal Joaquín/Nicole) y la recuerda.
- **Permisos**: agregar/editar/borrar recuerdos están **detrás del PIN** (`useEditMode()`), igual que los eventos. **Likear queda ABIERTO** (sin PIN). Borrar pide **doble confirmación**.
- **Recuerdo del día**: destacado al azar **estable por día** (`seed = YYYYMMDD % cantidad`), aparece con ≥3 recuerdos y arranca expandido. NO es random por refresh (decisión del usuario: que sea "del día").
- ⚠️ Edge conocido (aceptado): dos likes simultáneos de ambos en la MISMA nota en el mismo instante podrían pisarse (se guarda el array completo). Irrelevante en uso real (2 personas, toques esporádicos). Si se quisiera robustez total → tabla aparte `memory_likes(memory_id, author)`.

**Candado / permisos** (`editAccess.js`):
- PIN **`0103`** (guardado como hash sha256, no en texto plano). Para cambiarlo: `printf '%s' 'NUEVOPIN' | shasum -a 256` y pegar el hash en `editAccess.js`.
- Es un **candado SUAVE del lado del cliente** (no es seguridad fuerte: alguien técnico con el link podría saltearlo, porque la base acepta escrituras con la clave pública). Alcanza para un link privado entre 2 personas.
- **El PIN protege SOLO la edición del itinerario (eventos).** Calificar y subir/borrar fotos quedaron **abiertos** (sin PIN).
- Al desbloquear con el PIN correcto se muestra la animación `UnlockHeart` (candado que se abre con corazón).

---

## 7. Cómo correr / buildear / deployar

```bash
cd /Users/joaquinmartinez/Documents/workspace/buenos-aires-trip
npm install          # ya está hecho en esta compu
npm run dev          # dev server (preview tools usan launch.json, puerto 5188)
npm run build        # build de producción a dist/
```

**Deploy:** automático. Cualquier `git push` a `main` dispara GitHub Actions
(`.github/workflows/deploy.yml`) que buildea y publica. URL:
`https://joacohmartinez-mkt.github.io/buenos-aires-trip/`.

- Cuenta de GitHub (gh CLI ya logueada): **`joacohmartinez-mkt`** (personal).
  También está `joaquin-viatik` (de Viatik) — NO usar esa.
- `git config` global: `TotemAi-Saas / totemiamvp@gmail.com` (los commits salen con
  ese autor; si querés que salgan a nombre personal, setear `git config user.email`
  local del repo).
- Verificar deploy: `gh run watch <id> --repo joacohmartinez-mkt/buenos-aires-trip`.

**Verificación visual:** usar las herramientas `preview_*` (preview_start con la
config "buenos-aires-trip" del `.claude/launch.json`, preview_screenshot, etc.).
Tip: la navegación por hash a veces es flaky en el preview; usar `preview_click`
sobre los tabs (`a[href="#/mapa"]`) en vez de setear `location.hash`.

---

## 8. Decisiones clave (y por qué)

- **HashRouter + `base: './'`** (vite.config): para que el ruteo y los assets
  funcionen en GitHub Pages (subcarpeta) sin config de servidor.
- **localStorage → Supabase**: para que los datos sean **compartidos** entre los
  dos y sincronizados (el localStorage era por-dispositivo).
- **PIN suave** (no login real): simplicidad para 2 personas. Documentado que es
  bypasseable. Si alguna vez se quiere seguridad real → Supabase Auth.
- **Auto-seed + fallback a `trip.js`**: la app anda aunque la DB esté vacía o caída.
- **PIN solo para eventos**: para que sumar fotos/calificaciones sea sin fricción.
- **Fotos**: bucket público + resize en el cliente (max ~1400px, JPEG) para que
  carguen rápido. Ojo HEIC de iPhone (ver pendientes).
- **Imágenes**: el hero y el banner están en `public/`. Los imperdibles usan URLs
  de Unsplash (hotlink, verificadas). Para cambiar el hero: `HERO_IMAGE` en
  `HeroHeader.jsx`.

---

## 9. Pendientes / cosas a saber (known issues)

- ⚠️ **GitHub Actions / Node 20**: el workflow tira un warning de deprecación de
  Node 20 (actions corriendo en Node 20; forzado a Node 24 desde ~16/jun/2026).
  Hoy deploya bien; si en el futuro falla, actualizar las `actions/*` o el runtime.
- ℹ️ **Clima (Open-Meteo, sin API key)**: el pronóstico real solo está disponible
  cuando faltan **≤16 días**; antes la tira muestra **"Promedio histórico"** (años
  anteriores). Para el viaje (3 jul 2026) el pronóstico real empieza a aparecer
  ~**17 jun 2026**. Si las fechas del viaje cambian, actualizar `TRIP.start/end` e
  `iso` de cada día en `src/data/trip.js` (de ahí salen cuenta regresiva y clima).
- ⚠️ **HEIC de iPhone**: si una foto no se ve, puede ser formato HEIC en un
  navegador que no lo decodifica (Chrome). El resize cae a subir el original.
  La mayoría de las subidas web de iOS ya son JPEG. Mejora posible: convertir HEIC.
- ℹ️ **Chunk > 500kB** en el build: warning informativo (Leaflet + Supabase pesan).
  Mejora posible: code-split / manualChunks.
- ℹ️ **Repo viejo** `joaquin-viatik/buenos-aires-trip` puede seguir existiendo
  (copia en la cuenta de Viatik). Se puede borrar.
- ℹ️ **Commits** salen como `TotemAi-Saas` (git config global), no como el usuario.

---

## 10. Roadmap / ideas para próximas sesiones

**Ya hecho (jun 2026):** ✅ Cuenta regresiva · ✅ Clima de los días · ✅ Sección Recuerdos.

**Features nuevas posibles:**
- 💸 Gastos del viaje (dividir entre los dos).
- 🧳 Checklist de valija (compartida).
- 📝 Notas / diario por día.
- 🔗 Links de reservas (depto, restos, teatro) por evento.
- 📅 Exportar el itinerario (PDF / Google Calendar / .ics).
- 📲 PWA (instalable + offline básico).

**Pulido:**
- Dark mode; mejoras de animaciones/transiciones.
- Bajar las imágenes de imperdibles a `public/` (self-contained, tamaños óptimos).
- Accesibilidad (roles/aria en cards colapsables, focus states).
- Performance (code-split Leaflet/Supabase).
- Reencuadre del mapa más fino; clustering de marcadores si hay muchos.

**Mantenimiento:**
- Cargar contenido real (fotos, eventos finales, calificaciones).
- Considerar dominio propio (ej. Netlify/Vercel o un custom domain en Pages).
- Backups de la base (Supabase tiene export).

---

## 11. Cómo arrancar la próxima sesión

Pegá el contenido de **`PROMPT-INICIAL.md`** como primer mensaje del nuevo Claude
Code. Resumen de lo que tiene que hacer: leer este `HANDOFF.md`, NO rehacer lo
existente, trabajar incremental y verificar con el preview antes de deployar.
