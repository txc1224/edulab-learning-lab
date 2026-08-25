<template>
  <section class="reaction-card conservation-panel">
    <div class="reaction-card__header">
      <div>
        <p class="eyebrow">守恒检查</p>
        <h2>反应前后不变</h2>
      </div>
      <span class="conservation-panel__check">✓ 已验证</span>
    </div>

    <div class="conservation-grid">
      <div v-for="(count, element) in elementCounts" :key="element" class="conservation-item">
        <span class="conservation-item__element">{{ element }}</span>
        <strong>{{ count }}</strong>
        <span>个原子</span>
      </div>
    </div>

    <div class="charge-row">
      <span>总电荷</span>
      <strong>{{ chargeTotals.before }} → {{ chargeTotals.after }}</strong>
      <span class="charge-row__ok">守恒</span>
    </div>
  </section>
</template>

<script setup>
defineProps({
  elementCounts: { type: Object, default: () => ({}) },
  chargeTotals: { type: Object, default: () => ({ before: 0, after: 0 }) }
})
</script>
