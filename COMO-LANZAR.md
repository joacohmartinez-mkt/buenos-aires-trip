# 🚀 Cómo lanzar / retomar el proyecto (checklist)

Carpeta del proyecto: `/Users/joaquinmartinez/Documents/workspace/buenos-aires-trip`
Sitio en vivo: https://joacohmartinez-mkt.github.io/buenos-aires-trip/
Repo: https://github.com/joacohmartinez-mkt/buenos-aires-trip

---

## A) Para SEGUIR trabajando con Claude Code (agregar/cambiar cosas)
1. Abrí una terminal:
   `cd /Users/joaquinmartinez/Documents/workspace/buenos-aires-trip`
2. Lanzá Claude Code ahí: `claude`
3. Pegá como **primer mensaje** el bloque de `PROMPT-INICIAL.md`
   (cambiá *"[lo que quiero hacer]"* por tu pedido).
4. Claude lee `HANDOFF.md`, se ubica y sigue desde donde quedamos.

## B) Para solo verlo / probarlo local (sin Claude)
1. `cd /Users/joaquinmartinez/Documents/workspace/buenos-aires-trip`
2. `npm install`  (solo la primera vez en una compu nueva)
3. `npm run dev`  → abrí la URL que imprime (http://localhost:5188)

## C) Para publicar cambios (que se vean online)
- `git add -A && git commit -m "lo que cambié" && git push`
- Se deploya **solo** en ~1 minuto (GitHub Actions).
- Verificar: que el sitio cargue en https://joacohmartinez-mkt.github.io/buenos-aires-trip/

## D) Para cargar contenido SIN tocar código (desde la app en vivo)
- Entrá al sitio → botón flotante **“Editar”** → PIN **`0103`**.
- Con el candado abierto: agregás/editás/borrás **eventos** y **recuerdos**.
- **Sin** candado (abierto a los dos): subir **fotos**, **calificar** lugares y dar **like** a recuerdos.
- Todo se guarda solo y se sincroniza entre los dos (Supabase).

## E) Desde CERO en otra compu
1. `git clone https://github.com/joacohmartinez-mkt/buenos-aires-trip.git`
2. `cd buenos-aires-trip && npm install`
3. `npm run dev` (las claves de Supabase ya vienen en el repo → funciona directo).
4. Para deployar desde esa compu: `gh auth login` (cuenta joacohmartinez-mkt) y `git push`.

---

## Datos clave (por si Claude o vos los necesitan)
- **PIN de edición:** `0103`
- **Repo:** `joacohmartinez-mkt/buenos-aires-trip` (público, deploy automático)
- **Supabase:** proyecto `hhyvuywboqkbqjbturgf` · cuenta `joacohmartinez@gmail.com`
- **Recrear base de cero:** correr `supabase-full-setup.sql` en el SQL Editor de Supabase.
- **Más contexto:** `HANDOFF.md` (todo) · `PROMPT-INICIAL.md` (prompt de arranque).
