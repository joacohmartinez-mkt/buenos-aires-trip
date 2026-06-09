# Buenos Aires · Joaquín & Nicole ❤️

Itinerario de viaje + mapa con calificaciones. App mobile-first para nuestro primer viaje a Buenos Aires (3–6 de julio de 2026).

Hecha con **React + Vite + Tailwind CSS**, mapa con **react-leaflet** (OpenStreetMap) y calificaciones persistidas en el navegador (**localStorage**).

## 🧑‍💻 Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (normalmente http://localhost:5173).

## 🚀 Publicar en GitHub Pages

Hay dos formas. La **A** es la recomendada (automática).

### A) Automática con GitHub Actions

1. Subí el repo a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Itinerario Buenos Aires"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` a `main` publica solo (workflow en `.github/workflows/deploy.yml`).

### B) Manual con la rama `gh-pages`

```bash
npm run deploy
```

Esto compila y publica la carpeta `dist` en la rama `gh-pages`. Después, en
**Settings → Pages**, elegí esa rama como fuente.

> El `base: './'` en `vite.config.js` hace que funcione en cualquier nombre de
> repo (`usuario.github.io/mi-repo/`) sin tocar nada. Además usamos `HashRouter`,
> así que el deep-link a `/mapa` funciona sin configuración extra del servidor.

## ⭐ Calificaciones compartidas (Supabase)

Por defecto las calificaciones se guardan en **localStorage** (solo en tu
dispositivo). Para que vos y Nicole vean las del otro, sincronizadas, conectá
Supabase (gratis, ~5 min):

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, pegá el contenido de
   [`supabase-setup.sql`](supabase-setup.sql) y dale **Run** (crea la tabla).
3. **Project Settings → API**: copiá la *Project URL* y la clave *anon / public*.
4. Pegalas en [`src/lib/supabaseConfig.js`](src/lib/supabaseConfig.js).
5. Listo. La app detecta las claves sola y pasa a guardar en la nube.

> La clave *anon* es pública por diseño (queda en el JS del sitio); está bien
> que se vea. La seguridad la da el RLS de la tabla. Si no cargás las claves, la
> app sigue andando con localStorage sin romperse.

## ✏️ Personalizar

- **Itinerario, lugares y coordenadas:** `src/data/trip.js` (única fuente de verdad).
- **Foto del hero:** por defecto hay una ilustración del skyline porteño. Para usar
  una foto (o imagen generada con IA), poné el archivo en `public/` y editá la
  constante `HERO_IMAGE` en `src/components/HeroHeader.jsx`. Si la imagen falla,
  vuelve sola a la ilustración.
- **Colores por tipo de lugar y por día:** `src/lib/styles.js`.

## 📁 Estructura

```
src/
├── data/trip.js          Datos del viaje (días, actividades, spots)
├── lib/
│   ├── styles.js         Estilos temáticos por tipo y día
│   └── ratings.js        Persistencia de calificaciones (localStorage)
├── components/           Hero, cards, tabs, mapa-modal, nav…
├── pages/
│   ├── Itinerary.jsx     Página "/"
│   └── MapRatings.jsx    Página "/mapa"
└── App.jsx               Layout + rutas
```
