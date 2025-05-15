import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      global: 'globalThis',
      ...Object.entries(env).reduce((prev, [key, val]) => ({
        ...prev,
        [`process.env.${key}`]: JSON.stringify(val)
      }), {})
    },
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // https: {
      //   key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
      //   cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
      // },
      host: '127.0.0.1'
    },
  }
})
