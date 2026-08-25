<template>
  <section class="reaction-card reaction-steps">
    <div class="reaction-card__header">
      <div>
        <p class="eyebrow">分步讲解</p>
        <h2>{{ activeStep?.title || '准备开始' }}</h2>
      </div>
      <span class="step-count">{{ currentStep }} / {{ steps.length }}</span>
    </div>

    <div class="stepper" role="tablist" aria-label="反应步骤">
      <button
        v-for="(step, index) in steps"
        :key="step.title"
        class="stepper__item"
        :class="{ 'stepper__item--active': index + 1 === currentStep, 'stepper__item--done': index + 1 < currentStep }"
        type="button"
        role="tab"
        :aria-selected="index + 1 === currentStep"
        @click="$emit('select', index + 1)"
      >
        <span class="stepper__number">{{ index + 1 }}</span>
        <span>{{ step.title }}</span>
      </button>
    </div>

    <p class="reaction-steps__text">{{ activeStep?.text || '拖动进度开始观察反应。' }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: { type: Array, default: () => [] },
  currentStep: { type: Number, default: 1 }
})

defineEmits(['select'])

const activeStep = computed(() => props.steps[props.currentStep - 1])
</script>
