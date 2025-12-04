<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
</script>

<template>
  <DefaultLayout>
    <Card class="p-8 text-center">
      <h2 class="text-3xl font-bold mb-4">환영합니다! 🎉</h2>
      <p class="text-gray-600 mb-6">오늘의 감정을 기록해보세요.</p>
      <div class="flex gap-4 justify-center">
        <Button>일기 쓰기</Button>
        <Button variant="outline">내 일기 보기</Button>
      </div>
    </Card>
  </DefaultLayout>
</template>
