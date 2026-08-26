import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAvatarService, installSpeakerEmbeddingFallback } from './avatar.service.js'

function installSpeechMock({ error, voices } = {}) {
  const utterances = []
  const synth = {
    cancel: vi.fn(),
    resume: vi.fn(),
    speak: vi.fn((utterance) => {
      utterances.push(utterance)
      if (error) utterance.onerror?.({ error })
      else utterance.onstart?.()
    }),
    getVoices: vi.fn(() => voices || [{ lang: 'zh-CN', name: 'Chinese', localService: true }])
  }

  class FakeUtterance {
    constructor(text) {
      this.text = text
    }
  }

  globalThis.window = {
    speechSynthesis: synth,
    SpeechSynthesisUtterance: FakeUtterance
  }

  return { synth, utterances }
}

afterEach(() => {
  delete globalThis.window
})

describe('avatar browser speech fallback', () => {
  it('speaks without a connected 3D avatar', async () => {
    const { synth, utterances } = installSpeechMock()
    const onStateChange = vi.fn()
    const onVoiceError = vi.fn()
    const service = createAvatarService({
      onVoiceStateChange: onStateChange,
      onVoiceError,
      ttsConfig: { engine: 'browser' }
    })

    await service.speak('你好，小星')

    expect(synth.resume).toHaveBeenCalledOnce()
    expect(synth.speak).toHaveBeenCalledOnce()
    expect(utterances[0].text).toBe('你好，小星')
    expect(utterances[0].lang).toBe('zh-CN')
    expect(onStateChange).toHaveBeenCalledWith('start')
    expect(onVoiceError).not.toHaveBeenCalled()
  })

  it('prefers a local mainland Mandarin voice over Japanese and regional Chinese voices', async () => {
    const mandarinVoice = { lang: 'zh-CN', name: '婷婷', localService: true }
    const { utterances } = installSpeechMock({
      voices: [
        { lang: 'ja-JP', name: 'Kyoko', localService: true },
        { lang: 'zh-TW', name: '美嘉', localService: true },
        { lang: 'zh-CN', name: 'Google 普通话（中国大陆）', localService: false },
        mandarinVoice
      ]
    })
    const service = createAvatarService({
      ttsConfig: {
        engine: 'browser',
        language: 'zh-CN',
        preferredVoices: ['婷婷', 'Tingting', '普通话', 'Mandarin']
      }
    })

    await service.speak('这次使用普通话播报')

    expect(utterances[0].voice).toBe(mandarinVoice)
    expect(utterances[0].lang).toBe('zh-CN')
  })

  it('reports browser speech errors to the page', async () => {
    const { synth } = installSpeechMock({ error: 'not-allowed' })
    const onVoiceError = vi.fn()
    const service = createAvatarService({
      onVoiceError,
      ttsConfig: { engine: 'browser' }
    })

    await service.speak('测试声音')

    expect(synth.speak).toHaveBeenCalledOnce()
    expect(onVoiceError).toHaveBeenLastCalledWith('浏览器语音播报失败 (not-allowed)')
  })
})

describe('piper speaker embedding compatibility', () => {
  it('feeds a model-sized zero embedding and disabled mask when omitted', async () => {
    const calls = []
    const session = {
      inputNames: ['input', 'speaker_embedding', 'speaker_embedding_mask'],
      inputMetadata: [
        { name: 'input', shape: [1, 'phonemes'] },
        { name: 'speaker_embedding', shape: [1, 256] },
        { name: 'speaker_embedding_mask', shape: [1, 1] }
      ],
      run: vi.fn((feeds) => {
        calls.push(feeds)
        return Promise.resolve({})
      })
    }
    class FakeTensor {
      constructor(type, data, dims) {
        this.type = type
        this.data = data
        this.dims = dims
      }
    }

    const tts = { _session: session }
    expect(installSpeakerEmbeddingFallback(tts, { Tensor: FakeTensor })).toBe(true)
    await session.run({ input: 'phonemes' })

    expect(calls).toHaveLength(1)
    expect(calls[0].speaker_embedding.type).toBe('float32')
    expect(calls[0].speaker_embedding.data).toBeInstanceOf(Float32Array)
    expect(calls[0].speaker_embedding.data).toHaveLength(256)
    expect(calls[0].speaker_embedding.dims).toEqual([1, 256])
    expect(calls[0].speaker_embedding_mask.type).toBe('int64')
    expect(calls[0].speaker_embedding_mask.dims).toEqual([1, 1])
    expect(Array.from(calls[0].speaker_embedding_mask.data)).toEqual([0n])
  })

  it('preserves an explicitly supplied speaker embedding', async () => {
    const calls = []
    const session = {
      inputNames: ['speaker_embedding', 'speaker_embedding_mask'],
      inputMetadata: [
        { name: 'speaker_embedding', shape: [1, 4] },
        { name: 'speaker_embedding_mask', shape: [1, 1] }
      ],
      run: vi.fn((feeds) => {
        calls.push(feeds)
        return Promise.resolve({})
      })
    }
    class FakeTensor {
      constructor(type, data, dims) {
        this.type = type
        this.data = data
        this.dims = dims
      }
    }

    installSpeakerEmbeddingFallback({ _session: session }, { Tensor: FakeTensor })
    const embedding = new FakeTensor('float32', new Float32Array([1, 2, 3, 4]), [1, 4])
    const mask = new FakeTensor('int64', new BigInt64Array([1n]), [1])
    await session.run({ speaker_embedding: embedding, speaker_embedding_mask: mask })

    expect(calls[0].speaker_embedding).toBe(embedding)
    expect(calls[0].speaker_embedding_mask).toBe(mask)
  })
})
