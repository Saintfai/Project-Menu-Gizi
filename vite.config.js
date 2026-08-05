import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Agar bisa diakses dari device lain di jaringan yang sama
    proxy: {
      '/webhook': {
        target: 'https://dev-flow.edelweiss.id',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
