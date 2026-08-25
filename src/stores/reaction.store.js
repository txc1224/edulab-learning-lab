import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { normalizeReactionSpec } from '../features/edulab/services/reaction-engine.js'

export const useReactionStore = defineStore('reaction', () => {
  const spec = ref(null)
  const reactionData = ref(null)
  const progress = ref(0)
  const currentStep = ref(1)
  const isPlaying = ref(false)
  const validationErrors = ref([])
  const showLabels = ref(true)
  const showEnergy = ref(true)
  let timer = null

  const hasError = computed(() => validationErrors.value.length > 0)
  const steps = computed(() => reactionData.value?.steps || [])

  function setProgress(value) {
    progress.value = Math.min(1, Math.max(0, Number(value)))
    const total = steps.value.length
    if (!total) return
    currentStep.value = Math.min(total, Math.floor(progress.value * total) + 1)
    if (progress.value >= 1) pause()
  }

  function loadReaction(nextSpec) {
    pause()
    spec.value = nextSpec
    progress.value = 0
    currentStep.value = 1
    try {
      reactionData.value = normalizeReactionSpec(nextSpec)
      validationErrors.value = []
    } catch (error) {
      reactionData.value = null
      validationErrors.value = [error.message || '反应数据无效']
    }
  }

  function goToStep(step) {
    const total = steps.value.length
    if (!total) return
    const next = Math.min(total, Math.max(1, Number(step)))
    currentStep.value = next
    setProgress(total === 1 ? 1 : (next - 1) / (total - 1))
  }

  function play() {
    if (hasError.value || !reactionData.value || isPlaying.value) return
    if (progress.value >= 1) progress.value = 0
    isPlaying.value = true
    timer = window.setInterval(() => setProgress(progress.value + 0.008), 32)
  }

  function pause() {
    isPlaying.value = false
    if (timer) window.clearInterval(timer)
    timer = null
  }

  function reset() {
    pause()
    setProgress(0)
    currentStep.value = 1
  }

  return {
    spec,
    reactionData,
    progress,
    currentStep,
    isPlaying,
    validationErrors,
    showLabels,
    showEnergy,
    hasError,
    steps,
    loadReaction,
    setProgress,
    goToStep,
    play,
    pause,
    reset
  }
})
