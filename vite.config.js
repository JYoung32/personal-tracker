import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /personal-tracker/, but only for
  // production builds — the dev server should stay at the root.
  base: command === 'build' ? '/personal-tracker/' : '/',
  plugins: [react()],
}))
