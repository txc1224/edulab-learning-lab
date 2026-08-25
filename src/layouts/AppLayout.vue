<template>
  <div class="app-shell">
    <AppNavigation />
    <main class="app-shell__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNavigation from '../shared/components/AppNavigation.vue'
</script>
