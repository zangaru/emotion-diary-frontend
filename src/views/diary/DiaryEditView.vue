<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { EMOTIONS } from '@/constants/emotions';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { diaryApi, type Diary } from '@/api/diary';
import { WEATHER_OPTIONS } from '@/constants/weather';

const router = useRouter();
const route = useRoute();

const title = ref('');
const content = ref('');
const emotion = ref('');
const weather = ref('');
const diaryDate = ref('');
const error = ref('');
const isLoading = ref(false);
const isFetching = ref(true);

const fetchDiary = async () => {
  try {
    const id = Number(route.params.id);
    const { data } = await diaryApi.getOne(id);

    title.value = data.title;
    content.value = data.content;
    emotion.value = data.emotion;
    weather.value = data.weather;
    diaryDate.value = data.diaryDate.split('T')[0]; // YYYY-MM-DD 형식으로
  } catch (err: any) {
    console.error('일기 조회 실패:', err);
    error.value = '일기를 불러오는데 실패했습니다.';
  } finally {
    isFetching.value = false;
  }
};

const handleSubmit = async () => {
  error.value = '';

  // 유효성 검사
  if (!title.value.trim()) {
    error.value = '제목을 입력해주세요.';
    return;
  }

  if (title.value.length > 100) {
    error.value = '제목은 100자 이하로 입력해주세요.';
    return;
  }

  if (!content.value.trim()) {
    error.value = '내용을 입력해주세요.';
    return;
  }

  if (!emotion.value) {
    error.value = '감정을 선택해주세요.';
    return;
  }

  if (!diaryDate.value) {
    error.value = '날짜를 선택해주세요.';
    return;
  }

  isLoading.value = true;

  try {
    const id = Number(route.params.id);
    await diaryApi.update(id, {
      title: title.value,
      content: content.value,
      emotion: emotion.value,
      weather: weather.value,
      diaryDate: diaryDate.value,
    });

    alert('일기가 수정되었습니다!');
    router.push(`/diaries/${id}`);
  } catch (err: any) {
    console.error('일기 수정 실패:', err);
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        error.value = err.response.data.message.join('\n');
      } else {
        error.value = err.response.data.message;
      }
    } else {
      error.value = '일기 수정 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDiary();
});
</script>

<template>
  <DefaultLayout>
    <div class="max-w-3xl mx-auto">
      <!-- 로딩 -->
      <div v-if="isFetching" class="text-center py-12">
        <p class="text-gray-600">일기를 불러오는 중...</p>
      </div>

      <template v-else>
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">일기 수정</h1>
          <p class="text-gray-600 mt-2">일기 내용을 수정하세요</p>
        </div>

        <Card class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- 날짜 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="diaryDate">날짜</Label>
                <Input id="diaryDate" v-model="diaryDate" type="date" :disabled="isLoading" required />
              </div>
              <div>
                <Label for="weather">오늘의 날씨</Label>
                <div class="relative">
                  <select id="weather" v-model="weather"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isLoading">
                    <option v-for="opt in WEATHER_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.emoji }} {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 제목 -->
            <div>
              <Label for="title">제목</Label>
              <Input id="title" v-model="title" type="text" placeholder="일기 제목을 입력하세요" :disabled="isLoading"
                maxlength="100" required />
              <p class="text-xs text-gray-500 mt-1">{{ title.length }}/100자</p>
            </div>

            <!-- 감정 선택 -->
            <div>
              <Label>오늘의 감정</Label>
              <div class="grid grid-cols-4 gap-3 mt-2">
                <button v-for="emotionOption in EMOTIONS" :key="emotionOption.value" type="button"
                  @click="emotion = emotionOption.value" :class="[
                    'p-4 rounded-lg border-2 transition-all text-center hover:scale-105',
                    emotion === emotionOption.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ]" :disabled="isLoading">
                  <div class="text-3xl mb-1">{{ emotionOption.emoji }}</div>
                  <div class="text-sm font-medium text-gray-700">{{ emotionOption.label }}</div>
                </button>
              </div>
              <p v-if="emotion" class="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <span class="text-lg">
                  {{EMOTIONS.find((e) => e.value === emotion)?.emoji}}
                </span>
                선택된 감정: <strong>{{ emotion }}</strong>
              </p>
            </div>

            <!-- 내용 -->
            <div>
              <Label for="content">내용</Label>
              <Textarea id="content" v-model="content" placeholder="일기 내용을 작성해주세요..." rows="12" :disabled="isLoading"
                required />
            </div>

            <!-- 에러 메시지 -->
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600 whitespace-pre-line">{{ error }}</p>
            </div>

            <!-- 버튼 -->
            <div class="flex gap-3">
              <Button type="submit" class="flex-1" :disabled="isLoading">
                {{ isLoading ? '수정 중...' : '수정하기' }}
              </Button>
              <Button type="button" variant="outline" @click="router.back()" :disabled="isLoading">
                취소
              </Button>
            </div>
          </form>
        </Card>
      </template>
    </div>
  </DefaultLayout>
</template>
