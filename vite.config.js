import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' => rutas de assets relativas, funciona en cualquier subcarpeta de
// GitHub Pages (https://usuario.github.io/buenos-aires-trip/) sin tener que
// hardcodear el nombre del repo.
export default defineConfig({
  plugins: [react()],
  base: './',
})
