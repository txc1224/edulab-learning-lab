<template>
  <div class="state-card state-card--loading" role="status">
    <span class="state-card__spinner"></span>
    <span>{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '加载中...' }
})
</script>
