import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk — cached across app updates
          vendor: ['react', 'react-dom'],
          // Store + utilities — shared across views
          store: ['zustand'],
        }
      }
    }
  }
})
