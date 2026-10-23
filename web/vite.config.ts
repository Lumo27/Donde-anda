/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA instalable en Android y iPhone (#17). Genera el manifest y el service worker al hacer build.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Donde anda?',
        short_name: 'Donde anda',
        description: 'Sabé por dónde viene el 510 y cuánto falta para tu parada.',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b1f33',
        background_color: '#0b1f33',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Las rutas /__/ son de Firebase Hosting (login con Google): no las tiene que atender el service worker.
        navigateFallbackDenylist: [/^\/__\//],
      },
    }),
  ],
  test: {
    // Los tests viven al lado del código: src/**/*.test.ts
    passWithNoTests: true,
  },
})
