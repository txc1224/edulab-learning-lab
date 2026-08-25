import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function loadProviderProxies() {
  const catalogPath = path.join(projectRoot, 'public', 'llm.providers.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

  return Object.fromEntries(
    (catalog.providers || [])
      .filter((provider) => provider.devProxy?.prefix && provider.devProxy?.target)
      .map((provider) => {
        const { prefix, target, upstreamPath = '' } = provider.devProxy
        return [prefix, {
          target,
          changeOrigin: true,
          rewrite: (requestPath) => `${upstreamPath}${requestPath.slice(prefix.length)}`
        }]
      })
  )
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    proxy: loadProviderProxies()
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          three: ['three'],
          katex: ['katex']
        }
      }
    }
  }
})
