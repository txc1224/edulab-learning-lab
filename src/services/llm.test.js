import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  chatWithAI,
  chatWithAIStream,
  clearApiKey,
  createChatService,
  getAvailableProviders,
  getApiKey,
  hasApiKey,
  loadProviderCatalog,
  setApiKey
} from './llm.js'

function createStorage() {
  const values = new Map()
  return {
    get length() {
      return values.size
    },
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(String(key), String(value))
    },
    removeItem(key) {
      values.delete(String(key))
    },
    clear() {
      values.clear()
    }
  }
}

function catalogWith(...providers) {
  return {
    defaultProvider: providers[0].id,
    providers
  }
}

function provider(id, overrides = {}) {
  return {
    id,
    name: id.toUpperCase(),
    endpoint: `https://api.example.com/${id}/v1/chat/completions`,
    defaultModel: `${id}-default`,
    models: [
      { id: `${id}-default`, name: `${id}-default` },
      { id: `${id}-alternate`, name: `${id}-alternate` }
    ],
    requestDefaults: {},
    ...overrides
  }
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
}

async function loadCatalog(payload) {
  const catalogFetch = vi.fn(async () => jsonResponse(payload))
  await loadProviderCatalog('/test-llm.providers.json', { force: true, fetchImpl: catalogFetch })
}

describe('runtime LLM provider catalog', () => {
  beforeEach(() => {
    globalThis.sessionStorage = createStorage()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.sessionStorage
  })

  it('loads a dynamic provider and model catalog without code changes', async () => {
    await loadCatalog(catalogWith(
      provider('alpha'),
      provider('beta', { defaultModel: 'beta-alternate' })
    ))

    expect(getAvailableProviders().map((item) => item.key)).toEqual(['alpha', 'beta'])
    expect(getAvailableProviders()[1].defaultModel).toBe('beta-alternate')
  })

  it('rejects duplicate providers and invalid model defaults', async () => {
    const duplicate = catalogWith(provider('alpha'), provider('alpha'))
    await expect(loadCatalog(duplicate)).rejects.toThrow('Provider ID 重复')

    const invalidModel = catalogWith(provider('alpha', { defaultModel: 'missing' }))
    await expect(loadCatalog(invalidModel)).rejects.toThrow('defaultModel 不在 models 中')
  })

  it('stores API keys in sessionStorage only', async () => {
    await loadCatalog(catalogWith(provider('alpha')))

    setApiKey('alpha', '  session-secret  ')
    expect(getApiKey('alpha')).toBe('session-secret')
    expect(hasApiKey('alpha')).toBe(true)
    expect(globalThis.sessionStorage.getItem('avatar.llm.apiKey.alpha')).toBe('session-secret')
    clearApiKey('alpha')
    expect(getApiKey('alpha')).toBe('')
    expect(hasApiKey('alpha')).toBe(false)
  })

  it('uses the selected provider, model, endpoint and request defaults', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      model: 'alpha-alternate',
      choices: [{ message: { content: 'response' } }]
    }))
    await loadCatalog(catalogWith(provider('alpha', { requestDefaults: { temperature: 0.25 } })))
    vi.stubGlobal('fetch', fetchMock)
    setApiKey('alpha', 'test-key')

    const service = createChatService()
    service.setProvider('alpha')
    service.setModel('alpha-alternate')
    await expect(service.send('hello')).resolves.toBe('response')

    const [url, request] = fetchMock.mock.calls[0]
    const body = JSON.parse(request.body)
    expect(url).toBe('https://api.example.com/alpha/v1/chat/completions')
    expect(request.headers.Authorization).toBe('Bearer test-key')
    expect(body.model).toBe('alpha-alternate')
    expect(body.temperature).toBe(0.25)
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'hello' })
    expect(body.stream).toBe(false)
  })

  it('maps model-specific completion parameters for K3-style configs', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      model: 'k3',
      choices: [{ message: { content: 'response' } }]
    }))
    await loadCatalog(catalogWith(provider('kimi', {
      defaultModel: 'k3',
      models: [{
        id: 'k3',
        name: 'Kimi K3',
        completionTokenParam: 'max_completion_tokens',
        requestDefaults: {
          reasoning_effort: 'max',
          max_completion_tokens: 8192
        }
      }]
    })))
    vi.stubGlobal('fetch', fetchMock)
    setApiKey('kimi', 'test-key')

    await chatWithAI('kimi', [])
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.reasoning_effort).toBe('max')
    expect(body.max_completion_tokens).toBe(8192)
    expect(body.max_tokens).toBeUndefined()
  })

  it('parses streamed reasoning and content for any provider', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"reasoning_content":"thinking"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"answer"}}]}\n\n',
      'data: [DONE]\n\n'
    ]
    const fetchMock = vi.fn(async () => new Response(new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
        controller.close()
      }
    }), {
      status: 200,
      headers: { 'content-type': 'text/event-stream' }
    }))

    await loadCatalog(catalogWith(provider('alpha')))
    vi.stubGlobal('fetch', fetchMock)
    setApiKey('alpha', 'test-key')
    const reasoning = []
    const content = []
    const result = await chatWithAIStream('alpha', [], {
      onReasoning: (full) => reasoning.push(full),
      onChunk: (full) => content.push(full)
    })

    expect(result).toEqual({ content: 'answer', reasoning: 'thinking' })
    expect(reasoning).toEqual(['thinking'])
    expect(content).toEqual(['answer'])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true)
  })

  it('does not call the model when the provider has no session key', async () => {
    const fetchMock = vi.fn()
    await loadCatalog(catalogWith(provider('alpha')))
    vi.stubGlobal('fetch', fetchMock)

    await expect(chatWithAI('alpha', [{ role: 'user', content: 'hello' }]))
      .rejects.toThrow('请先为 ALPHA 配置 API Key')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
