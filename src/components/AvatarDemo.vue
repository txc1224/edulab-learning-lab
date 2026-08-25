<template>
  <div class="ai-companion">
    <div class="avatar-section">
      <div
        ref="avatarContainer"
        class="avatar-box"
        :class="{ 'avatar-loading': isAvatarLoading, 'avatar-empty': !avatarInstance && !isAvatarInitializing }"
        :style="{ background: currentBgStyle }"
      >
        <div v-if="isAvatarLoading" class="loading-mask">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
        <div v-if="!avatarInstance && !isAvatarInitializing" class="empty-avatar">
          <div class="empty-avatar-icon">🤖</div>
          <h3>数字人未连接</h3>
          <p>点击下方「连接」按钮加载数字人</p>
          <p class="empty-hint">模型在浏览器中加载，语音使用系统中文 TTS</p>
        </div>
        <div v-if="subtitleText" class="subtitle-bar">
          <p>{{ subtitleText }}</p>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-dot" :class="statusClass"></span>
        <span class="status-text">{{ statusText }}</span>
        <span class="status-divider"></span>
        <span class="companion-name">小星</span>
        <span class="status-divider"></span>
        <button
          v-if="avatarInstance && !isAvatarInitializing"
          class="link-btn"
          @click="handleDisconnect"
        >
          断开
        </button>
        <button
          v-else-if="!isAvatarInitializing"
          class="link-btn"
          @click="initAvatar"
        >
          连接
        </button>
        <span v-else class="connecting-text">连接中...</span>
      </div>
    </div>

    <div class="chat-section">
      <div class="chat-header">
        <div class="chat-header-title">
          <h2>💬 和小星聊天</h2>
          <button
            v-if="messages.length > 0"
            class="clear-btn"
            @click="handleClearChat"
            title="清空对话"
          >
            清空
          </button>
        </div>
        <p class="chat-tip">输入你的问题，小星会用语音回复你哦～</p>
      </div>

      <div ref="chatMessagesRef" class="chat-messages">
        <div v-if="messages.length === 0" class="empty-chat">
          <div class="empty-icon">✨</div>
          <p>开始和我聊天吧！</p>
          <p class="empty-hint">试试问我：你好呀 / 讲个笑话 / 今天天气怎么样</p>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-item"
          :class="msg.role"
        >
          <div class="message-avatar">
            {{ msg.role === 'user' ? '🧑' : '🤖' }}
          </div>
          <div class="message-bubble" :class="{ streaming: isThinking && index === messages.length - 1 && msg.role === 'assistant' }">
            <p>{{ msg.content }}</p>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>

        <div v-if="isThinking" class="message-item assistant">
          <div class="message-avatar">🤖</div>
          <div class="message-bubble thinking" :class="{ streaming: hasStreamingContent }">
            <template v-if="hasStreamingContent">
              <p>{{ lastMessageContent }}</p>
            </template>
            <template v-else-if="isReasoning">
              <p class="reasoning-text">🤔 思考中...</p>
            </template>
            <template v-else>
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="chat-input-wrapper">
        <div class="chat-input-box">
          <textarea
            v-model="inputText"
            class="chat-input"
            placeholder="输入你想说的话..."
            :disabled="isThinking || isConfigLoading"
            @keydown.enter.exact.prevent="handleSend"
          ></textarea>
          <button
            class="send-btn"
            :disabled="!inputText.trim() || isThinking || isConfigLoading || !selectedProvider || !hasConfiguredKey"
            @click="handleSend"
          >
            {{ isThinking ? '思考中...' : '发送' }}
          </button>
        </div>
        <p v-if="configError" class="api-hint error">
          ⚠️ {{ configError }}
        </p>
        <p v-else-if="apiKeyError" class="api-hint error">
          ⚠️ {{ apiKeyError }}
        </p>
        <p v-else-if="selectedProvider && !hasConfiguredKey" class="api-hint">
          请在下方输入当前模型的 API Key，Key 仅保存在本次会话中。
        </p>
        <p v-else class="api-hint">
          模型目录来自运行时配置文件，可直接替换或扩展模型服务。
        </p>
      </div>

      <div class="quick-actions">
        <button
          v-for="q in quickQuestions"
          :key="q"
          class="quick-btn"
          @click="sendQuickQuestion(q)"
          :disabled="isThinking"
        >
          {{ q }}
        </button>
      </div>

      <div class="settings">
        <div class="setting-item">
          <label>提供商</label>
          <select
            v-model="selectedProvider"
            class="model-select"
            :disabled="isConfigLoading || !providers.length"
            @change="handleProviderChange"
          >
            <option disabled value="">请选择提供商</option>
            <option v-for="p in providers" :key="p.key" :value="p.key">
              {{ p.name }} {{ p.hasKey ? '' : '（需配置 Key）' }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <label>模型</label>
          <select
            v-model="selectedModel"
            class="model-select"
            :disabled="isConfigLoading || !selectedProvider || !currentProviderModels.length"
            @change="handleModelChange"
          >
            <option v-for="model in currentProviderModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>
        <div class="setting-item setting-item--api-key">
          <label>API Key</label>
          <input
            v-model="apiKeyInput"
            type="password"
            class="api-key-input"
            autocomplete="off"
            placeholder="输入当前模型的 API Key"
            :disabled="isConfigLoading || !selectedProvider"
            @keydown.enter.prevent="handleSaveApiKey"
          />
          <button
            class="key-btn"
            :disabled="isConfigLoading || !selectedProvider || !apiKeyInput.trim()"
            @click="handleSaveApiKey"
          >
            {{ hasConfiguredKey ? '更新' : '保存' }}
          </button>
          <button
            v-if="hasConfiguredKey"
            class="key-btn key-btn--muted"
            :disabled="isConfigLoading"
            @click="handleClearApiKey"
          >
            清除
          </button>
        </div>
        <div class="setting-item">
          <label>背景</label>
          <div class="bg-selector">
            <button
              v-for="bg in backgrounds"
              :key="bg.value"
              class="bg-item"
              :class="{ active: selectedBg === bg.value }"
              :style="{ background: bg.style }"
              @click="selectedBg = bg.value"
              :title="bg.label"
            ></button>
          </div>
        </div>
        <div class="setting-item">
          <label>音量</label>
          <input
            type="range"
            v-model.number="volume"
            min="0"
            max="1"
            step="0.1"
            class="volume-slider"
            @input="handleVolumeChange"
            :disabled="!avatarInstance"
          />
          <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
        </div>
        <div class="setting-item">
          <label>调试</label>
          <button
            class="debug-btn"
            :class="{ active: showDebugInfo }"
            @click="toggleDebugInfo"
            :disabled="!avatarInstance"
          >
            {{ showDebugInfo ? '隐藏' : '显示' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import {
  clearApiKey,
  createChatService,
  getApiKey,
  getAvailableProviders,
  getProviderCatalog,
  hasApiKey,
  loadProviderCatalog,
  setApiKey
} from '../features/avatar/services/llm.service.js'
import { createAvatarService, loadAvatarConfig } from '../features/avatar/services/avatar.service.js'
import { useAvatarStore } from '../stores/avatar.store.js'

const avatarContainer = ref(null)
const chatMessagesRef = ref(null)
const avatarInstance = ref(null)
const avatarStore = useAvatarStore()
const avatarService = createAvatarService()
const isAvatarInitializing = ref(false)
const isAvatarLoading = ref(false)
const loadingText = ref('准备中...')
const volume = computed({
  get: () => avatarStore.volume,
  set: (value) => avatarStore.setVolume(value)
})
const sdkStatus = computed({
  get: () => avatarStore.status,
  set: (value) => avatarStore.setStatus(value)
})
const selectedBg = ref('gradient')

const messages = ref([])
const inputText = ref('')
const isThinking = ref(false)
const isReasoning = ref(false)
const apiKeyError = ref('')
const configError = ref('')
const isConfigLoading = ref(false)
const selectedProvider = ref('')
const selectedModel = ref('')
const apiKeyInput = ref('')
const providers = ref([])

const chatService = createChatService()

const currentProvider = computed(() => {
  return providers.value.find((provider) => provider.key === selectedProvider.value) || null
})

const currentProviderModels = computed(() => currentProvider.value?.models || [])

const hasConfiguredKey = computed(() => {
  return Boolean(currentProvider.value?.hasKey)
})

const hasStreamingContent = computed(() => {
  return streamingContent.value.length > 0
})

const lastMessageContent = computed(() => streamingContent.value)

const streamingContent = ref('')
const isSpeaking = computed({
  get: () => avatarStore.isSpeaking,
  set: (value) => avatarStore.setSpeaking(value)
})
const subtitleText = ref('')
let streamAbortController = null

const backgrounds = [
  { value: 'gradient', label: '淡彩渐变', style: 'linear-gradient(180deg, #e0e7ff 0%, #fce7f3 50%, #fef3c7 100%)' },
  { value: 'blue', label: '晴空蓝', style: 'linear-gradient(180deg, #dbeafe 0%, #e0f2fe 100%)' },
  { value: 'pink', label: '樱花粉', style: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)' },
  { value: 'green', label: '清新绿', style: 'linear-gradient(180deg, #d1fae5 0%, #ecfccb 100%)' },
  { value: 'purple', label: '梦幻紫', style: 'linear-gradient(180deg, #ede9fe 0%, #f3e8ff 100%)' },
  { value: 'white', label: '纯净白', style: '#ffffff' }
]

const quickQuestions = [
  '你好呀',
  '讲个笑话',
  '介绍一下你自己',
  '今天心情怎么样'
]

const currentBgStyle = computed(() => {
  const bg = backgrounds.find(b => b.value === selectedBg.value)
  return bg ? bg.style : backgrounds[0].style
})

const statusClass = computed(() => {
  if (isAvatarInitializing.value || isAvatarLoading.value) return 'status-loading'
  if (isThinking.value) return 'status-thinking'
  if (sdkStatus.value === 0 || sdkStatus.value === 6) return 'status-online'
  if (sdkStatus.value === 5) return 'status-loading'
  if (sdkStatus.value === -1 || sdkStatus.value === 4 || sdkStatus.value === 7) return 'status-offline'
  return 'status-offline'
})

const statusText = computed(() => {
  if (isAvatarInitializing.value) return '数字人初始化中...'
  if (isThinking.value) return '思考中...'
  if (sdkStatus.value === 0 || sdkStatus.value === 6) return '在线'
  if (sdkStatus.value === 1) return '离线'
  if (sdkStatus.value === 2) return '网络已连接'
  if (sdkStatus.value === 3) return '网络断开'
  if (sdkStatus.value === 4) return '已关闭'
  if (sdkStatus.value === 5) return '隐身中'
  if (sdkStatus.value === 7) return '已停止'
  if (sdkStatus.value === -1) return '未连接'
  return '未知状态'
})

function formatTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function addMessage(role, content) {
  messages.value.push({ role, content, time: formatTime() })
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

function getStorageKey(provider) {
  return `ai_companion_chat_history_${provider}`
}

function saveMessages() {
  try {
    localStorage.setItem(
      getStorageKey(selectedProvider.value),
      JSON.stringify(messages.value)
    )
  } catch (e) {
    console.warn('保存对话记录失败:', e)
  }
}

function loadMessages(provider) {
  try {
    const saved = localStorage.getItem(getStorageKey(provider))
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('加载对话记录失败:', e)
  }
  return []
}

function handleClearChat() {
  if (messages.value.length === 0) return
  messages.value = []
  chatService.clear()
  localStorage.removeItem(getStorageKey(selectedProvider.value))
}

watch(messages, () => {
  if (messages.value.length > 0) {
    saveMessages()
  } else {
    localStorage.removeItem(getStorageKey(selectedProvider.value))
  }
}, { deep: true })

async function initAvatar() {
  if (avatarInstance.value || isAvatarInitializing.value) return

  isAvatarInitializing.value = true
  avatarStore.setInitializing(true)
  avatarStore.setError('')
  isAvatarLoading.value = true
  loadingText.value = '加载免费数字人...'

  try {
    const config = await loadAvatarConfig()
    loadingText.value = '下载人物模型...'
    avatarInstance.value = await avatarService.connect({
      ...config,
      container: avatarContainer.value
    }, {
      onProgress(progress) {
        const value = typeof progress === 'number' ? Math.round(progress) : null
        loadingText.value = value === null ? '下载人物模型...' : `加载中... ${value}%`
      },
      onVoiceStateChange(status) {
        isSpeaking.value = status === 'start'
        if (status === 'end') subtitleText.value = ''
      }
    })

    avatarInstance.value.setVolume(volume.value)
    sdkStatus.value = 0
    avatarInstance.value.idle()
  } catch (err) {
    console.error('免费数字人初始化失败：', err)
    avatarStore.setError(err.message || '数字人初始化失败')
    avatarInstance.value = null
  } finally {
    isAvatarInitializing.value = false
    avatarStore.setInitializing(false)
    isAvatarLoading.value = false
  }
}

function stopSpeak() {
  if (avatarInstance.value) {
    try {
      avatarInstance.value.stopSpeak()
    } catch (e) {
      console.warn('停止播报失败:', e)
    }
  }
  if (streamAbortController) {
    streamAbortController.abort()
    streamAbortController = null
  }
  subtitleText.value = ''
  isSpeaking.value = false
}

async function speakText(text) {
  if (!avatarInstance.value) {
    await initAvatar()
  }
  if (!avatarInstance.value) return

  try {
    subtitleText.value = text
    avatarInstance.value.speak(text)
  } catch (e) {
    console.error('播报失败:', e)
    subtitleText.value = ''
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  if (isConfigLoading.value || configError.value) return
  if (!selectedProvider.value) {
    apiKeyError.value = '请先加载并选择模型提供商'
    return
  }
  if (!hasConfiguredKey.value) {
    updateApiKeyHint()
    return
  }

  if (isThinking.value || isSpeaking.value) {
    stopSpeak()
    isThinking.value = false
    isReasoning.value = false
    streamingContent.value = ''
  }

  addMessage('user', text)
  inputText.value = ''

  isThinking.value = true
  isReasoning.value = false
  streamingContent.value = ''
  apiKeyError.value = ''

  let replyContent = ''

  try {
    if (avatarInstance.value) {
      avatarInstance.value.think()
    }

    streamAbortController = new AbortController()

    await chatService.sendStream(text, {
      onReasoning: () => {
        isReasoning.value = true
      },
      onChunk: (fullContent, delta) => {
        replyContent = fullContent
        isReasoning.value = false
        streamingContent.value = fullContent

        nextTick(() => {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
          }
        })
      },
      onDone: (fullContent) => {
        replyContent = fullContent
        streamingContent.value = ''
        addMessage('assistant', fullContent)
        speakText(fullContent)
      }
    })

    streamAbortController = null
    isThinking.value = false
    isReasoning.value = false

    if (avatarInstance.value && !replyContent) {
      avatarInstance.value.interactive_idle()
    }
  } catch (err) {
    streamAbortController = null
    isThinking.value = false
    isReasoning.value = false
    const errorMsg = err.message || '出错了'

    if (replyContent) {
      addMessage('assistant', replyContent)
      speakText(replyContent)
    }

    if (errorMsg.includes('API Key') || errorMsg.includes('配置')) {
      apiKeyError.value = errorMsg
    } else {
      if (!replyContent) {
        addMessage('assistant', `抱歉，${errorMsg}`)
      }
    }

    if (avatarInstance.value) {
      avatarInstance.value.interactive_idle()
    }
  }
}

function sendQuickQuestion(q) {
  inputText.value = q
  handleSend()
}

function handleVolumeChange() {
  if (avatarInstance.value) {
    avatarInstance.value.setVolume(volume.value)
  }
}

function toggleDebugInfo() {
  if (!avatarInstance.value) return
  showDebugInfo.value = !showDebugInfo.value
  try {
    if (showDebugInfo.value) {
      avatarInstance.value.showDebugInfo()
    } else {
      avatarInstance.value.hideDebugInfo()
    }
  } catch (e) {
    console.warn('切换调试面板失败:', e)
  }
}

function handleProviderChange() {
  const newProvider = selectedProvider.value
  const provider = providers.value.find((item) => item.key === newProvider)
  if (!provider) return

  chatService.setProvider(newProvider)
  selectedModel.value = provider.defaultModel
  chatService.setModel(selectedModel.value)
  chatService.clear()
  apiKeyError.value = ''
  apiKeyInput.value = getApiKey(newProvider)

  const saved = loadMessages(newProvider)
  messages.value = saved
  chatService.setHistory(saved)

  refreshProviderAvailability()
  updateApiKeyHint()
}

function handleModelChange() {
  if (!selectedProvider.value || !selectedModel.value) return
  try {
    chatService.setModel(selectedModel.value)
    apiKeyError.value = ''
  } catch (error) {
    apiKeyError.value = error.message || '模型切换失败'
  }
}

function refreshProviderAvailability() {
  providers.value = providers.value.map((provider) => ({
    ...provider,
    hasKey: hasApiKey(provider.key)
  }))
}

function updateApiKeyHint() {
  if (!selectedProvider.value || hasConfiguredKey.value) {
    apiKeyError.value = ''
    return
  }
  const providerName = currentProvider.value?.name || selectedProvider.value
  apiKeyError.value = `请先为 ${providerName} 配置 API Key`
}

function handleSaveApiKey() {
  if (!selectedProvider.value) return
  try {
    setApiKey(selectedProvider.value, apiKeyInput.value)
    apiKeyInput.value = getApiKey(selectedProvider.value)
    refreshProviderAvailability()
    updateApiKeyHint()
  } catch (error) {
    apiKeyError.value = error.message || 'API Key 保存失败'
  }
}

function handleClearApiKey() {
  if (!selectedProvider.value) return
  try {
    clearApiKey(selectedProvider.value)
    apiKeyInput.value = ''
    refreshProviderAvailability()
    updateApiKeyHint()
  } catch (error) {
    apiKeyError.value = error.message || 'API Key 清除失败'
  }
}

function handleDisconnect() {
  if (avatarInstance.value) {
    try {
      avatarService.disconnect()
    } catch (e) {
      console.error('销毁失败:', e)
    }
    avatarInstance.value = null
    avatarStore.reset()
  }
}

function handleBeforeUnload() {
  if (avatarInstance.value) {
    try {
      avatarService.disconnect()
    } catch (e) {
    }
  }
}

async function initializeModels() {
  isConfigLoading.value = true
  configError.value = ''
  apiKeyError.value = ''

  try {
    await loadProviderCatalog()
    providers.value = getAvailableProviders()
    const catalog = getProviderCatalog()
    const defaultProvider = providers.value.find((provider) => provider.key === catalog.defaultProvider) || providers.value[0]
    if (!defaultProvider) throw new Error('模型配置中没有可用提供商')

    selectedProvider.value = defaultProvider.key
    selectedModel.value = defaultProvider.defaultModel
    apiKeyInput.value = getApiKey(defaultProvider.key)
    chatService.setProvider(defaultProvider.key)
    chatService.setModel(defaultProvider.defaultModel)

    const saved = loadMessages(selectedProvider.value)
    if (saved.length > 0) {
      messages.value = saved
      chatService.setHistory(saved)
    }
    updateApiKeyHint()
  } catch (error) {
    providers.value = []
    selectedProvider.value = ''
    selectedModel.value = ''
    configError.value = error.message || '模型配置加载失败'
  } finally {
    isConfigLoading.value = false
  }
}

onMounted(() => {
  if (avatarContainer.value) {
    avatarContainer.value.id = 'avatarBox'
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  initializeModels()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  handleDisconnect()
})
</script>

<style scoped>
.ai-companion {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  height: 700px;
}

.avatar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.avatar-box {
  width: 380px;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;
}

.avatar-box :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar-loading ::v-deep(canvas) {
  opacity: 0.3;
}

.avatar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-avatar {
  text-align: center;
  color: #6b7280;
  padding: 20px;
}

.empty-avatar-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-avatar h3 {
  font-size: 18px;
  color: #374151;
  margin-bottom: 8px;
}

.empty-avatar p {
  font-size: 14px;
  margin: 4px 0;
}

.empty-avatar .empty-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
}

.loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 14px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-online {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-offline {
  background: #9ca3af;
}

.status-loading,
.status-thinking {
  background: #f59e0b;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 13px;
  color: #6b7280;
}

.status-divider {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
  margin: 0 4px;
}

.companion-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.link-btn {
  background: none;
  border: none;
  padding: 2px 8px;
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.link-btn:hover {
  background: rgba(37, 99, 235, 0.1);
}

.connecting-text {
  font-size: 13px;
  color: #f59e0b;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.chat-header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-header h2 {
  font-size: 18px;
  color: #1f2937;
  margin: 0;
}

.clear-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #fee2e2;
}

.chat-tip {
  font-size: 13px;
  color: #9ca3af;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-chat p {
  margin: 4px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  color: #d1d5db;
}

.message-item {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #dbeafe;
}

.message-item.assistant .message-avatar {
  background: #fce7f3;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
}

.message-item.user .message-bubble {
  background: #2563eb;
  color: #fff;
  border-top-right-radius: 4px;
}

.message-item.assistant .message-bubble {
  background: #f3f4f6;
  color: #1f2937;
  border-top-left-radius: 4px;
}

.message-bubble p {
  margin: 0;
  word-break: break-word;
}

.message-bubble.streaming p::after {
  content: '▍';
  display: inline-block;
  margin-left: 2px;
  color: #6366f1;
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-time {
  display: block;
  font-size: 11px;
  opacity: 0.6;
  margin-top: 4px;
}

.message-bubble.thinking {
  padding: 14px 16px;
}

.reasoning-text {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.chat-input-wrapper {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
}

.chat-input-box {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  min-height: 48px;
  max-height: 120px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.chat-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 48px;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.api-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.api-hint.error {
  color: #f59e0b;
}

.quick-actions {
  padding: 0 24px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 6px 14px;
  font-size: 12px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings {
  padding: 12px 24px 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  border-top: 1px solid #f3f4f6;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #6b7280;
}

.model-select {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
}

.model-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.model-select:disabled,
.api-key-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.setting-item--api-key {
  flex: 1 1 100%;
  min-width: 0;
}

.api-key-input {
  flex: 1 1 220px;
  min-width: 160px;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-family: inherit;
}

.api-key-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.key-btn {
  padding: 6px 12px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.key-btn--muted {
  border-color: #d1d5db;
  background: #fff;
  color: #6b7280;
}

.key-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bg-selector {
  display: flex;
  gap: 6px;
}

.bg-item {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.bg-item:hover {
  transform: scale(1.15);
}

.bg-item.active {
  border-color: #2563eb;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
}

.volume-value {
  font-size: 12px;
  color: #9ca3af;
  min-width: 32px;
}

.debug-btn {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.debug-btn:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
}

.debug-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.debug-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.subtitle-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 85%;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.subtitle-bar p {
  margin: 0;
  color: #fff;
  font-size: 15px;
  line-height: 1.5;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@media (max-width: 960px) {
  .ai-companion {
    flex-direction: column;
    height: auto;
    align-items: center;
  }

  .avatar-box {
    width: 100%;
    max-width: 380px;
    height: 500px;
  }

  .chat-section {
    width: 100%;
    max-width: 480px;
    min-height: 500px;
  }
}
</style>
