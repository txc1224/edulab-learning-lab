import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAvatarStore } from './avatar.store.js'

describe('avatar store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('tracks SDK status and volume without holding SDK instances', () => {
    const store = useAvatarStore()
    store.setInitializing(true)
    expect(store.statusText).toBe('数字人初始化中...')
    store.setInitializing(false)
    store.setStatus(0)
    store.setVolume(2)
    expect(store.isConnected).toBe(true)
    expect(store.volume).toBe(1)
    store.reset()
    expect(store.status).toBe(-1)
  })
})
