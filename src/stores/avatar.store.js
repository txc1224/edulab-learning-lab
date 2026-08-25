import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAvatarStore = defineStore('avatar', () => {
  const status = ref(-1)
  const isInitializing = ref(false)
  const isConnected = ref(false)
  const isSpeaking = ref(false)
  const volume = ref(0.8)
  const error = ref('')

  const statusText = computed(() => {
    if (isInitializing.value) return '数字人初始化中...'
    if (isSpeaking.value) return '播报中'
    if (status.value === 0 || status.value === 6) return '在线'
    if (status.value === -1 || status.value === 4 || status.value === 7) return '未连接'
    return '连接中'
  })

  function setInitializing(value) {
    isInitializing.value = value
  }

  function setStatus(value) {
    status.value = value
    isConnected.value = value === 0 || value === 6
  }

  function setSpeaking(value) {
    isSpeaking.value = value
  }

  function setVolume(value) {
    volume.value = Math.min(1, Math.max(0, Number(value)))
  }

  function setError(message) {
    error.value = message || ''
  }

  function reset() {
    status.value = -1
    isInitializing.value = false
    isConnected.value = false
    isSpeaking.value = false
    error.value = ''
  }

  return {
    status,
    statusText,
    isInitializing,
    isConnected,
    isSpeaking,
    volume,
    error,
    setInitializing,
    setStatus,
    setSpeaking,
    setVolume,
    setError,
    reset
  }
})
