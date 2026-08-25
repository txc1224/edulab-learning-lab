const DEFAULT_CATALOG_URL = '/llm.providers.json'
const API_KEY_STORAGE_PREFIX = 'avatar.llm.apiKey.'

const DEFAULT_SYSTEM_PROMPT = `你是一个友好、活泼的AI数字人伴侣，名叫"小星"。
- 回答要简洁自然，口语化，适合语音播报
- 不要使用Markdown格式，用纯文本回答
- 回答长度控制在100字以内，避免太长
- 保持亲切、有温度的语气
- 适当使用语气词，如"呀"、"呢"、"哦"等
- 可以适度表达情绪和个性`

let providerCatalog = null
let providerCatalogUrl = ''
let providerCatalogPromise = null

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeModel(model, providerId, index) {
  if (typeof model === 'string') {
    const id = model.trim()
    if (!id) throw new Error(`模型配置无效: ${providerId}[${index}] 缺少 id`)
    return { id, name: id, requestDefaults: {}, completionTokenParam: null }
  }

  if (!isPlainObject(model)) {
    throw new Error(`模型配置无效: ${providerId}[${index}]`)
  }

  const id = String(model.id || '').trim()
  if (!id) throw new Error(`模型配置无效: ${providerId}[${index}] 缺少 id`)

  const requestDefaults = model.requestDefaults === undefined ? {} : model.requestDefaults
  if (!isPlainObject(requestDefaults)) {
    throw new Error(`模型配置无效: ${providerId}[${index}] requestDefaults 必须是对象`)
  }
  const completionTokenParam = String(model.completionTokenParam || '').trim() || null
  if (completionTokenParam && !['max_tokens', 'max_completion_tokens'].includes(completionTokenParam)) {
    throw new Error(`模型配置无效: ${providerId}[${index}] completionTokenParam 不受支持`)
  }

  return {
    id,
    name: String(model.name || id).trim() || id,
    requestDefaults: { ...requestDefaults },
    completionTokenParam
  }
}

function normalizeCatalog(payload) {
  if (!isPlainObject(payload) || !Array.isArray(payload.providers) || payload.providers.length === 0) {
    throw new Error('模型配置无效: providers 必须是非空数组')
  }

  const ids = new Set()
  const providers = payload.providers.map((entry, index) => {
    if (!isPlainObject(entry)) throw new Error(`模型提供商配置无效: providers[${index}]`)

    const id = String(entry.id || '').trim()
    const name = String(entry.name || '').trim()
    const endpoint = String(entry.endpoint || '').trim()
    const devEndpoint = String(entry.devEndpoint || '').trim()
    if (!id || !name || !endpoint) {
      throw new Error(`模型提供商配置无效: providers[${index}] 缺少 id、name 或 endpoint`)
    }
    if (ids.has(id)) throw new Error(`模型提供商配置无效: Provider ID 重复 (${id})`)
    ids.add(id)

    let endpointUrl
    try {
      endpointUrl = new URL(endpoint)
    } catch {
      throw new Error(`模型提供商配置无效: ${id} endpoint 不是有效 URL`)
    }
    if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
      throw new Error(`模型提供商配置无效: ${id} endpoint 必须使用 HTTP(S)`)
    }
    if (devEndpoint && !devEndpoint.startsWith('/')) {
      throw new Error(`模型提供商配置无效: ${id} devEndpoint 必须是同源路径`)
    }

    if (!Array.isArray(entry.models) || entry.models.length === 0) {
      throw new Error(`模型提供商配置无效: ${id} models 必须是非空数组`)
    }
    const models = entry.models.map((model, modelIndex) => normalizeModel(model, id, modelIndex))
    const modelIds = new Set(models.map((model) => model.id))
    if (modelIds.size !== models.length) throw new Error(`模型提供商配置无效: ${id} 模型 ID 重复`)

    const defaultModel = String(entry.defaultModel || '').trim()
    if (!defaultModel || !modelIds.has(defaultModel)) {
      throw new Error(`模型提供商配置无效: ${id} defaultModel 不在 models 中`)
    }

    const requestDefaults = entry.requestDefaults === undefined ? {} : entry.requestDefaults
    if (!isPlainObject(requestDefaults)) {
      throw new Error(`模型提供商配置无效: ${id} requestDefaults 必须是对象`)
    }

    return {
      id,
      name,
      endpoint: endpointUrl.toString(),
      devEndpoint: devEndpoint || null,
      defaultModel,
      models,
      requestDefaults: { ...requestDefaults }
    }
  })

  const defaultProvider = String(payload.defaultProvider || '').trim()
  if (!defaultProvider || !ids.has(defaultProvider)) {
    throw new Error('模型配置无效: defaultProvider 不存在')
  }

  return { defaultProvider, providers }
}

function cloneCatalog(catalog) {
  return {
    defaultProvider: catalog.defaultProvider,
    providers: catalog.providers.map((provider) => ({
      ...provider,
      models: provider.models.map((model) => ({
        ...model,
        requestDefaults: { ...model.requestDefaults }
      })),
      requestDefaults: { ...provider.requestDefaults }
    }))
  }
}

export async function loadProviderCatalog(url = DEFAULT_CATALOG_URL, options = {}) {
  const force = options.force === true
  const fetchImpl = options.fetchImpl || globalThis.fetch
  if (typeof fetchImpl !== 'function') throw new Error('当前环境不支持加载模型配置')

  if (!force && providerCatalog && providerCatalogUrl === url) return cloneCatalog(providerCatalog)
  if (!force && providerCatalogPromise && providerCatalogUrl === url) return providerCatalogPromise

  providerCatalogUrl = url
  const requestUrl = url
  providerCatalogPromise = (async () => {
    try {
      const response = await fetchImpl(requestUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(`模型配置加载失败 (${response.status})`)
      const normalized = normalizeCatalog(await response.json())
      providerCatalog = normalized
      providerCatalogUrl = requestUrl
      return cloneCatalog(normalized)
    } catch (error) {
      providerCatalog = null
      throw error instanceof Error ? error : new Error(String(error))
    } finally {
      providerCatalogPromise = null
    }
  })()

  return providerCatalogPromise
}

export function getProviderCatalog() {
  if (!providerCatalog) throw new Error('模型配置尚未加载，请先加载模型配置')
  return cloneCatalog(providerCatalog)
}

function getProviderConfig(provider) {
  if (!providerCatalog) throw new Error('模型配置尚未加载，请先加载模型配置')
  const config = providerCatalog.providers.find((item) => item.id === provider)
  if (!config) throw new Error(`不支持的模型提供商: ${provider || '未选择'}`)
  return config
}

function resolveModel(config, model) {
  const modelId = String(model || config.defaultModel).trim()
  const modelConfig = config.models.find((item) => item.id === modelId)
  if (!modelConfig) throw new Error(`模型不存在: ${modelId}`)
  return modelConfig
}

function getSessionStorage() {
  try {
    const owner = typeof window !== 'undefined' ? window : globalThis
    return owner.sessionStorage || null
  } catch {
    return null
  }
}

export function getApiKey(provider) {
  const storage = getSessionStorage()
  if (!storage || !provider) return ''
  try {
    return storage.getItem(`${API_KEY_STORAGE_PREFIX}${provider}`) || ''
  } catch {
    return ''
  }
}

export function setApiKey(provider, apiKey) {
  if (!provider) throw new Error('未选择模型提供商')
  const storage = getSessionStorage()
  if (!storage) throw new Error('当前环境不支持会话存储')

  const value = String(apiKey || '').trim()
  try {
    if (value) storage.setItem(`${API_KEY_STORAGE_PREFIX}${provider}`, value)
    else storage.removeItem(`${API_KEY_STORAGE_PREFIX}${provider}`)
  } catch {
    throw new Error('API Key 保存失败，请检查浏览器会话存储权限')
  }
  return value
}

export function clearApiKey(provider) {
  return setApiKey(provider, '')
}

export function hasApiKey(provider) {
  return Boolean(getApiKey(provider))
}

function requireApiKey(config) {
  const apiKey = getApiKey(config.id)
  if (!apiKey) throw new Error(`请先为 ${config.name} 配置 API Key`)
  return apiKey
}

function createRequestBody(config, messages, options, stream) {
  const modelConfig = resolveModel(config, options.model)
  const requestDefaults = {
    ...config.requestDefaults,
    ...modelConfig.requestDefaults
  }
  const completionTokenParam = modelConfig.completionTokenParam || config.completionTokenParam || 'max_tokens'
  const requestMessages = [
    { role: 'system', content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT },
    ...messages
  ]

  const requestBody = {
    ...requestDefaults,
    model: modelConfig.id,
    messages: requestMessages,
    temperature: options.temperature ?? requestDefaults.temperature ?? 0.7,
    stream
  }

  const requestedTokenLimit = options[completionTokenParam]
    ?? options.max_tokens
    ?? options.max_completion_tokens
    ?? requestDefaults[completionTokenParam]
    ?? 500
  requestBody[completionTokenParam] = requestedTokenLimit
  if (completionTokenParam === 'max_tokens') delete requestBody.max_completion_tokens
  if (completionTokenParam === 'max_completion_tokens') delete requestBody.max_tokens

  return requestBody
}

async function requestCompletion(config, apiKey, body, options = {}) {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  }
  if (options.signal) fetchOptions.signal = options.signal

  const endpoint = import.meta.env.DEV && config.devEndpoint ? config.devEndpoint : config.endpoint
  const response = await fetch(endpoint, fetchOptions)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${config.name} API 错误 (${response.status}): ${errorText}`)
  }
  return response
}

export async function chatWithAI(provider, messages, options = {}) {
  const config = getProviderConfig(provider)
  const apiKey = requireApiKey(config)
  const response = await requestCompletion(
    config,
    apiKey,
    createRequestBody(config, messages, { ...options, stream: false }, false),
    options
  )
  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
    model: data.model,
    raw: data
  }
}

async function readSseResponse(response, options = {}) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    throw new Error('模型流式响应不可读取')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let fullReasoning = ''
  let buffer = ''
  let finished = false

  const onChunk = options.onChunk || (() => {})
  const onReasoning = options.onReasoning || (() => {})
  const onDone = options.onDone || (() => {})

  function finish() {
    if (finished) return
    finished = true
    onDone(fullContent, fullReasoning)
  }

  function processLine(line) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.startsWith('data:')) return

    const dataStr = trimmed.slice(5).trim()
    if (dataStr === '[DONE]') {
      finish()
      return
    }

    try {
      const data = JSON.parse(dataStr)
      const delta = data.choices?.[0]?.delta
      if (!delta) return

      const contentDelta = delta.content || ''
      const reasoningDelta = delta.reasoning_content || ''
      if (reasoningDelta) {
        fullReasoning += reasoningDelta
        onReasoning(fullReasoning, reasoningDelta)
      }
      if (contentDelta) {
        fullContent += contentDelta
        onChunk(fullContent, contentDelta)
      }
    } catch {
      // Ignore keep-alive and malformed SSE lines; a valid stream can continue.
    }
  }

  while (!finished) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      processLine(line)
      if (finished) break
    }
  }

  if (!finished) {
    buffer += decoder.decode()
    if (buffer) processLine(buffer)
    finish()
  }

  return { content: fullContent, reasoning: fullReasoning }
}

export async function chatWithAIStream(provider, messages, options = {}) {
  const config = getProviderConfig(provider)
  const apiKey = requireApiKey(config)
  const response = await requestCompletion(
    config,
    apiKey,
    createRequestBody(config, messages, { ...options, stream: true }, true),
    options
  )
  return readSseResponse(response, options)
}

export function createChatService(provider = null, options = {}) {
  const history = []
  let currentProvider = provider
  let currentModel = options.model || null

  async function send(userMessage, sendOptions = {}) {
    history.push({ role: 'user', content: userMessage })

    try {
      const result = await chatWithAI(currentProvider, history, {
        ...options,
        ...sendOptions,
        model: sendOptions.model || currentModel || undefined
      })
      history.push({ role: 'assistant', content: result.content })
      return result.content
    } catch (err) {
      history.pop()
      throw err
    }
  }

  async function sendStream(userMessage, streamOptions = {}) {
    history.push({ role: 'user', content: userMessage })
    let assistantContent = ''
    let assistantReasoning = ''

    try {
      const result = await chatWithAIStream(currentProvider, history, {
        ...options,
        ...streamOptions,
        model: streamOptions.model || currentModel || undefined,
        onReasoning: (full, delta) => {
          assistantReasoning = full
          streamOptions.onReasoning?.(full, delta)
        },
        onChunk: (full, delta) => {
          assistantContent = full
          streamOptions.onChunk?.(full, delta)
        },
        onDone: (full, reasoning) => {
          assistantContent = full
          assistantReasoning = reasoning
          history.push({ role: 'assistant', content: full })
          streamOptions.onDone?.(full, reasoning)
        }
      })
      return result.content
    } catch (err) {
      history.pop()
      throw err
    }
  }

  function clear() {
    history.length = 0
  }

  function getHistory() {
    return [...history]
  }

  function setHistory(entries = []) {
    history.length = 0
    for (const entry of entries) {
      if (entry && (entry.role === 'user' || entry.role === 'assistant')) {
        history.push({ role: entry.role, content: String(entry.content || '') })
      }
    }
  }

  function setProvider(newProvider) {
    currentProvider = newProvider || null
    currentModel = null
  }

  function setModel(newModel) {
    currentModel = newModel || null
  }

  function getProvider() {
    return currentProvider
  }

  function getModel() {
    if (currentModel) return currentModel
    if (!currentProvider || !providerCatalog) return null
    return getProviderConfig(currentProvider).defaultModel
  }

  return {
    send,
    sendStream,
    clear,
    getHistory,
    setHistory,
    setProvider,
    setModel,
    getProvider,
    getModel
  }
}

export function getAvailableProviders() {
  if (!providerCatalog) throw new Error('模型配置尚未加载，请先加载模型配置')
  return providerCatalog.providers.map((provider) => ({
    key: provider.id,
    id: provider.id,
    name: provider.name,
    endpoint: provider.endpoint,
    models: provider.models.map((model) => ({ ...model })),
    defaultModel: provider.defaultModel,
    hasKey: hasApiKey(provider.id)
  }))
}
