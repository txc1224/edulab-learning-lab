import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from './chat.store.js'

function storage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  }
}

describe('chat store runtime model configuration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const sessionStorage = storage()
    globalThis.sessionStorage = sessionStorage
    globalThis.window = { sessionStorage, localStorage: storage() }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.sessionStorage
    delete globalThis.window
  })

  it('initializes from the external default and switches providers/models', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      defaultProvider: 'custom',
      providers: [
        {
          id: 'custom',
          name: 'Custom',
          endpoint: 'https://api.example.com/custom/v1/chat/completions',
          defaultModel: 'custom-default',
          models: [
            { id: 'custom-default', name: 'Custom default' },
            { id: 'custom-alt', name: 'Custom alternate' }
          ],
          requestDefaults: {}
        },
        {
          id: 'backup',
          name: 'Backup',
          endpoint: 'https://api.example.com/backup/v1/chat/completions',
          defaultModel: 'backup-default',
          models: [{ id: 'backup-default', name: 'Backup default' }],
          requestDefaults: {}
        }
      ]
    }), { headers: { 'content-type': 'application/json' } })))

    const store = useChatStore()
    await store.initialize()

    expect(store.selectedProvider).toBe('custom')
    expect(store.selectedModel).toBe('custom-default')
    expect(store.apiKeyError).toContain('Custom')

    store.saveApiKey('session-key')
    expect(store.hasConfiguredKey).toBe(true)
    store.setModel('custom-alt')
    expect(store.selectedModel).toBe('custom-alt')
    store.setProvider('backup')
    expect(store.selectedProvider).toBe('backup')
    expect(store.selectedModel).toBe('backup-default')
  })
})
