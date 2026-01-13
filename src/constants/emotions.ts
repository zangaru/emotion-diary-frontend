export interface EmotionOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: EmotionOption[] = [
  { value: '행복', label: '행복', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
  { value: '슬픔', label: '슬픔', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
  { value: '화남', label: '화남', emoji: '😠', color: 'bg-red-100 text-red-800' },
  { value: '불안', label: '불안', emoji: '😰', color: 'bg-purple-100 text-purple-800' },
  { value: '평온', label: '평온', emoji: '😌', color: 'bg-green-100 text-green-800' },
  { value: '설렘', label: '설렘', emoji: '🥰', color: 'bg-pink-100 text-pink-800' },
  { value: '우울', label: '우울', emoji: '😔', color: 'bg-gray-100 text-gray-800' },
  { value: '감사', label: '감사', emoji: '🙏', color: 'bg-orange-100 text-orange-800' },
];

/**
 * 감정 값으로 옵션 찾기
 */
export const getEmotionOption = (value: string): EmotionOption | undefined => {
  return EMOTIONS.find((emotion) => emotion.value === value);
};

/**
 * 감정 값만 배열로 반환
 */
export const EMOTION_VALUES = EMOTIONS.map((e) => e.value);
