<template>
  <section class="knowledge-lesson" :class="`knowledge-lesson--${lesson.kind || 'concept'}`">
    <div class="knowledge-lesson__header">
      <div>
        <p class="eyebrow">{{ typeMeta.eyebrow }}</p>
        <h2>{{ lesson.visual?.title || lesson.title }}</h2>
        <p>{{ lesson.visual?.description || lesson.summary }}</p>
      </div>
      <span>{{ typeMeta.label }}</span>
    </div>

    <div class="knowledge-flow" :class="{ 'knowledge-flow--dense': lesson.visual?.items?.length > 3 }">
      <template v-for="(item, index) in lesson.visual?.items || []" :key="item.label">
        <article class="knowledge-flow__item">
          <div class="knowledge-flow__number">{{ String(index + 1).padStart(2, '0') }}</div>
          <strong>{{ item.label }}</strong>
          <p>{{ item.detail }}</p>
          <small v-if="item.example">{{ item.example }}</small>
        </article>
        <span v-if="index < lesson.visual.items.length - 1" class="knowledge-flow__arrow" aria-hidden="true">→</span>
      </template>
    </div>

    <div class="knowledge-lesson__takeaway">
      <span>本课抓手</span>
      <strong>{{ lesson.visual?.takeaway || lesson.keyPoints?.[0] }}</strong>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lesson: { type: Object, required: true }
})

const typeMeta = computed(() => ({
  concept: { eyebrow: '概念可视化', label: '关系图' },
  experiment: { eyebrow: '实验流程', label: '操作图' },
  calculation: { eyebrow: '计算推导', label: '解题链' }
}[props.lesson.kind] || { eyebrow: '知识讲解', label: '学习图' }))
</script>
