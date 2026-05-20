import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/Common-api': 'http://localhost:4000',
      '/user-api': 'http://localhost:4000',
      '/author-api': 'http://localhost:4000',
    },
  },
})
