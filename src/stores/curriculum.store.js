import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import curriculum, { defaultLessonId, findLesson } from '../features/edulab/data/curriculum.js'

export const useCurriculumStore = defineStore('curriculum', () => {
  const volumes = ref(curriculum)
  const activeVolumeId = ref('')
  const activeChapterId = ref('')
  const activeLessonId = ref('')

  const activeVolume = computed(() => (
    volumes.value.find((volume) => volume.id === activeVolumeId.value) || volumes.value[0] || null
  ))
  const activeChapter = computed(() => (
    activeVolume.value?.chapters.find((chapter) => chapter.id === activeChapterId.value)
      || activeVolume.value?.chapters[0]
      || null
  ))
  const activeLesson = computed(() => (
    activeChapter.value?.lessons.find((lesson) => lesson.id === activeLessonId.value)
      || activeChapter.value?.lessons[0]
      || null
  ))

  function selectLesson(lessonId) {
    const lesson = findLesson(lessonId, volumes.value)
    if (!lesson) return false
    activeVolumeId.value = lesson.volumeId
    activeChapterId.value = lesson.chapterId
    activeLessonId.value = lesson.id
    return true
  }

  function setVolume(volumeId) {
    const volume = volumes.value.find((item) => item.id === volumeId)
    if (!volume) return false
    const chapter = volume.chapters[0]
    const lesson = chapter?.lessons[0]
    activeVolumeId.value = volume.id
    activeChapterId.value = chapter?.id || ''
    activeLessonId.value = lesson?.id || ''
    return true
  }

  function setChapter(chapterId) {
    const chapter = activeVolume.value?.chapters.find((item) => item.id === chapterId)
    if (!chapter) return false
    activeChapterId.value = chapter.id
    activeLessonId.value = chapter.lessons[0]?.id || ''
    return true
  }

  function initialize(lessonId) {
    if (lessonId && selectLesson(lessonId)) return true
    selectLesson(defaultLessonId)
    return !lessonId
  }

  return {
    volumes,
    activeVolumeId,
    activeChapterId,
    activeLessonId,
    activeVolume,
    activeChapter,
    activeLesson,
    selectLesson,
    setVolume,
    setChapter,
    initialize
  }
})
