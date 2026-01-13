<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { EMOTIONS, getEmotionOption } from '@/constants/emotions';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';
import { diaryApi, type Diary } from '@/api/diary';

const router = useRouter();
const diaries = ref<Diary[]>([]);
const isLoading = ref(false);
const error = ref('');

// 검색 관련
const searchKeyword = ref('');
const selectedEmotion = ref<string>('all');

// 필터용 감정 옵션 (전체 추가)
const emotionFilters = computed(() => [
  { value: 'all', label: '전체', emoji: '🌈', color: '' },
  ...EMOTIONS,
]);

const fetchDiaries = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const { data } = await diaryApi.getAll();
    diaries.value = data;
  } catch (err: any) {
    console.error('일기 목록 조회 실패:', err);
    error.value = '일기 목록을 불러오는데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 필터링된 일기 목록
const filteredDiaries = computed(() => {
  let result = diaries.value;

  // 감정 필터
  if (selectedEmotion.value !== 'all') {
    result = result.filter(diary => diary.emotion === selectedEmotion.value);
  }

  // 검색어 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      diary =>
        diary.title.toLowerCase().includes(keyword) ||
        diary.content.toLowerCase().includes(keyword),
    );
  }

  return result;
});

const clearSearch = () => {
  searchKeyword.value = '';
  selectedEmotion.value = 'all';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goToDetail = (id: number) => {
  router.push(`/diaries/${id}`);
};

onMounted(() => {
  fetchDiaries();
});
</script>

<template>
  <DefaultLayout>
    <div class="max-w-4xl mx-auto">
      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">내 일기</h1>
          <p class="text-gray-600 mt-2">
            총 {{ diaries.length }}개의 일기
            <span v-if="searchKeyword || selectedEmotion !== 'all'" class="text-blue-600">
              ({{ filteredDiaries.length }}개 표시)
            </span>
          </p>
        </div>
        <Button @click="router.push('/diaries/new')">새 일기 쓰기</Button>
      </div>

      <!-- 검색 & 필터 -->
      <div class="mb-6 space-y-4">
        <!-- 검색창 -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input v-model="searchKeyword" placeholder="제목이나 내용으로 검색..." class="pl-10 pr-10" />
          <button v-if="searchKeyword" @click="searchKeyword = ''"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 감정 필터 -->
        <div class="flex gap-2 flex-wrap items-center">
          <span class="text-sm text-gray-600 font-medium">감정:</span>
          <button v-for="emotion in emotionFilters" :key="emotion.value" @click="selectedEmotion = emotion.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedEmotion === emotion.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]">
            {{ emotion.emoji }} {{ emotion.label }}
          </button>

          <button v-if="searchKeyword || selectedEmotion !== 'all'" @click="clearSearch"
            class="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium">
            초기화
          </button>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">일기를 불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-else-if="filteredDiaries.length === 0 && diaries.length > 0" class="text-center py-12">
        <p class="text-gray-600 mb-2">검색 결과가 없습니다.</p>
        <Button variant="outline" @click="clearSearch">필터 초기화</Button>
      </div>

      <!-- 일기 없음 -->
      <div v-else-if="diaries.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">아직 작성한 일기가 없습니다.</p>
        <Button @click="router.push('/diaries/new')">첫 일기 쓰기</Button>
      </div>

      <!-- 일기 목록 -->
      <div v-else class="space-y-4">
        <Card v-for="diary in filteredDiaries" :key="diary.id"
          class="p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="goToDetail(diary.id)">
          <div class="flex justify-between items-start mb-3">
            <h2 class="text-xl font-bold text-gray-900">{{ diary.title }}</h2>
            <span :class="[
              'px-3 py-1 text-sm rounded-full font-medium whitespace-nowrap',
              getEmotionOption(diary.emotion)?.color || 'bg-gray-100 text-gray-800',
            ]">
              {{ getEmotionOption(diary.emotion)?.emoji }} {{ diary.emotion }}
            </span>
          </div>
          <p class="text-gray-700 mb-3 line-clamp-2">{{ diary.content }}</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>{{ formatDate(diary.diaryDate) }}</span>
            <span>{{ new Date(diary.createdAt).toLocaleDateString('ko-KR') }} 작성</span>
          </div>
        </Card>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
