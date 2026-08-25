<template>
  <article v-if="lesson" class="textbook-lesson">
    <header class="textbook-lesson__hero">
      <div class="textbook-lesson__position">
        <span>{{ stageLabel }}</span>
        <span>{{ volumeTitle }}</span>
        <span
          class="textbook-lesson__type"
          :class="`textbook-lesson__type--${lesson.kind || 'concept'}`"
        >{{ lessonType.label }}</span>
      </div>
      <div class="textbook-lesson__heading">
        <div>
          <p class="eyebrow">{{ lesson.textbookPosition }}</p>
          <h1>{{ lesson.title }}</h1>
          <p>{{ lesson.summary }}</p>
        </div>
        <div class="textbook-lesson__count">
          <strong>{{ lesson.objectives.length }}</strong>
          <span>个学习目标</span>
        </div>
      </div>
      <div class="textbook-lesson__objectives" aria-label="学习目标">
        <span v-for="(objective, index) in lesson.objectives" :key="objective">
          <b>{{ index + 1 }}</b>{{ objective }}
        </span>
      </div>
    </header>

    <div class="textbook-lesson__path" aria-label="本课学习路径">
      <span class="textbook-lesson__path-label">本课学习路径</span>
      <span class="textbook-lesson__path-step textbook-lesson__path-step--active"><b>01</b>观察事实</span>
      <i>→</i>
      <span class="textbook-lesson__path-step"><b>02</b>建立规律</span>
      <i>→</i>
      <span class="textbook-lesson__path-step"><b>03</b>微观解释</span>
      <i>→</i>
      <span class="textbook-lesson__path-step"><b>04</b>随堂自测</span>
    </div>

    <ChemicalReactionLesson v-if="reactionSpec" :spec="reactionSpec" />
    <KnowledgeLesson v-else :lesson="lesson" />

    <section class="lesson-explanation" aria-label="课本讲解">
      <article class="lesson-explanation__card lesson-explanation__card--phenomenon">
        <div class="lesson-explanation__icon">看</div>
        <div>
          <p class="eyebrow">{{ lessonCopy.observationLabel }}</p>
          <h2>{{ lessonCopy.observationTitle }}</h2>
          <p>{{ lesson.phenomenon }}</p>
        </div>
      </article>
      <article class="lesson-explanation__card lesson-explanation__card--macro">
        <div class="lesson-explanation__icon">宏</div>
        <div>
          <p class="eyebrow">{{ lessonCopy.macroLabel }}</p>
          <h2>{{ lessonCopy.macroTitle }}</h2>
          <p>{{ lesson.macroExplanation }}</p>
        </div>
      </article>
      <article class="lesson-explanation__card lesson-explanation__card--micro">
        <div class="lesson-explanation__icon">微</div>
        <div>
          <p class="eyebrow">{{ lessonCopy.microLabel }}</p>
          <h2>{{ lessonCopy.microTitle }}</h2>
          <p>{{ lesson.microExplanation }}</p>
        </div>
      </article>
    </section>

    <section class="knowledge-review" aria-label="知识点回顾">
      <div class="knowledge-review__header">
        <div>
          <p class="eyebrow">课本回忆卡</p>
          <h2>把这节课的知识串起来</h2>
          <p>先回忆事实，再连接规律、条件和微观原因。</p>
        </div>
        <span>{{ knowledgeReview.length }} 个知识点</span>
      </div>
      <div class="knowledge-review__grid">
        <article v-for="(item, index) in knowledgeReview" :key="`${item.label}-${index}`" class="knowledge-review__card">
          <div class="knowledge-review__index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div>
            <p>{{ item.label }}</p>
            <h3>{{ item.title }}</h3>
            <span>{{ item.detail }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="lesson-notes">
      <article class="lesson-note-card lesson-note-card--conditions">
        <p class="eyebrow">条件与规范</p>
        <h2>写方程式时别漏掉</h2>
        <p>{{ lesson.conditions }}</p>
        <div class="lesson-note-card__list">
          <span v-for="point in lesson.keyPoints" :key="point">✓ {{ point }}</span>
        </div>
      </article>
      <article class="lesson-note-card lesson-note-card--mistakes">
        <p class="eyebrow">易错点</p>
        <h2>这里最容易失分</h2>
        <div class="lesson-note-card__list">
          <span v-for="mistake in lesson.commonMistakes" :key="mistake">× {{ mistake }}</span>
        </div>
      </article>
      <article class="lesson-quiz">
        <div class="lesson-quiz__header">
          <div>
            <p class="eyebrow">随堂自测</p>
            <h2>{{ lesson.checkQuestion.prompt }}</h2>
          </div>
          <button v-if="selectedAnswer !== null" type="button" @click="selectedAnswer = null">重做</button>
        </div>
        <div class="lesson-quiz__options">
          <button
            v-for="(option, index) in lesson.checkQuestion.options"
            :key="option"
            type="button"
            :disabled="selectedAnswer !== null"
            :class="answerClass(index)"
            @click="selectedAnswer = index"
          ><span>{{ String.fromCharCode(65 + index) }}</span>{{ option }}</button>
        </div>
        <p v-if="selectedAnswer !== null" class="lesson-quiz__feedback" :class="{ 'lesson-quiz__feedback--correct': isCorrect }">
          <strong>{{ isCorrect ? '回答正确' : '再想一步' }}</strong>
          {{ lesson.checkQuestion.explanation }}
        </p>
      </article>
    </section>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ChemicalReactionLesson from './ChemicalReactionLesson.vue'
import KnowledgeLesson from './KnowledgeLesson.vue'

const props = defineProps({
  lesson: { type: Object, default: null },
  reactionSpec: { type: Object, default: null },
  stageLabel: { type: String, default: '' },
  volumeTitle: { type: String, default: '' }
})

const selectedAnswer = ref(null)
const isCorrect = computed(() => selectedAnswer.value === props.lesson?.checkQuestion.answer)
const lessonType = computed(() => ({
  reaction: { label: '3D 互动模型' },
  experiment: { label: '实验流程' },
  calculation: { label: '计算推导' },
  concept: { label: '知识图' }
}[props.lesson?.kind] || { label: '知识图' }))
const knowledgeReview = computed(() => {
  const lesson = props.lesson
  if (!lesson) return []

  const visualItems = lesson.visual?.items || []
  if (visualItems.length) {
    return [
      ...visualItems.map((item) => ({ label: '知识关系', title: item.label, detail: item.detail })),
      ...(lesson.keyPoints || []).map((point) => ({ label: '必记结论', title: '考点提醒', detail: point }))
    ].slice(0, 6)
  }

  return [
    { label: '实验事实', title: '先记现象', detail: lesson.phenomenon },
    { label: '宏观规律', title: '再写结论', detail: lesson.macroExplanation },
    { label: '微观本质', title: '最后看微粒', detail: lesson.microExplanation },
    { label: '条件边界', title: '反应不能漏什么', detail: lesson.conditions },
    ...(lesson.keyPoints || []).map((point) => ({ label: '必记结论', title: '考点提醒', detail: point }))
  ].slice(0, 6)
})
const lessonCopy = computed(() => ({
  reaction: {
    observationLabel: '实验现象', observationTitle: '先说看到什么',
    macroLabel: '宏观结论', macroTitle: '物质发生了什么',
    microLabel: '微观解释', microTitle: '粒子怎样变化'
  },
  experiment: {
    observationLabel: '操作与现象', observationTitle: '先看怎么做',
    macroLabel: '实验结论', macroTitle: '证据支持什么',
    microLabel: '原理解释', microTitle: '为什么这样操作'
  },
  calculation: {
    observationLabel: '题意识别', observationTitle: '先找已知与未知',
    macroLabel: '数量关系', macroTitle: '列出计算桥梁',
    microLabel: '单位与模型', microTitle: '检查结果是否合理'
  },
  concept: {
    observationLabel: '事实与例子', observationTitle: '先抓住典型事实',
    macroLabel: '核心规律', macroTitle: '建立知识关系',
    microLabel: '模型解释', microTitle: '从结构理解规律'
  }
}[props.lesson?.kind] || {
  observationLabel: '知识观察', observationTitle: '先抓住关键事实',
  macroLabel: '核心结论', macroTitle: '建立知识关系',
  microLabel: '原理解释', microTitle: '理解背后的原因'
}))

function answerClass(index) {
  if (selectedAnswer.value === null) return ''
  return {
    'lesson-quiz__option--correct': index === props.lesson.checkQuestion.answer,
    'lesson-quiz__option--wrong': index === selectedAnswer.value && !isCorrect.value
  }
}

watch(() => props.lesson?.id, () => {
  selectedAnswer.value = null
})
</script>
