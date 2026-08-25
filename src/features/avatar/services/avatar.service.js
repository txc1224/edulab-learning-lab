const DEFAULT_AVATAR_CONFIG_URL = '/avatar.config.json'

let avatarConfig = null

export async function loadAvatarConfig(url = DEFAULT_AVATAR_CONFIG_URL) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`数字人配置加载失败 (${response.status})`)

  const config = await response.json()
  if (!config || config.engine !== 'talkinghead' || !config.avatarUrl) {
    throw new Error('数字人配置无效：需要 talkinghead engine 和 avatarUrl')
  }

  avatarConfig = { ...config }
  return { ...avatarConfig }
}

export function getAvatarConfig() {
  return avatarConfig ? { ...avatarConfig } : null
}

export function createAvatarService() {
  let instance = null
  let generation = 0
  let speechGeneration = 0
  let speechUtterance = null
  let mouthAnimationTimer = null
  let activeHead = null
  let pendingHead = null
  let speechVolume = 0.8
  let onVoiceStateChange = () => {}

  function getSpeechSynthesis() {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
      throw new Error('当前浏览器不支持语音播报')
    }
    return window.speechSynthesis
  }

  function chooseChineseVoice(synth) {
    const voices = synth.getVoices?.() || []
    return voices.find((voice) => /^zh(-|_)/i.test(voice.lang))
      || voices.find((voice) => /chinese|中文|普通话|mandarin/i.test(voice.name))
      || null
  }

  function stopMouthAnimation(head = activeHead) {
    if (mouthAnimationTimer) {
      clearInterval(mouthAnimationTimer)
      mouthAnimationTimer = null
    }
    head?.setValue?.('mouthOpen', 0, 120)
  }

  function startMouthAnimation(head, currentGeneration) {
    stopMouthAnimation(head)
    if (!head?.setValue) return

    const animateMouth = () => {
      if (currentGeneration !== speechGeneration || activeHead !== head) return
      const phase = Date.now() / 150
      const value = 0.08 + Math.abs(Math.sin(phase)) * 0.42
      head.setValue('mouthOpen', value, 110)
    }

    animateMouth()
    mouthAnimationTimer = setInterval(animateMouth, 120)
  }

  function stopSpeech() {
    speechGeneration += 1
    speechUtterance = null
    stopMouthAnimation()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    onVoiceStateChange('end')
  }

  function speak(text, head) {
    const content = String(text || '').trim()
    if (!content) return

    const synth = getSpeechSynthesis()
    const utterance = new window.SpeechSynthesisUtterance(content)
    const currentGeneration = ++speechGeneration
    stopMouthAnimation(head)
    speechUtterance = utterance
    utterance.lang = 'zh-CN'
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = speechVolume
    utterance.voice = chooseChineseVoice(synth)
    utterance.onstart = () => {
      if (currentGeneration !== speechGeneration) return
      startMouthAnimation(head, currentGeneration)
      onVoiceStateChange('start')
    }
    utterance.onend = () => {
      if (currentGeneration !== speechGeneration) return
      stopMouthAnimation(head)
      speechUtterance = null
      onVoiceStateChange('end')
    }
    utterance.onerror = (event) => {
      if (currentGeneration !== speechGeneration) return
      stopMouthAnimation(head)
      speechUtterance = null
      onVoiceStateChange('end')
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('浏览器语音播报失败:', event.error)
      }
    }

    synth.cancel()
    synth.speak(utterance)
  }

  async function connect(config, options = {}) {
    if (instance) return instance
    if (!config?.container || !config?.avatarUrl) throw new Error('数字人容器或模型地址缺失')

    const container = typeof config.container === 'string'
      ? document.querySelector(config.container)
      : config.container
    if (!container) throw new Error('数字人容器不存在')

    const module = await import('@met4citizen/talkinghead')
    const TalkingHead = module.TalkingHead
    if (!TalkingHead) throw new Error('TalkingHead 模块加载失败')

    const currentGeneration = ++generation
    onVoiceStateChange = options.onVoiceStateChange || (() => {})
    const head = new TalkingHead(container, {
      cameraView: config.view || 'upper',
      cameraRotateEnable: false,
      cameraPanEnable: false,
      cameraZoomEnable: false,
      avatarMood: 'neutral',
      modelPixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    })
    pendingHead = head

    try {
      await head.showAvatar({
        url: config.avatarUrl,
        body: config.body,
        lipsyncLang: config.lipsyncLanguage || 'en'
      }, (progress) => {
        if (currentGeneration !== generation) return
        options.onProgress?.(progress)
      })
    } catch (error) {
      head.stop?.()
      throw error
    } finally {
      if (pendingHead === head) pendingHead = null
    }

    if (currentGeneration !== generation) {
      head.stop?.()
      throw new Error('数字人连接已取消')
    }

    activeHead = head
    const adapter = {
      engine: head,
      setVolume(value) {
        speechVolume = Math.min(1, Math.max(0, Number(value)))
      },
      speak(text) {
        speak(text, head)
      },
      stopSpeak,
      listen() {
        head.setMood?.('neutral')
      },
      think() {
        head.setMood?.('neutral')
      },
      idle() {
        head.setMood?.('neutral')
      },
      interactive_idle() {
        head.setMood?.('neutral')
      },
      showDebugInfo() {},
      hideDebugInfo() {},
      destroy() {
        generation += 1
        stopSpeech()
        head.stop?.()
        if (activeHead === head) activeHead = null
        container.replaceChildren()
        if (instance === adapter) instance = null
      }
    }

    instance = adapter
    return adapter
  }

  function getInstance() {
    return instance
  }

  function disconnect() {
    generation += 1
    pendingHead?.stop?.()
    pendingHead = null
    instance?.destroy()
    instance = null
  }

  return { connect, getInstance, disconnect }
}
