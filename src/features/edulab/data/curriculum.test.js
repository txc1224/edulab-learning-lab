import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCurriculumStore } from '../../../stores/curriculum.store.js'
import { normalizeReactionSpec } from '../services/reaction-engine.js'
import curriculum, { defaultLessonId, flattenLessons } from './curriculum.js'
import coreReactions from './core-reactions.js'

describe('edulab curriculum', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('contains two junior and three senior study stages with unique lesson ids', () => {
    const lessons = flattenLessons(curriculum)

    expect(curriculum.map((volume) => volume.id)).toEqual([
      'junior-upper',
      'junior-lower',
      'senior-one',
      'senior-two',
      'senior-three'
    ])
    expect(lessons.length).toBeGreaterThanOrEqual(80)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length)
    expect(lessons.filter((lesson) => lesson.kind === 'reaction').length).toBeGreaterThan(10)
    expect(lessons.filter((lesson) => lesson.kind === 'concept').length).toBeGreaterThan(30)
  })

  it('resolves every lesson reaction and validates every reaction spec', () => {
    flattenLessons(curriculum).filter((lesson) => lesson.reactionId).forEach((lesson) => {
      expect(coreReactions[lesson.reactionId], `${lesson.id} 缺少反应模型`).toBeTruthy()
    })

    Object.entries(coreReactions).forEach(([reactionId, spec]) => {
      expect(() => normalizeReactionSpec(spec), `${reactionId} 反应模型无效`).not.toThrow()
    })
  })

  it('gives every non-reaction lesson a visual knowledge model', () => {
    flattenLessons(curriculum).filter((lesson) => !lesson.reactionId).forEach((lesson) => {
      expect(lesson.visual?.items?.length, `${lesson.id} 缺少知识图`).toBeGreaterThanOrEqual(3)
      expect(lesson.visual.takeaway, `${lesson.id} 缺少本课抓手`).toBeTruthy()
    })
  })

  it('selects a lesson from the URL and falls back for an invalid lesson id', () => {
    const store = useCurriculumStore()

    expect(store.initialize('st-ethene-addition')).toBe(true)
    expect(store.activeVolumeId).toBe('senior-two')
    expect(store.activeLessonId).toBe('st-ethene-addition')

    expect(store.initialize('not-a-lesson')).toBe(false)
    expect(store.activeLessonId).toBe(defaultLessonId)
  })
})
