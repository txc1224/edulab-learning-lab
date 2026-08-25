import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/avatar' },
    {
      path: '/avatar',
      name: 'avatar',
      component: () => import('../pages/AvatarPage.vue'),
      meta: { title: '数字人聊天' }
    },
    {
      path: '/edulab/:lessonId?',
      name: 'edulab',
      component: () => import('../pages/EdulabPage.vue'),
      meta: { title: '化学反应实验室' }
    }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '学习实验室'} · EduLab`
})

export default router
