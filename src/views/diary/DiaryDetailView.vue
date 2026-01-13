<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { EMOTIONS, getEmotionOption } from '@/constants/emotions';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { diaryApi, type Diary } from '@/api/diary';

const router = useRouter();
const route = useRoute();

const diary = ref<Diary | null>(null);
const isLoading = ref(false);
const error = ref('');

const fetchDiary = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const id = Number(route.params.id);
    const { data } = await diaryApi.getOne(id);
    diary.value = data;
  } catch (err: any) {
    console.error('일기 조회 실패:', err);
    error.value = '일기를 불러오는데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/diaries/${route.params.id}/edit`);
};

const handleDelete = async () => {
  if (!confirm('정말 이 일기를 삭제하시겠습니까?')) {
    return;
  }

  try {
    const id = Number(route.params.id);
    await diaryApi.delete(id);
    alert('일기가 삭제되었습니다.');
    router.push('/diaries');
  } catch (err: any) {
    console.error('일기 삭제 실패:', err);
    alert('일기 삭제에 실패했습니다.');
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
};

onMounted(() => {
  fetchDiary();
});
</script>z

<template>
  <DefaultLayout>
    <div class="max-w-4xl mx-auto">
      <!-- 뒤로가기 버튼 -->
      <Button variant="ghost" @click="router.push('/diaries')" class="mb-4">
        ← 목록으로
      </Button>

      <!-- 로딩 -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">일기를 불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- 일기 상세 -->
      <Card v-else-if="diary" class="p-8">
        <!-- 헤더 -->
        <div class="mb-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <span :class="[
                'inline-block px-3 py-1 text-sm rounded-full font-medium mb-3',
                getEmotionOption(diary.emotion)?.color || 'bg-gray-100 text-gray-800',
              ]">
                {{ getEmotionOption(diary.emotion)?.emoji }} {{ diary.emotion }}
              </span>
              <h1 class="text-3xl font-bold text-gray-900">{{ diary.title }}</h1>
            </div>

            <!-- 액션 버튼 -->
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="handleEdit">수정</Button>
              <Button variant="destructive" size="sm" @click="handleDelete">삭제</Button>
            </div>
          </div>

          <!-- 날짜 정보 -->
          <div class="flex gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span class="font-medium">일기 날짜:</span>
              <span>{{ formatDate(diary.diaryDate) }}</span>
            </div>
          </div>
        </div>

        <!-- 구분선 -->
        <div class="border-t my-6"></div>

        <!-- 내용 -->
        <div class="prose max-w-none">
          <div class="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {{ diary.content }}
          </div>
        </div>

        <!-- 구분선 -->
        <div class="border-t my-6"></div>

        <!-- 메타 정보 -->
        <div class="text-sm text-gray-500 space-y-1">
          <p>작성일: {{ formatDateTime(diary.createdAt) }}</p>
          <p v-if="diary.updatedAt !== diary.createdAt">
            수정일: {{ formatDateTime(diary.updatedAt) }}
          </p>
        </div>
      </Card>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.prose {
  font-size: 1.1rem;
  line-height: 1.8;
}
</style>
