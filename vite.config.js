import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
import fs from 'node:fs'
import path from 'node:path'

const useHttps = process.env.HTTPS === 'true'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: useHttps
    ? {
        https: {
          key: fs.readFileSync(path.resolve(process.env.SSL_KEY_FILE)),
          cert: fs.readFileSync(path.resolve(process.env.SSL_CRT_FILE)),
        },
      }
    : undefined,
})