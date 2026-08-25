import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import acidBaseNeutralization from '../features/edulab/data/acid-base-neutralization.js'
import { useReactionStore } from './reaction.store.js'

describe('reaction store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('loads a valid reaction and controls progress', () => {
    const store = useReactionStore()
    store.loadReaction(acidBaseNeutralization)

    expect(store.hasError).toBe(false)
    expect(store.steps).toHaveLength(3)
    store.goToStep(2)
    expect(store.currentStep).toBe(2)
    expect(store.progress).toBe(0.5)
    store.reset()
    expect(store.progress).toBe(0)
  })

  it('exposes validation errors for an invalid reaction', () => {
    const store = useReactionStore()
    store.loadReaction({ reactants: [], products: [] })

    expect(store.hasError).toBe(true)
    expect(store.validationErrors[0]).toContain('反应物')
  })
})
