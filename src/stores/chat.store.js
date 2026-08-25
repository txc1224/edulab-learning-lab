import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearApiKey as clearStoredApiKey,
  createChatService,
  getApiKey,
  getAvailableProviders,
  getProviderCatalog,
  hasApiKey,
  loadProviderCatalog,
  setApiKey as saveStoredApiKey
} from '../features/avatar/services/llm.service.js'
import { readJson, remove, writeJson } from '../shared/services/storage.service.js'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const inputText = ref('')
  const isThinking = ref(false)
  const isReasoning = ref(false)
  const streamingContent = ref('')
  const apiKeyError = ref('')
  const configError = ref('')
  const providers = ref([])
  const selectedProvider = ref('')
  const selectedModel = ref('')
  const apiKey = ref('')
  const service = createChatService()
  let abortController = null

  const hasMessages = computed(() => messages.value.length > 0)
  const hasConfiguredKey = computed(() => Boolean(selectedProvider.value && apiKey.value))

  function historyKey(provider = selectedProvider.value) {
    return `chat_history_${provider}`
  }

  function loadHistory(provider = selectedProvider.value) {
    const saved = readJson(historyKey(provider), [])
    messages.value = Array.isArray(saved) ? saved : []
    service.setHistory(messages.value)
  }

  function saveHistory() {
    if (messages.value.length) writeJson(historyKey(), messages.value)
    else remove(historyKey())
  }

  function clearMessages() {
    messages.value = []
    service.clear()
    saveHistory()
  }

  async function initialize() {
    configError.value = ''
    apiKeyError.value = ''

    try {
      await loadProviderCatalog()
      providers.value = getAvailableProviders()
      const catalog = getProviderCatalog()
      const available = providers.value.find((provider) => provider.key === catalog.defaultProvider) || providers.value[0]
      if (!available) throw new Error('模型配置中没有可用提供商')
      setProvider(available.key)
    } catch (error) {
      providers.value = []
      selectedProvider.value = ''
      selectedModel.value = ''
      apiKey.value = ''
      configError.value = error.message || '模型配置加载失败'
    }
  }

  function setProvider(provider) {
    const config = providers.value.find((item) => item.key === provider)
    if (!config) throw new Error(`不支持的模型提供商: ${provider || '未选择'}`)

    selectedProvider.value = provider
    selectedModel.value = config.defaultModel
    service.setProvider(provider)
    service.setModel(selectedModel.value)
    apiKey.value = getApiKey(provider)
    apiKeyError.value = hasApiKey(provider) ? '' : `请先配置 ${providers.value.find((item) => item.key === provider)?.name || provider} API Key`
    loadHistory(provider)
  }

  function setModel(model) {
    const config = providers.value.find((item) => item.key === selectedProvider.value)
    if (!config || !config.models.some((item) => item.id === model)) {
      throw new Error(`模型不存在: ${model || '未选择'}`)
    }
    selectedModel.value = model
    service.setModel(model)
  }

  function saveApiKey(value) {
    saveStoredApiKey(selectedProvider.value, value)
    apiKey.value = getApiKey(selectedProvider.value)
    apiKeyError.value = hasConfiguredKey.value ? '' : `请先配置 ${providers.value.find((item) => item.key === selectedProvider.value)?.name || selectedProvider.value} API Key`
    providers.value = providers.value.map((provider) => ({
      ...provider,
      hasKey: hasApiKey(provider.key)
    }))
  }

  function clearApiKey() {
    clearStoredApiKey(selectedProvider.value)
    apiKey.value = ''
    apiKeyError.value = `请先配置 ${providers.value.find((item) => item.key === selectedProvider.value)?.name || selectedProvider.value} API Key`
    providers.value = providers.value.map((provider) => ({
      ...provider,
      hasKey: hasApiKey(provider.key)
    }))
  }

  function stopGenerating() {
    abortController?.abort()
    abortController = null
    isThinking.value = false
    isReasoning.value = false
    streamingContent.value = ''
  }

  async function sendMessage(text, hooks = {}) {
    const content = text.trim()
    if (!content || isThinking.value) return
    if (configError.value || !selectedProvider.value || !hasConfiguredKey.value) {
      apiKeyError.value = selectedProvider.value
        ? `请先配置 ${providers.value.find((item) => item.key === selectedProvider.value)?.name || selectedProvider.value} API Key`
        : '请先加载并选择模型提供商'
      return
    }

    messages.value.push({ role: 'user', content, time: hooks.formatTime?.() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    isThinking.value = true
    isReasoning.value = false
    streamingContent.value = ''
    apiKeyError.value = ''
    abortController = new AbortController()

    try {
      await service.sendStream(content, {
        signal: abortController.signal,
        onReasoning: () => { isReasoning.value = true },
        onChunk: (full) => {
          isReasoning.value = false
          streamingContent.value = full
          hooks.onChunk?.(full)
        },
        onDone: (full) => {
          streamingContent.value = ''
          messages.value.push({ role: 'assistant', content: full, time: hooks.formatTime?.() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
          hooks.onDone?.(full)
        }
      })
      saveHistory()
    } catch (error) {
      if (error.name !== 'AbortError') {
        if (error.message?.includes('API Key') || error.message?.includes('配置')) apiKeyError.value = error.message
        else messages.value.push({ role: 'assistant', content: `抱歉，${error.message || '出错了'}`, time: hooks.formatTime?.() || '' })
      }
      hooks.onError?.(error)
    } finally {
      abortController = null
      isThinking.value = false
      isReasoning.value = false
      streamingContent.value = ''
    }
  }

  return {
    messages,
    inputText,
    isThinking,
    isReasoning,
    streamingContent,
    apiKeyError,
    configError,
    providers,
    selectedProvider,
    selectedModel,
    apiKey,
    hasMessages,
    hasConfiguredKey,
    initialize,
    setProvider,
    setModel,
    saveApiKey,
    clearApiKey,
    sendMessage,
    stopGenerating,
    clearMessages,
    loadHistory,
    saveHistory
  }
})
