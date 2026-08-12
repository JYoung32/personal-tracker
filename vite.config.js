import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /personal-tracker/, but only for
  // production builds — the dev server should stay at the root.
  base: command === 'build' ? '/personal-tracker/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Personal Tracker',
        short_name: 'Tracker',
        description:
          'Daily to-dos, hobbies, garage, armory, and finances tracker.',
        // Relative to the manifest's own location, so this resolves
        // correctly under the /personal-tracker/ base in production too.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#3f6b52',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
}))
