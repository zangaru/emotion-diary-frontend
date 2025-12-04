import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number; email: string } | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);
      token.value = data.accessToken;
      localStorage.setItem('token', data.accessToken);

      user.value = { id: 0, email }; // 임시로 이메일만 저장

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };

  return {
    user,
    token,
    login,
    logout,
  };
});
