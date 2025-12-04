<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <header class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- 로고 -->
        <RouterLink to="/" class="text-2xl font-bold text-gray-900 hover:text-gray-700">
          감정 일기
        </RouterLink>

        <!-- 네비게이션 -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink to="/" class="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
            홈
          </RouterLink>
          <RouterLink to="/diaries" class="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
            내 일기
          </RouterLink>
          <RouterLink to="/diaries/new" class="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
            일기 쓰기
          </RouterLink>
        </nav>

        <!-- 사용자 정보 -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 hidden sm:inline">
            {{ authStore.user?.email }}
          </span>
          <Button variant="outline" size="sm" @click="handleLogout">로그아웃</Button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.router-link-active {
  color: #2563eb;
}
</style>
