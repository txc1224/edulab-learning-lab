<template>
  <section class="curriculum-nav" aria-label="教材课程导航">
    <div class="curriculum-nav__header">
      <span class="curriculum-nav__header-title">教材实验索引</span>
      <span class="curriculum-nav__header-path">OBSERVE <b>→</b> EXPLAIN <b>→</b> CHECK</span>
    </div>
    <div class="curriculum-nav__row curriculum-nav__row--volumes">
      <div class="curriculum-nav__label">
        <span>01</span>
        <strong>选择教材</strong>
      </div>
      <div class="curriculum-nav__options curriculum-nav__options--volumes">
        <button
          v-for="volume in volumes"
          :key="volume.id"
          type="button"
          class="curriculum-nav__volume"
          :class="{ 'curriculum-nav__volume--active': volume.id === activeVolumeId }"
          :aria-pressed="volume.id === activeVolumeId"
          @click="$emit('select-volume', volume.id)"
        >
          <span>{{ volume.stageLabel }}</span>
          <strong>{{ volume.title }}</strong>
        </button>
      </div>
    </div>

    <div class="curriculum-nav__row">
      <div class="curriculum-nav__label">
        <span>02</span>
        <strong>选择章节</strong>
      </div>
      <div class="curriculum-nav__options curriculum-nav__options--scroll">
        <button
          v-for="chapter in activeVolume?.chapters || []"
          :key="chapter.id"
          type="button"
          class="curriculum-nav__chapter"
          :class="{ 'curriculum-nav__chapter--active': chapter.id === activeChapterId }"
          :aria-pressed="chapter.id === activeChapterId"
          @click="$emit('select-chapter', chapter.id)"
        >{{ chapter.shortTitle }}</button>
      </div>
    </div>

    <div class="curriculum-nav__row">
      <div class="curriculum-nav__label">
        <span>03</span>
        <strong>选择课程</strong>
      </div>
      <div class="curriculum-nav__options curriculum-nav__options--scroll">
        <button
          v-for="(lesson, index) in activeChapter?.lessons || []"
          :key="lesson.id"
          type="button"
          class="curriculum-nav__lesson"
          :class="[
            `curriculum-nav__lesson--${lesson.kind || 'concept'}`,
            { 'curriculum-nav__lesson--active': lesson.id === activeLessonId }
          ]"
          :aria-current="lesson.id === activeLessonId ? 'page' : undefined"
          :aria-label="`${lesson.title}，${lessonTypeLabel(lesson.kind)}`"
          @click="$emit('select-lesson', lesson.id)"
        >
          <span class="curriculum-nav__lesson-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="curriculum-nav__lesson-title">{{ lesson.title }}</span>
          <em class="curriculum-nav__lesson-type">{{ lessonTypeShortLabel(lesson.kind) }}</em>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  volumes: { type: Array, default: () => [] },
  activeVolume: { type: Object, default: null },
  activeChapter: { type: Object, default: null },
  activeVolumeId: { type: String, default: '' },
  activeChapterId: { type: String, default: '' },
  activeLessonId: { type: String, default: '' }
})

defineEmits(['select-volume', 'select-chapter', 'select-lesson'])

function lessonTypeShortLabel(kind) {
  return {
    reaction: '3D',
    experiment: '实验',
    calculation: '计算',
    concept: '知识'
  }[kind] || '知识'
}

function lessonTypeLabel(kind) {
  return {
    reaction: '3D 互动模型',
    experiment: '实验流程',
    calculation: '计算推导',
    concept: '知识图'
  }[kind] || '知识图'
}
</script>
