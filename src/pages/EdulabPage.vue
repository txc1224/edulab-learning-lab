<template>
  <section class="page page--edulab">
    <div class="page-heading page-heading--edulab">
      <div class="edulab-heading__content">
        <div class="edulab-heading__utility">
          <span>CHEMISTRY NOTEBOOK / 01</span>
          <i></i>
          <span>教材实验手册</span>
        </div>
        <p class="eyebrow">Edulab · 初高中化学课程</p>
        <h1>跟着课本，看懂每一步反应</h1>
        <p>按教材章节学习实验现象、宏观结论和微观粒子变化。</p>
      </div>
      <div class="edulab-heading__side">
        <div class="page-heading__badge">{{ stageSummary }}</div>
        <div class="edulab-heading__elements" aria-label="元素索引">
          <span><strong>H</strong><small>氢</small></span>
          <span><strong>C</strong><small>碳</small></span>
          <span><strong>O</strong><small>氧</small></span>
          <span><strong>Na</strong><small>钠</small></span>
          <span><strong>Cl</strong><small>氯</small></span>
        </div>
      </div>
    </div>

    <CurriculumNavigator
      :volumes="curriculumStore.volumes"
      :active-volume="curriculumStore.activeVolume"
      :active-chapter="curriculumStore.activeChapter"
      :active-volume-id="curriculumStore.activeVolumeId"
      :active-chapter-id="curriculumStore.activeChapterId"
      :active-lesson-id="curriculumStore.activeLessonId"
      @select-volume="selectVolume"
      @select-chapter="selectChapter"
      @select-lesson="selectLesson"
    />

    <TextbookLesson
      :lesson="curriculumStore.activeLesson"
      :reaction-spec="reactionSpec"
      :stage-label="curriculumStore.activeVolume?.stageLabel"
      :volume-title="curriculumStore.activeVolume?.title"
    />
  </section>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CurriculumNavigator from '../features/edulab/components/CurriculumNavigator.vue'
import TextbookLesson from '../features/edulab/components/TextbookLesson.vue'
import { flattenLessons } from '../features/edulab/data/curriculum.js'
import { getReactionSpec } from '../features/edulab/data/core-reactions.js'
import { useCurriculumStore } from '../stores/curriculum.store.js'

const route = useRoute()
const router = useRouter()
const curriculumStore = useCurriculumStore()

const lessonCount = computed(() => flattenLessons(curriculumStore.volumes).length)
const stageSummary = computed(() => {
  const juniorCount = curriculumStore.volumes.filter((volume) => volume.stage === 'junior').length
  const seniorCount = curriculumStore.volumes.filter((volume) => volume.stage === 'senior').length
  return `${juniorCount} 个初中阶段 · ${seniorCount} 个高中阶段 · ${lessonCount.value} 节课程`
})
const reactionSpec = computed(() => getReactionSpec(curriculumStore.activeLesson?.reactionId))

function navigateToActiveLesson(replace = false) {
  const location = { name: 'edulab', params: { lessonId: curriculumStore.activeLessonId } }
  return replace ? router.replace(location) : router.push(location)
}

function selectVolume(volumeId) {
  if (curriculumStore.setVolume(volumeId)) navigateToActiveLesson()
}

function selectChapter(chapterId) {
  if (curriculumStore.setChapter(chapterId)) navigateToActiveLesson()
}

function selectLesson(lessonId) {
  if (curriculumStore.selectLesson(lessonId)) navigateToActiveLesson()
}

watch(() => route.params.lessonId, (lessonId) => {
  const isValid = curriculumStore.initialize(typeof lessonId === 'string' ? lessonId : '')
  if (lessonId && !isValid) navigateToActiveLesson(true)
}, { immediate: true })
</script>
