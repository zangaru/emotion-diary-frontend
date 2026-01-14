<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { getEmotionOption } from '@/constants/emotions';
import type { Diary } from '@/api/diary';

interface Props {
  diaries: Diary[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select-diary', id: number): void;
}>();

const currentDate = ref(new Date());

// 현재 년/월
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

// 월의 첫날과 마지막날
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1);
});

const lastDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0);
});

// 캘린더 시작 요일 (일요일부터 시작)
const startDayOfWeek = computed(() => firstDayOfMonth.value.getDay());

// 해당 월의 일수
const daysInMonth = computed(() => lastDayOfMonth.value.getDate());

// 캘린더 날짜 배열 생성
const calendarDays = computed(() => {
  const days: (number | null)[] = [];

  // 이전 달 빈 칸
  for (let i = 0; i < startDayOfWeek.value; i++) {
    days.push(null);
  }

  // 현재 달 날짜
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i);
  }

  return days;
});

// 특정 날짜의 일기 찾기
const getDiaryForDate = (day: number) => {
  const dateString = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return props.diaries.find(diary => {
    const diaryDate = new Date(diary.diaryDate).toISOString().split('T')[0];
    return diaryDate === dateString;
  });
};

// 월 이동
const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

const goToToday = () => {
  currentDate.value = new Date();
};

// 오늘 날짜인지 확인
const isToday = (day: number) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  );
};

const monthNames = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
</script>

<template>
  <div class="space-y-4">
    <!-- 캘린더 헤더 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ currentYear }}년 {{ monthNames[currentMonth] }}
        </h2>
        <Button variant="outline" size="sm" @click="goToToday">오늘</Button>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="icon" @click="previousMonth">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" @click="nextMonth">
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- 캘린더 -->
    <Card class="p-4">
      <!-- 요일 헤더 -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div v-for="day in dayNames" :key="day" class="text-center font-semibold text-sm text-gray-600 py-2" :class="{
          'text-red-600': day === '일',
          'text-blue-600': day === '토'
        }">
          {{ day }}
        </div>
      </div>

      <!-- 날짜 그리드 -->
      <div class="grid grid-cols-7 gap-2">
        <div v-for="(day, index) in calendarDays" :key="index" class="aspect-square">
          <div v-if="day" :class="[
            'h-full rounded-lg p-2 transition-all cursor-pointer',
            isToday(day)
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50',
            getDiaryForDate(day) ? 'border-2' : 'border border-gray-200'
          ]"
            :style="getDiaryForDate(day) ? { borderColor: getEmotionOption(getDiaryForDate(day)!.emotion)?.color.split(' ')[0].replace('bg-', '') } : {}"
            @click="getDiaryForDate(day) && emit('select-diary', getDiaryForDate(day)!.id)">
            <div class="flex flex-col h-full">
              <!-- 날짜 -->
              <div :class="[
                'text-sm font-medium mb-1',
                index % 7 === 0 ? 'text-red-600' : index % 7 === 6 ? 'text-blue-600' : 'text-gray-900'
              ]">
                {{ day }}
              </div>

              <!-- 일기가 있는 경우 -->
              <div v-if="getDiaryForDate(day)" class="flex-1 flex flex-col justify-center items-center">
                <div class="text-2xl mb-1">
                  {{ getEmotionOption(getDiaryForDate(day)!.emotion)?.emoji }}
                </div>
                <div class="text-xs text-gray-600 text-center truncate w-full px-1">
                  {{ getDiaryForDate(day)!.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 통계 -->
    <div class="grid grid-cols-3 gap-4">
      <Card class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">
          {{diaries.filter(d => {
            const date = new Date(d.diaryDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          }).length}}
        </div>
        <div class="text-sm text-gray-600 mt-1">이번 달 작성</div>
      </Card>
      <Card class="p-4 text-center">
        <div class="text-2xl font-bold text-green-600">
          {{ daysInMonth }}
        </div>
        <div class="text-sm text-gray-600 mt-1">총 일수</div>
      </Card>
      <Card class="p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">
          {{Math.round((diaries.filter(d => {
            const date = new Date(d.diaryDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          }).length / daysInMonth) * 100)}}%
        </div>
        <div class="text-sm text-gray-600 mt-1">작성률</div>
      </Card>
    </div>
  </div>
</template>
