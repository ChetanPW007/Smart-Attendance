import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Smart Attendance',
        short_name: 'Attendance',
        description: 'Manage classroom attendance efficiently',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
