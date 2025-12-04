<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = '';

  if (!email.value || !password.value) {
    error.value = '이메일과 비밀번호를 입력해주세요.';
    return;
  }

  isLoading.value = true;

  try {
    const success = await authStore.login(email.value, password.value);

    if (success) {
      router.push('/');
    } else {
      error.value = '로그인 실패. 이메일과 비밀번호를 확인해주세요.';
    }
  } catch (err: any) {
    error.value = '로그인 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <Card class="w-full max-w-md p-6">
      <h1 class="text-2xl font-bold mb-2 text-center">감정 일기</h1>
      <p class="text-sm text-gray-600 mb-6 text-center">로그인하여 일기를 작성하세요</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <Label for="email">이메일</Label>
          <Input id="email" v-model="email" type="email" placeholder="email@example.com" :disabled="isLoading"
            required />
        </div>

        <div>
          <Label for="password">비밀번호</Label>
          <Input id="password" v-model="password" type="password" placeholder="••••••••" :disabled="isLoading"
            required />
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?
        <RouterLink to="/register" class="text-blue-600 hover:underline font-medium">
          회원가입
        </RouterLink>
      </p>
    </Card>
  </div>
</template>
