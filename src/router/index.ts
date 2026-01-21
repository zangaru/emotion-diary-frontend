import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/diaries',
      name: 'diaries',
      component: () => import('@/views/diary/DiaryListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/diaries/new',
      name: 'diary-create',
      component: () => import('@/views/diary/DiaryCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/diaries/:id',
      name: 'diary-detail',
      component: () => import('@/views/diary/DiaryDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/diaries/:id/edit',
      name: 'diary-edit',
      component: () => import('@/views/diary/DiaryEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.token) {
    return '/login';
  }
});

export default router;
