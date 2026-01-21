<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EMOTIONS } from '@/constants/emotions';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { diaryApi } from '@/api/diary';
import { weatherApi } from '@/api/weather';
import { WEATHER_OPTIONS } from '@/constants/weather';

const router = useRouter();

const title = ref('');
const content = ref('');
const emotion = ref('');
const weather = ref('');
const diaryDate = ref(new Date().toISOString().split('T')[0]); // 오늘 날짜
const error = ref('');
const isLoading = ref(false);
const isWeatherLoading = ref(false);
const isCheckingExistingDiary = ref(false);

// 오늘의 날짜 포맷팅 (고정)
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

// 위치 정보를 담을 변수
const location = ref<{ lat: number; lon: number } | null>(null);

// 페이지 로드 시 날씨 정보 자동 조회
onMounted(async () => {
  // 오늘 날짜의 일기가 이미 존재하는지 확인
  isCheckingExistingDiary.value = true;
  try {
    const response = await diaryApi.findByDate(diaryDate.value);
    if (response.data.length > 0) {
      alert('이미 오늘의 일기가 작성되어 있습니다. 일기 목록으로 이동합니다.');
      router.push('/diaries');
      return;
    }
  } catch (err) {
    console.error('기존 일기 확인 실패:', err);
  } finally {
    isCheckingExistingDiary.value = false;
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        location.value = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        try {
          const response = await weatherApi.getCurrent(location.value.lat, location.value.lon);
          if (response.condition) {
            const exists = WEATHER_OPTIONS.some((opt) => opt.value === response.condition);
            weather.value = exists ? response.condition : 'Unknown';
          }
        } catch (err) {
          console.error('추천 날씨 조회 실패:', err);
        }
      },
      (err) => {
        console.warn('위치 정보를 가져올 수 없습니다.', err);
      },
    );
  }
});

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
    await diaryApi.create({
      title: title.value,
      content: content.value,
      emotion: emotion.value,
      diaryDate: diaryDate.value,
      weather: weather.value,
      lat: location.value?.lat,
      lon: location.value?.lon,
    });

    alert('일기가 저장되었습니다!');
    router.push('/diaries');
  } catch (err: any) {
    console.error('일기 저장 실패:', err);
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        error.value = err.response.data.message.join('\n');
      } else {
        error.value = err.response.data.message;
      }
    } else {
      error.value = '일기 저장 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <DefaultLayout>
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">일기 쓰기</h1>
        <p class="text-gray-600 mt-2">오늘의 감정을 기록해보세요</p>
      </div>

      <Card class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 날짜 및 날씨 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-gray-500">작성 날짜</Label>
              <div
                class="h-10 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700">
                📅 {{ today }}
              </div>
            </div>
            <div>
              <Label for="weather">오늘의 날씨</Label>
              <div class="relative">
                <select id="weather" v-model="weather"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="isLoading || isWeatherLoading">
                  <option v-for="opt in WEATHER_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.emoji }} {{ opt.label }}
                  </option>
                </select>
                <!-- 로딩 표시 -->
                <div v-if="isWeatherLoading" class="absolute right-8 top-2.5">
                  <span
                    class="flex h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
                </div>
              </div>
              <p class="text-[11px] text-blue-600 mt-1" v-if="!isWeatherLoading && location">
                ✨ 현재 위치를 기반으로 날씨가 추천되었습니다.
              </p>
            </div>
          </div>

          <!-- 제목 -->
          <div>
            <Label for="title">제목</Label>
            <Input id="title" v-model="title" type="text" placeholder="오늘의 일기 제목을 입력하세요"
              :disabled="isLoading || isCheckingExistingDiary" maxlength="100" required />
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
                ]" :disabled="isLoading || isCheckingExistingDiary">
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
            <Textarea id="content" v-model="content" placeholder="오늘 있었던 일이나 감정을 자유롭게 작성해주세요." rows="12"
              :disabled="isLoading || isCheckingExistingDiary" required />
          </div>

          <!-- 에러 메시지 -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600 whitespace-pre-line">{{ error }}</p>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3">
            <Button type="submit" class="flex-1" :disabled="isLoading || isCheckingExistingDiary">
              {{
                isLoading || isCheckingExistingDiary
                  ? isCheckingExistingDiary
                    ? '확인 중...'
                    : '저장 중...'
                  : '저장하기'
              }}
            </Button>
            <Button type="button" variant="outline" @click="router.push('/diaries')"
              :disabled="isLoading || isCheckingExistingDiary">
              취소
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </DefaultLayout>
</template>
