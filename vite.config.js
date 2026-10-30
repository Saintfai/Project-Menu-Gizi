import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Target API Edelweiss & kredensial di sisi server/proxy (murni dibaca dari .env)
  const apiTarget = (env.EDELWEISS_API_URL || env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  const apiUser = env.EDELWEISS_API_USERNAME || env.VITE_API_USERNAME || ''
  const apiPass = env.EDELWEISS_API_PASSWORD || env.VITE_API_PASSWORD || ''

  const basicAuthHeader = apiUser && apiPass 
    ? `Basic ${Buffer.from(`${apiUser}:${apiPass}`).toString('base64')}` 
    : ''

  return {
    plugins: [react()],
    server: {
      host: true, // Agar bisa diakses dari device lain di jaringan yang sama
      proxy: {
        '/webhook': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          headers: basicAuthHeader ? { Authorization: basicAuthHeader } : undefined,
          configure: (proxy) => {
            if (basicAuthHeader) {
              proxy.on('proxyReq', (proxyReq) => {
                proxyReq.setHeader('Authorization', basicAuthHeader)
              })
            }
          }
        }
      }
    }
  }
})
