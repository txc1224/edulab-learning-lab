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

/**
 * Piper Plus 0.6.0 does not feed the optional speaker tensors when a model
 * declares them as required ONNX inputs. Newer Piper Plus runtimes use a
 * zero embedding with mask=0 to select the model's built-in speaker voice.
 * Keep this compatibility shim model-agnostic by reading the embedding
 * dimension from the loaded ONNX session metadata.
 */
export function installSpeakerEmbeddingFallback(tts, ort) {
  const session = tts?._session
  const inputNames = session?.inputNames || []
  if (!session || typeof session.run !== 'function' || !inputNames.includes('speaker_embedding')) {
    return false
  }
  if (session.__avatarSpeakerEmbeddingFallbackInstalled) return true
  if (!ort?.Tensor) throw new Error('onnxruntime-web Tensor 不可用')

  const getMetadata = (name) => {
    const index = inputNames.indexOf(name)
    return Array.isArray(session.inputMetadata)
      ? session.inputMetadata[index]
      : session.inputMetadata?.[name]
  }
  const toStaticShape = (metadata, fallback) => {
    const shape = metadata?.shape
    if (!Array.isArray(shape) || shape.length === 0) return fallback
    const normalized = shape.map((value, index) => {
      const number = Number(value)
      // ORT exposes dynamic batch dimensions as names such as "batch_size";
      // this service always synthesizes one utterance at a time.
      if (Number.isInteger(number) && number > 0) return number
      return index === 0 ? 1 : null
    })
    return normalized.every((value) => Number.isInteger(value) && value > 0)
      ? normalized
      : fallback
  }
  const embeddingShape = toStaticShape(getMetadata('speaker_embedding'), null)
  if (!embeddingShape) {
    throw new Error('无法读取 speaker_embedding 的模型维度')
  }
  const embeddingSize = embeddingShape.reduce((total, value) => total * value, 1)

  const hasMask = inputNames.includes('speaker_embedding_mask')
  const maskShape = hasMask
    ? toStaticShape(getMetadata('speaker_embedding_mask'), [1])
    : null
  const maskSize = maskShape?.reduce((total, value) => total * value, 1) || 0
  const originalRun = session.run.bind(session)
  session.run = (feeds = {}, ...args) => {
    const nextFeeds = { ...feeds }
    if (!nextFeeds.speaker_embedding) {
      nextFeeds.speaker_embedding = new ort.Tensor(
        'float32',
        new Float32Array(embeddingSize),
        embeddingShape
      )
    }
    if (hasMask && !nextFeeds.speaker_embedding_mask) {
      nextFeeds.speaker_embedding_mask = new ort.Tensor(
        'int64',
        new BigInt64Array(maskSize),
        maskShape
      )
    }
    return originalRun(nextFeeds, ...args)
  }
  Object.defineProperty(session, '__avatarSpeakerEmbeddingFallbackInstalled', {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  })
  return true
}

export function createAvatarService(options = {}) {
  let instance = null
  let generation = 0
  let speechGeneration = 0
  let speechUtterance = null
  let mouthAnimationTimer = null
  let activeHead = null
  let pendingHead = null
  let pendingContainer = null
  let speechVolume = 0.8
  let onVoiceStateChange = options.onVoiceStateChange || (() => {})
  let onVoiceError = options.onVoiceError || (() => {})
  let onTtsProgress = options.onTtsProgress || (() => {})
  let ttsConfig = options.ttsConfig || null
  let ttsInstance = null
  let ttsModel = ''
  let ttsInitPromise = null
  let audioContext = null
  let audioSource = null
  let audioPlaybackResolve = null
  const disposedHeads = new WeakSet()

  function disposeHead(head, container) {
    if (head && !disposedHeads.has(head)) {
      disposedHeads.add(head)
      try {
        head.dispose?.()
      } catch (error) {
        console.warn('销毁数字人渲染器失败:', error)
        try {
          head.stop?.()
        } catch {
          // The renderer may already be partially disposed.
        }
      }
    }
    container?.querySelectorAll('canvas').forEach((canvas) => canvas.remove())
  }

  function getSpeechSynthesis() {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
      throw new Error('当前浏览器不支持语音播报')
    }
    return window.speechSynthesis
  }

  function chooseChineseVoice(synth, preferredVoices = []) {
    const voices = synth.getVoices?.() || []
    const normalizeLanguage = (language) => String(language || '').toLowerCase().replace('_', '-')
    const mainlandVoices = voices.filter((voice) => normalizeLanguage(voice.lang) === 'zh-cn')
    const preferredNames = Array.isArray(preferredVoices) ? preferredVoices : []
    const matchesPreferredName = (voice) => preferredNames.some((name) => (
      String(voice.name || '').toLowerCase().includes(String(name).toLowerCase())
    ))

    return mainlandVoices.find((voice) => voice.localService && matchesPreferredName(voice))
      || mainlandVoices.find((voice) => voice.localService && voice.default)
      || mainlandVoices.find((voice) => voice.localService)
      || mainlandVoices.find(matchesPreferredName)
      || mainlandVoices[0]
      || voices.find((voice) => /^zh-(?:hans|sg)$/i.test(normalizeLanguage(voice.lang)))
      || voices.find((voice) => /chinese|中文|普通话|mandarin/i.test(voice.name))
      || null
  }

  function waitForVoices(synth, timeout = 400) {
    const voices = synth.getVoices?.() || []
    if (voices.length || typeof synth.addEventListener !== 'function') {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        synth.removeEventListener?.('voiceschanged', finish)
        clearTimeout(timer)
        resolve()
      }
      const timer = setTimeout(finish, timeout)
      synth.addEventListener('voiceschanged', finish, { once: true })
    })
  }

  function waitForSpeechQueue() {
    return new Promise((resolve) => setTimeout(resolve, 60))
  }

  function getAudioContext() {
    const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!AudioContextCtor) throw new Error('当前浏览器不支持 AudioContext')
    if (!audioContext) audioContext = new AudioContextCtor()
    return audioContext
  }

  function stopAudioPlayback() {
    if (audioSource) {
      audioSource.onended = null
      try {
        audioSource.stop()
      } catch {
        // The source may already have ended.
      }
      audioSource = null
    }
    audioPlaybackResolve?.()
    audioPlaybackResolve = null
  }

  async function playAudioResult(result, currentGeneration) {
    const context = getAudioContext()
    if (context.state === 'suspended') await context.resume()
    if (currentGeneration !== speechGeneration) return false

    const buffer = context.createBuffer(1, result.samples.length, result.sampleRate)
    buffer.copyToChannel(result.samples, 0)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    audioSource = source

    await new Promise((resolve) => {
      audioPlaybackResolve = resolve
      source.onended = () => {
        if (audioSource === source) audioSource = null
        if (audioPlaybackResolve === resolve) audioPlaybackResolve = null
        resolve()
      }
      source.start()
    })

    return currentGeneration === speechGeneration
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
    stopAudioPlayback()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    onVoiceStateChange('end')
  }

  async function speakNative(text, head, config = {}, requestedGeneration = null) {
    const content = String(text || '').trim()
    if (!content) return

    const synth = getSpeechSynthesis()
    const currentGeneration = requestedGeneration ?? ++speechGeneration
    stopMouthAnimation(head)

    await waitForVoices(synth)
    if (currentGeneration !== speechGeneration) return

    const utterance = new window.SpeechSynthesisUtterance(content)
    speechUtterance = utterance
    utterance.lang = config.language || 'zh-CN'
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = speechVolume
    const voice = chooseChineseVoice(synth, config.preferredVoices)
    if (voice) utterance.voice = voice
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
      const message = event.error ? `浏览器语音播报失败 (${event.error})` : '浏览器语音播报失败'
      onVoiceError(message)
      console.warn(`${message}:`, event.error)
    }

    synth.cancel()
    synth.resume?.()
    await waitForSpeechQueue()
    if (currentGeneration !== speechGeneration) return
    try {
      synth.speak(utterance)
    } catch (error) {
      speechUtterance = null
      throw error
    }
  }

  async function getLocalTts(config) {
    if (!config || config.engine !== 'piper-plus' || !config.model) {
      throw new Error('未配置 piper-plus 本地语音模型')
    }
    if (ttsInstance && ttsModel === config.model) return ttsInstance
    if (!ttsInitPromise) {
      ttsInitPromise = (async () => {
        const [{ PiperPlus }, ort] = await Promise.all([
          import('piper-plus'),
          import('onnxruntime-web')
        ])
        if (config.ortWasmUrl && ort.env?.wasm) {
          ort.env.wasm.wasmPaths = { wasm: config.ortWasmUrl }
        }
        const modelUrl = /^https?:\/\//i.test(config.model)
          ? config.model
          : new URL(config.model, globalThis.location?.href || 'http://localhost/').href
        const instance = await PiperPlus.initialize({
          model: modelUrl,
          ort,
          zhDictBaseUrl: config.zhDictBaseUrl,
          wasmG2pUrl: config.wasmG2pUrl,
          onProgress: (progress) => {
            onTtsProgress(progress)
          }
        })
        installSpeakerEmbeddingFallback(instance, ort)
        ttsInstance = instance
        ttsModel = config.model
        return instance
      })().finally(() => {
        ttsInitPromise = null
      })
    }
    return ttsInitPromise
  }

  async function resolveTtsConfig() {
    if (ttsConfig) return ttsConfig
    const config = avatarConfig || await loadAvatarConfig()
    ttsConfig = config.tts || null
    return ttsConfig
  }

  async function speak(text, head) {
    const content = String(text || '').trim()
    if (!content) return

    const currentGeneration = ++speechGeneration
    speechUtterance = null
    stopMouthAnimation(head)
    stopAudioPlayback()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    try {
      const config = await resolveTtsConfig()
      if (currentGeneration !== speechGeneration) return
      if (config?.engine === 'browser') {
        await speakNative(content, head, config, currentGeneration)
        return
      }

      const tts = await getLocalTts(config)
      if (currentGeneration !== speechGeneration) return

      const result = await tts.synthesize(content, {
        language: config.language || 'zh',
        lengthScale: config.lengthScale,
        noiseScale: config.noiseScale,
        noiseW: config.noiseW
      })
      if (currentGeneration !== speechGeneration) return

      onVoiceStateChange('start')
      startMouthAnimation(head, currentGeneration)
      const completed = await playAudioResult(result, currentGeneration)
      if (currentGeneration !== speechGeneration || !completed) return
      stopMouthAnimation(head)
      onVoiceStateChange('end')
    } catch (error) {
      if (currentGeneration !== speechGeneration) return
      const message = error instanceof Error ? error.message : String(error)
      console.warn('本地 Piper 语音失败，回退浏览器 TTS:', error)
      onVoiceError(`本地语音加载失败，已回退浏览器 TTS：${message}`)
      try {
        await speakNative(content, head, { language: 'zh-CN' }, currentGeneration)
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError)
        onVoiceError(fallbackMessage)
      }
    }
  }

  function prepareSpeech() {
    try {
      const context = getAudioContext()
      void context.resume?.()
    } catch {
      // The local TTS path will report an actionable error if AudioContext is unavailable.
    }

    try {
      const synth = getSpeechSynthesis()
      synth.cancel()
      synth.resume?.()

      // Prime browser autoplay permission from the user's send-button gesture.
      const unlockUtterance = new window.SpeechSynthesisUtterance(' ')
      unlockUtterance.volume = 0
      unlockUtterance.rate = 10
      synth.speak(unlockUtterance)
    } catch {
      // Browser speech is only a fallback; local Piper does not need it.
    }
  }

  async function connect(config, options = {}) {
    if (instance) return instance
    if (!config?.container || !config?.avatarUrl) throw new Error('数字人容器或模型地址缺失')

    const container = typeof config.container === 'string'
      ? document.querySelector(config.container)
      : config.container
    if (!container) throw new Error('数字人容器不存在')

    // A failed TalkingHead connection may leave its canvas mounted. Remove stale
    // canvases before retrying so each connection owns exactly one renderer.
    container.querySelectorAll('canvas').forEach((canvas) => canvas.remove())

    const module = await import('@met4citizen/talkinghead')
    const TalkingHead = module.TalkingHead
    if (!TalkingHead) throw new Error('TalkingHead 模块加载失败')

    const currentGeneration = ++generation
    ttsConfig = config.tts || ttsConfig
    if (typeof options.onVoiceStateChange === 'function') onVoiceStateChange = options.onVoiceStateChange
    if (typeof options.onVoiceError === 'function') onVoiceError = options.onVoiceError
    const head = new TalkingHead(container, {
      cameraView: config.view || 'upper',
      cameraRotateEnable: false,
      cameraPanEnable: false,
      cameraZoomEnable: false,
      avatarMood: 'neutral',
      modelPixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    })
    pendingHead = head
    pendingContainer = container

    const avatarOptions = {
      url: config.avatarUrl,
      lipsyncLang: config.lipsyncLanguage || 'en'
    }
    for (const key of ['body', 'avatarMood', 'baseline', 'retarget', 'modelDynamicBones']) {
      if (config[key] !== undefined) avatarOptions[key] = config[key]
    }

    try {
      await head.showAvatar(avatarOptions, (progress) => {
        if (currentGeneration !== generation) return
        options.onProgress?.(progress)
      })
    } catch (error) {
      disposeHead(head, container)
      throw error
    } finally {
      if (pendingHead === head) {
        pendingHead = null
        pendingContainer = null
      }
    }

    if (currentGeneration !== generation) {
      disposeHead(head, container)
      throw new Error('数字人连接已取消')
    }

    activeHead = head
    const adapter = {
      engine: head,
      setVolume(value) {
        speechVolume = Math.min(1, Math.max(0, Number(value)))
      },
      speak(text) {
        return speak(text, head)
      },
      stopSpeak: stopSpeech,
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
        disposeHead(head, container)
        if (activeHead === head) activeHead = null
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
    disposeHead(pendingHead, pendingContainer)
    pendingHead = null
    pendingContainer = null
    instance?.destroy()
    instance = null
    activeHead = null
  }

  return {
    connect,
    getInstance,
    disconnect,
    speak: (text) => speak(text, activeHead),
    prepareSpeech,
    stopSpeak: stopSpeech,
    setVolume: (value) => {
      speechVolume = Math.min(1, Math.max(0, Number(value)))
    },
    setTtsConfig: (config) => {
      ttsConfig = config || null
    },
    setVoiceHandlers: ({ onVoiceStateChange: onState, onVoiceError: onError, onTtsProgress: onProgress } = {}) => {
      if (typeof onState === 'function') onVoiceStateChange = onState
      if (typeof onError === 'function') onVoiceError = onError
      if (typeof onProgress === 'function') onTtsProgress = onProgress
    }
  }
}
