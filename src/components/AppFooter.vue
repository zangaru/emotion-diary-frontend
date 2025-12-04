<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white border-t mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- 로고 & 설명 -->
        <div class="text-center md:text-left">
          <h3 class="text-lg font-bold text-gray-900 mb-1">감정 일기</h3>
          <p class="text-sm text-gray-600">당신의 감정을 기록하고 돌아보세요</p>
        </div>

        <!-- 링크 -->
        <nav class="flex gap-6">
          <RouterLink to="/" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            홈
          </RouterLink>
          <RouterLink to="/diaries" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            내 일기
          </RouterLink>
        </nav>

        <!-- 저작권 -->
        <div class="text-sm text-gray-500 text-center md:text-right">
          © {{ currentYear }} 감정 일기. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>
