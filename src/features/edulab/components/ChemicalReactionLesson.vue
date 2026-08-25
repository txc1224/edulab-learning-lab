<template>
  <div class="reaction-lesson">
    <ErrorState
      v-if="reactionStore.hasError"
      title="反应数据无法展示"
      :message="reactionStore.validationErrors.join('；')"
    />

    <template v-else-if="reactionStore.reactionData">
      <div class="reaction-lesson__stage">
        <ReactionScene
          :reaction-data="reactionStore.reactionData"
          :progress="reactionStore.progress"
          :show-labels="reactionStore.showLabels"
        />
        <div class="reaction-lesson__toolbar">
          <span class="reaction-lesson__toolbar-label">反应进度</span>
          <input
            :value="reactionStore.progress"
            type="range"
            min="0"
            max="1"
            step="0.001"
            aria-label="反应进度"
            @input="reactionStore.setProgress(Number($event.target.value))"
          >
          <strong>{{ Math.round(reactionStore.progress * 100) }}%</strong>
        </div>
        <div class="reaction-lesson__actions">
          <button type="button" class="button button--primary" @click="togglePlay">
            {{ reactionStore.isPlaying ? '暂停演示' : '自动演示' }}
          </button>
          <button type="button" class="button button--ghost" @click="reactionStore.reset">复位</button>
          <button type="button" class="button button--ghost" @click="reactionStore.showLabels = !reactionStore.showLabels">
            {{ reactionStore.showLabels ? '隐藏标签' : '显示标签' }}
          </button>
        </div>
      </div>

      <div class="reaction-lesson__content">
        <ReactionEquation
          :title="reactionStore.reactionData.meta.title"
          :equations="reactionStore.reactionData.meta.equations"
          :molecular-equation="reactionStore.reactionData.meta.molecularEquation"
          :net-ionic-equation="reactionStore.reactionData.meta.netIonicEquation"
          :condition-text="reactionStore.reactionData.conditions.text"
        />
        <ReactionSteps
          :steps="reactionStore.steps"
          :current-step="reactionStore.currentStep"
          @select="reactionStore.goToStep"
        />
        <ConservationPanel
          :element-counts="reactionStore.reactionData.elementCounts"
          :charge-totals="reactionStore.reactionData.chargeTotals"
        />
      </div>
    </template>

    <LoadingState v-else text="正在准备反应模型..." />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useReactionStore } from '../../../stores/reaction.store.js'
import ErrorState from '../../../shared/components/ErrorState.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ConservationPanel from './ConservationPanel.vue'
import ReactionEquation from './ReactionEquation.vue'
import ReactionScene from './ReactionScene.vue'
import ReactionSteps from './ReactionSteps.vue'

const props = defineProps({
  spec: { type: Object, required: true }
})

const reactionStore = useReactionStore()

watch(() => props.spec, (spec) => reactionStore.loadReaction(spec), { immediate: true })

function togglePlay() {
  if (reactionStore.isPlaying) reactionStore.pause()
  else reactionStore.play()
}

onBeforeUnmount(() => reactionStore.pause())
</script>
