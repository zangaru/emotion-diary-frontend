import api from './index';

export interface CreateDiaryDto {
  title: string;
  content: string;
  emotion: string;
  diaryDate: string; // YYYY-MM-DD
}

export interface Diary {
  id: number;
  title: string;
  content: string;
  emotion: string;
  diaryDate: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const diaryApi = {
  // 일기 작성
  create: (data: CreateDiaryDto) => api.post<Diary>('/diaries', data),

  // 일기 목록 조회
  getAll: () => api.get<Diary[]>('/diaries'),

  // 일기 상세 조회
  getOne: (id: number) => api.get<Diary>(`/diaries/${id}`),

  // 일기 수정
  update: (id: number, data: Partial<CreateDiaryDto>) => api.patch<Diary>(`/diaries/${id}`, data),

  // 일기 삭제
  delete: (id: number) => api.delete(`/diaries/${id}`),

  // 일기 검색
  search: (keyword: string) => api.get<Diary[]>(`/diaries/search`, { params: { keyword: keyword } }),

  // 감정별 필터링
  filterByEmotion: (emotion: string) => api.get<Diary[]>(`/diaries/emotion/${emotion}`),
};
