import api from './index';

export interface WeatherResponse {
  lat: number;
  lon: number;
  condition: string;
}

export const weatherApi = {
  /**
   * 위도와 경도를 기반으로 서버에 추천 날씨 요청
   */
  getCurrent: (lat: number, lon: number) =>
    api
      .get<WeatherResponse>('/weather', {
        params: { lat, lon },
      })
      .then((res) => res.data),
};
