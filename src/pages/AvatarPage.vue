<template>
  <section class="page page--avatar">
    <div class="page-heading">
      <div>
        <p class="eyebrow">TalkingHead 开源 Web 数字人</p>
        <h1>和小星聊天</h1>
        <p>让数字人用自然语音陪你探索问题、练习表达。</p>
      </div>
    </div>
    <AvatarPanel />
  </section>
</template>

<script setup>
import AvatarPanel from '../features/avatar/components/AvatarPanel.vue'
</script>
