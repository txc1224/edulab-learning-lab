<template>
  <section class="reaction-card reaction-equation" :class="{ 'reaction-equation--single': normalizedEquations.length === 1 }">
    <div class="reaction-card__header">
      <div>
        <p class="eyebrow">反应方程</p>
        <h2>{{ title }}</h2>
      </div>
      <span class="reaction-equation__tag">{{ conditionText }}</span>
    </div>

    <div
      v-for="(equation, index) in normalizedEquations"
      :key="`${equation.label}-${index}`"
      class="equation-row"
      :class="{ 'equation-row--ionic': index > 0 }"
    >
      <span class="equation-label">{{ equation.label }}</span>
      <div class="equation" :class="{ 'equation--ionic': index > 0 }" v-html="equation.html"></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  title: { type: String, default: '化学反应' },
  equations: { type: Array, default: () => [] },
  molecularEquation: { type: String, default: '' },
  netIonicEquation: { type: String, default: '' },
  conditionText: { type: String, default: '反应条件' }
})

function render(value) {
  if (!value) return '<span class="equation-empty">未提供方程</span>'
  return katex.renderToString(value, { throwOnError: false, displayMode: true })
}

const normalizedEquations = computed(() => {
  const equations = props.equations.length
    ? props.equations
    : [
        { label: '分子方程', latex: props.molecularEquation },
        { label: '净离子方程', latex: props.netIonicEquation }
      ].filter((item) => item.latex)
  return equations.map((equation) => ({ ...equation, html: render(equation.latex) }))
})
</script>
