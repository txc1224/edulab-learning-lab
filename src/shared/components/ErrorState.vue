<template>
  <div class="state-card state-card--error" role="alert">
    <strong>{{ title }}</strong>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂时无法显示' },
  message: { type: String, default: '请检查输入后重试。' }
})
</script>
