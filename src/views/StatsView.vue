<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Pie, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Flame, BarChart3 } from 'lucide-vue-next';
import { diaryApi, type StatsResponse } from '@/api/diary';
import { getEmotionOption } from '@/constants/emotions';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

const stats = ref<StatsResponse | null>(null);
const isLoading = ref(false);
const error = ref('');

const fetchStats = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const { data } = await diaryApi.getStats();
    stats.value = data;
  } catch (err) {
    console.error('통계 조회 실패:', err);
    error.value = '통계를 불러오는데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const emotionChartLabels = computed(() => {
  if (!stats.value) return [];
  return stats.value.emotionCounts.map(e => e.emotion);
});

const emotionChartData = computed(() => {
  if (!stats.value) return { datasets: [] };
  return {
    labels: emotionChartLabels.value,
    datasets: [
      {
        data: stats.value.emotionCounts.map(e => e.count),
        backgroundColor: stats.value.emotionCounts.map(e => getEmotionOption(e.emotion)?.color.replace('text-', '')?.split(' ').find(c => c.startsWith('bg-')) || '#9CA3AF'),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };
});

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        font: { size: 12 },
      },
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem: { raw: unknown; label: string; dataset: { data: unknown[] } }) => {
          const value = Number(tooltipItem.raw);
          const total = tooltipItem.dataset.data.reduce((a: number, b: unknown) => a + Number(b), 0);
          const percentage = Math.round((value / total) * 100);
          return `${tooltipItem.label}: ${value}개 (${percentage}%)`;
        },
      },
    },
  },
};

const trendChartLabels = computed(() => {
  if (!stats.value) return [];
  return stats.value.monthlyTrend.map(t => t.month);
});

const trendChartData = computed(() => {
  if (!stats.value) return { datasets: [] };
  const allEmotions = Array.from(new Set(stats.value.monthlyTrend.flatMap(t => t.emotions.map(e => e.emotion))));
  return {
    labels: trendChartLabels.value,
    datasets: allEmotions.map(emotion => {
      const option = getEmotionOption(emotion);
      const color = option?.color.match(/bg-(\w+)-\d+/)?.[1] || 'gray';
      const colors: Record<string, string> = {
        yellow: '#FCD34D',
        blue: '#60A5FA',
        red: '#F87171',
        purple: '#A78BFA',
        green: '#34D399',
        pink: '#F472B6',
        gray: '#9CA3AF',
        orange: '#FB923C',
      };
      return {
        label: emotion,
        data: stats.value!.monthlyTrend.map(t => {
          const found = t.emotions.find(e => e.emotion === emotion);
          return found ? found.count : 0;
        }),
        borderColor: colors[color] || '#9CA3AF',
        backgroundColor: `${colors[color]}20`,
        tension: 0.3,
        fill: true,
      };
    }),
  };
});

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        font: { size: 11 },
        boxWidth: 12,
      },
    },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 6, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, font: { size: 11 } },
    },
  },
};

const streakText = computed(() => {
  if (!stats.value) return '';
  if (stats.value.currentStreak === 0) return '연속 작성 기록 없음';
  return `${stats.value.currentStreak}일 연속 작성 중! 🔥`;
});

const mostFrequentEmotionText = computed(() => {
  if (!stats.value || !stats.value.mostFrequentEmotion) return '아직 데이터가 없습니다';
  const option = getEmotionOption(stats.value.mostFrequentEmotion);
  return `${option?.emoji} ${stats.value.mostFrequentEmotion}`;
});

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <DefaultLayout>
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">감정 통계</h1>
        <p class="text-gray-600 mt-2">나의 감정 패턴을 한눈에 확인해보세요</p>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">통계를 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else-if="stats" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">총 일기 수</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalDiaries }}</p>
              </div>
              <BarChart3 class="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">이번 달</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.thisMonthCount }}</p>
              </div>
              <Calendar class="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">연속 작성</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.currentStreak }}</p>
              </div>
              <Flame class="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">가장 많은 감정</p>
                <p class="text-xl font-bold text-gray-900">{{ mostFrequentEmotionText }}</p>
              </div>
              <TrendingUp class="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">감정 분포</h2>
            <div class="relative" style="height: 300px">
              <Pie v-if="stats.emotionCounts.length > 0" :data="emotionChartData" :options="pieOptions" />
              <div v-else class="h-full flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            </div>
          </Card>

          <Card class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">연속 작성 현황</h2>
            <div class="flex flex-col items-center justify-center py-8">
              <div class="text-6xl mb-4">
                {{ stats.currentStreak > 0 ? '🔥' : '📝' }}
              </div>
              <p class="text-2xl font-bold text-gray-900 mb-2">{{ streakText }}</p>
              <p class="text-sm text-gray-600">
                {{ stats.currentStreak > 0 ? '오늘도 일기를 작성해서 스크릭을 유지해요!' : '매일 일기를 작성하면 스크릭이 쌓여요!' }}
              </p>
            </div>
          </Card>
        </div>

        <Card class="p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">월별 감정 추세</h2>
          <div class="relative" style="height: 350px">
            <Line v-if="stats.monthlyTrend.length > 0" :data="trendChartData" :options="lineOptions" />
            <div v-else class="h-full flex items-center justify-center text-gray-500">
              데이터가 없습니다
            </div>
          </div>
        </Card>

        <div class="text-center">
          <Button @click="$router.push('/diaries/new')" variant="default">새 일기 쓰기</Button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
