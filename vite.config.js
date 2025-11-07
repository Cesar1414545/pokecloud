import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 🖼️ Arquivos estáticos que ficam em public/
      includeAssets: [
        'images/icon-192x192.png',
        'images/icon-512x512.png',
        'images/maskable-192.png',
        'images/maskable-512.png',
        // opcional: atalho 96x96 p/ sumir warning
        'images/icon-96x96.png'
      ],
      manifest: {
        id: '/',                 // ajuda a evitar duplicidade de instalação
        name: 'PokeCloud VN',
        short_name: 'PokeCloud',
        description: 'Visual Novel educativa do PokeCloud',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/images/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/images/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // opcional: tira o warning do Edge sobre shortcuts sem ícone 96x96
        shortcuts: [
          {
            name: 'Novo Jogo',
            url: '/?newGame=1',
            icons: [{ src: '/images/icon-96x96.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Continuar',
            url: '/?continue=1',
            icons: [{ src: '/images/icon-96x96.png', sizes: '96x96', type: 'image/png' }]
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html-pages', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } }
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              url.pathname.startsWith('/assets/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: ({ request }) => request.destination === 'audio',
            handler: 'CacheFirst',
            options: { cacheName: 'audio', rangeRequests: true, expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
        ],
      },
      // 💡 Para não ficar “dando F5” no dev:
      devOptions: { enabled: false },
    }),
  ],
})
