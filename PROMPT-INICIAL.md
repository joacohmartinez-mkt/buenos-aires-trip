# 🚀 PROMPT INICIAL — pegá esto como primer mensaje en la nueva conversación

> Copiá y pegá todo lo que está dentro del bloque de abajo en un Claude Code
> nuevo (parado en `/Users/joaquinmartinez/Documents/workspace/buenos-aires-trip`
> o en el workspace). Reemplazá "[lo que quiero hacer]" por tu pedido.

---

```
Estoy CONTINUANDO un proyecto que ya existe y está funcionando — no lo rehagas.

Es "Buenos Aires trip": una app mobile-first de itinerario de viaje (React + Vite
+ Tailwind), ya deployada y con backend en Supabase. Es un regalo para mi novia.

Carpeta: /Users/joaquinmartinez/Documents/workspace/buenos-aires-trip
En vivo:  https://joacohmartinez-mkt.github.io/buenos-aires-trip/
Repo:     https://github.com/joacohmartinez-mkt/buenos-aires-trip

ANTES DE TOCAR NADA:
1. Leé el archivo HANDOFF.md de ese repo: tiene TODO el contexto (arquitectura,
   modelo de datos, Supabase, deploy, PIN, decisiones y pendientes).
2. Mirá la estructura en src/ para ubicarte (data/trip.js, lib/, components/, pages/).

Cosas clave que ya están resueltas (no las re-hagas):
- Backend en Supabase (proyecto hhyvuywboqkbqjbturgf), claves ya puestas en
  src/lib/supabaseConfig.js. Tablas: events, photos, spot_ratings, memories + bucket "fotos".
- 4 pestañas: Itinerario, Mapa & Ratings, Fotos, Recuerdos.
- Eventos y Recuerdos editables (CRUD) detrás de un PIN suave (0103). Calificaciones,
  fotos y likes de recuerdos son abiertos. El mapa y el itinerario leen de la misma
  capa de datos (lib/events.js); cada feature tiene su capa en lib/ (mismo patrón).
- Itinerario tiene cuenta regresiva + clima (Open-Meteo, lib/weather.js).
- Deploy automático: cada `git push` a main publica solo (GitHub Actions). La cuenta
  gh ya está logueada como joacohmartinez-mkt.

CÓMO TRABAJAR:
- Cambios incrementales y verificados. Usá las herramientas preview_* (preview_start
  con la config "buenos-aires-trip", screenshots, etc.) para confirmar visualmente
  antes de dar algo por hecho. La app corre en el puerto 5188.
- No deployes hasta que lo probemos en el preview. Para deployar: commit + push.
- La clave publishable de Supabase es pública por diseño (está bien que se vea).

Lo que quiero hacer en esta sesión: [lo que quiero hacer]

Si algo del pedido es ambiguo, preguntame antes de construir.
```

---

## Variantes rápidas (según el plan)

**Agregar una feature nueva** → reemplazá el "[lo que quiero hacer]" por algo como:
`Quiero agregar [X] (ej: una sección de gastos del viaje dividida entre los dos).
Hacelo en la misma onda visual y técnica que el resto. Preguntame lo que necesites.`

**Pulir / ajustar** →
`Quiero pulir [X] (diseño/textos/performance). Mostrame antes y después con screenshots.`

**Solo cargar contenido / mantener** →
`Solo quiero cargar contenido real y que siga andando. Guiame para editar los
eventos/fotos/calificaciones (desde la app con el PIN 0103, o desde Supabase).`

---

## Datos sueltos por si hacen falta (ya están en HANDOFF.md)

- **PIN de edición:** `0103`
- **Supabase:** proyecto `hhyvuywboqkbqjbturgf`, cuenta `joacohmartinez@gmail.com`.
  Setup completo de cero: correr `supabase-full-setup.sql` en el SQL Editor.
- **GitHub:** repo `joacohmartinez-mkt/buenos-aires-trip` (público), deploy auto.
- **Recrear datos:** los eventos se siembran solos desde `src/data/trip.js` cuando
  la tabla `events` está vacía.
