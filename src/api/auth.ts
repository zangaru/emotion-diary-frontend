import api from './index';

export const authApi = {
  // 회원가입
  register: (email: string, password: string) => api.post('/users/register', { email, password }),

  // 로그인
  login: (email: string, password: string) => api.post('/auth/signin', { email, password }),
};
