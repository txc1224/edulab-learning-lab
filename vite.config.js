import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const piperWasmDir = path.join(projectRoot, 'node_modules', 'piper-plus', 'dist', 'rust-wasm')
const piperWasmFiles = ['piper_plus_wasm.js', 'piper_plus_wasm_bg.wasm']
const piperDictionaryDir = path.join(projectRoot, 'public', 'assets')
const piperDictionaryFiles = ['pinyin_single.json', 'pinyin_phrases.json']
const ortWasmDir = path.join(projectRoot, 'node_modules', 'onnxruntime-web', 'dist')
const ortWasmFile = 'ort-wasm-simd-threaded.jsep.wasm'

function piperWasmAssets() {
  return {
    name: 'piper-plus-wasm-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?')[0] || ''
        const filename = pathname.startsWith('/assets/') ? pathname.slice('/assets/'.length) : ''
        // Piper Plus 0.6.0 resolves its default dictionary base relative to
        // the Vite dependency pre-bundle (`/node_modules/.vite/deps/...`).
        // `../../assets/` therefore becomes `/node_modules/assets/` in dev.
        // Keep the root and `/node_modules/` aliases too, as the resolved
        // module location can differ between Vite versions.
        const dictionaryName = pathname
          .replace(/^\/node_modules\/assets\//, '')
          .replace(/^\/node_modules\//, '')
          .replace(/^\//, '')
        const isDictionaryAlias = piperDictionaryFiles.includes(dictionaryName)
          && (
            pathname === `/${dictionaryName}`
            || pathname === `/node_modules/${dictionaryName}`
            || pathname === `/node_modules/assets/${dictionaryName}`
          )
        if (filename !== ortWasmFile && !piperWasmFiles.includes(filename) && !isDictionaryAlias) {
          next()
          return
        }

        const filePath = isDictionaryAlias
          ? path.join(piperDictionaryDir, dictionaryName)
          : filename === ortWasmFile
            ? path.join(ortWasmDir, filename)
            : path.join(piperWasmDir, filename)
        if (!fs.existsSync(filePath)) {
          next()
          return
        }
        response.setHeader('Content-Type', filename.endsWith('.wasm')
          ? 'application/wasm'
          : isDictionaryAlias ? 'application/json' : 'text/javascript')
        fs.createReadStream(filePath).pipe(response)
      })
    },
    generateBundle() {
      for (const filename of piperWasmFiles) {
        const filePath = path.join(piperWasmDir, filename)
        if (!fs.existsSync(filePath)) {
          this.error(`Piper Plus WASM asset not found: ${filePath}`)
        }
        this.emitFile({
          type: 'asset',
          fileName: `assets/${filename}`,
          source: fs.readFileSync(filePath)
        })
      }
      for (const filename of piperDictionaryFiles) {
        const filePath = path.join(piperDictionaryDir, filename)
        if (!fs.existsSync(filePath)) {
          this.error(`Piper dictionary asset not found: ${filePath}`)
        }
        const source = fs.readFileSync(filePath)
        this.emitFile({ type: 'asset', fileName: filename, source })
        this.emitFile({ type: 'asset', fileName: `node_modules/${filename}`, source })
      }
    }
  }
}

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
  plugins: [vue(), piperWasmAssets()],
  server: {
    port: 5173,
    host: true,
    proxy: loadProviderProxies()
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === ortWasmFile) return 'assets/[name][extname]'
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          three: ['three'],
          katex: ['katex']
        }
      }
    }
  }
})
