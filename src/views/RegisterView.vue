<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth';

const router = useRouter();

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const error = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  error.value = '';

  if (!email.value || !password.value || !passwordConfirm.value) {
    error.value = '모든 필드를 입력해주세요.';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    error.value = '비밀번호가 일치하지 않습니다.';
    return;
  }

  if (password.value.length < 6) {
    error.value = '비밀번호는 최소 6자 이상이어야 합니다.';
    return;
  }

  isLoading.value = true;

  try {
    await authApi.register(email.value, password.value);
    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
    router.push('/login');
  } catch (err: any) {
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        error.value = err.response.data.message.join('\n');
      } else {
        error.value = err.response.data.message;
      }
    } else if (err.response?.status === 409) {
      error.value = '이미 사용 중인 이메일입니다.';
    } else {
      error.value = '회원가입 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <Card class="w-full max-w-md p-6">
      <h1 class="text-2xl font-bold mb-2 text-center">감정 일기</h1>
      <p class="text-sm text-gray-600 mb-6 text-center">새 계정을 만들어주세요</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <Label for="email">이메일</Label>
          <Input id="email" v-model="email" type="email" placeholder="email@example.com" :disabled="isLoading"
            required />
        </div>

        <div>
          <Label for="password">비밀번호</Label>
          <Input id="password" v-model="password" type="password" placeholder="최소 6자 이상" :disabled="isLoading"
            required />
          <p class="text-xs text-gray-500 mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>
        </div>

        <div>
          <Label for="passwordConfirm">비밀번호 확인</Label>
          <Input id="passwordConfirm" v-model="passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요"
            :disabled="isLoading" required />
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600 whitespace-pre-line">{{ error }}</p>
        </div>

        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? '처리 중...' : '회원가입' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?
        <RouterLink to="/login" class="text-blue-600 hover:underline font-medium">
          로그인
        </RouterLink>
      </p>
    </Card>
  </div>
</template>
