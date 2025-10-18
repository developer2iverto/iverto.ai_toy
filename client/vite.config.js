import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'https://iverto-ai-toy1-h8ra.onrender.com', changeOrigin: true },
      '/uploads': { target: 'https://iverto-ai-toy1-h8ra.onrender.com', changeOrigin: true },
    }
  }
})