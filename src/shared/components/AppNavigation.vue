<template>
  <header class="app-navigation">
    <div class="app-navigation__brand">
      <span class="app-navigation__mark">E</span>
      <div>
        <strong>EduLab</strong>
        <span>AI 数字人 · 化学实验室</span>
      </div>
    </div>

    <nav class="app-navigation__links" aria-label="主导航">
      <RouterLink to="/avatar" class="app-navigation__link">数字人聊天</RouterLink>
      <RouterLink to="/edulab" class="app-navigation__link">化学反应实验室</RouterLink>
    </nav>
  </header>
</template>
