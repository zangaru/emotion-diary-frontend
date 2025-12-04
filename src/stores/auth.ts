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

      // 프로필 정보 가져오기
      const profile = await authApi.getProfile();
      user.value = profile.data.user;

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

  const checkAuth = async () => {
    if (!token.value) return false;

    try {
      const { data } = await authApi.getProfile();
      user.value = data.user;
      return true;
    } catch {
      logout();
      return false;
    }
  };

  return {
    user,
    token,
    login,
    logout,
    checkAuth,
  };
});
