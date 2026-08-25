import { describe, expect, it } from 'vitest'
import acidBaseNeutralization from '../data/acid-base-neutralization.js'
import { interpolateAtoms, normalizeReactionSpec } from './reaction-engine.js'

describe('reaction-engine', () => {
  it('assembles the acid-base reaction and validates conservation', () => {
    const data = normalizeReactionSpec(acidBaseNeutralization)

    expect(data.atoms).toHaveLength(5)
    expect(data.elementCounts).toEqual({ H: 2, O: 1, Na: 1, Cl: 1 })
    expect(data.chargeTotals).toEqual({ before: 0, after: 0 })
    expect(data.bonds.broken).toHaveLength(0)
    expect(data.bonds.formed).toHaveLength(1)
    expect(data.meta.netIonicEquation).toContain('H^+')
    expect(data.meta.equations).toHaveLength(2)
  })

  it('rejects incomplete atom mappings', () => {
    const invalidSpec = {
      ...acidBaseNeutralization,
      atomMap: acidBaseNeutralization.atomMap.slice(0, -1)
    }

    expect(() => normalizeReactionSpec(invalidSpec)).toThrow('未覆盖全部反应物原子')
  })

  it('rejects mappings with different elements', () => {
    const invalidSpec = {
      ...acidBaseNeutralization,
      atomMap: acidBaseNeutralization.atomMap.map((pair, index) => (
        index === 0 ? [pair[0], 'H2O#1.A'] : pair
      ))
    }

    expect(() => normalizeReactionSpec(invalidSpec)).toThrow('元素映射不一致')
  })

  it('interpolates atoms between reactant and product positions', () => {
    const data = normalizeReactionSpec(acidBaseNeutralization)
    const start = interpolateAtoms(data.atoms, 0)
    const end = interpolateAtoms(data.atoms, 1)
    const middle = interpolateAtoms(data.atoms, 0.5)

    expect(start[0].position).toEqual(data.atoms[0].start)
    expect(end[0].position).toEqual(data.atoms[0].end)
    expect(middle[0].position[0]).toBe((start[0].position[0] + end[0].position[0]) / 2)
  })
})
