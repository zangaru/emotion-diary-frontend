export interface WeatherOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

export const WEATHER_OPTIONS: WeatherOption[] = [
  { value: 'Clear sky', label: '맑음', emoji: '☀️', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Partly cloudy', label: '구름 조금', emoji: '⛅', color: 'bg-blue-100 text-blue-800' },
  { value: 'Cloudy', label: '흐림', emoji: '☁️', color: 'bg-gray-100 text-gray-800' },
  { value: 'Fog', label: '안개', emoji: '🌫️', color: 'bg-purple-100 text-purple-800' },
  { value: 'Drizzle', label: '이슬비', emoji: '🌦️', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'Rain', label: '비', emoji: '🌧️', color: 'bg-blue-200 text-blue-900' },
  { value: 'Snow', label: '눈', emoji: '❄️', color: 'bg-white text-gray-800' },
  { value: 'Thunderstorm', label: '뇌우', emoji: '⚡', color: 'bg-yellow-200 text-yellow-900' },
  { value: 'Unknown', label: '알 수 없음', emoji: '❓', color: 'bg-gray-200 text-gray-900' },
];

/**
 * 날씨 값으로 옵션 찾기
 */
export const getWeatherOption = (value: string): WeatherOption | undefined => {
  return WEATHER_OPTIONS.find((weather) => weather.value === value);
};
