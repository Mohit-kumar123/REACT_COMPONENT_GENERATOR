import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      
      if (savedToken && !isAuthenticated) {
        try {
          const response = await authService.verifyToken();
          if (response.success && response.data?.user) {
            login(savedToken, response.data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, login, logout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

export const useAuthActions = () => {
  const { login: storeLogin, logout: storeLogout } = useAuthStore();
  
  const loginUser = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        storeLogin(response.data.token, response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: unknown) {
      return { success: false, message: (error as Error).message || 'Login failed' };
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });
      if (response.success && response.data) {
        storeLogin(response.data.token, response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: unknown) {
      return { success: false, message: (error as Error).message || 'Registration failed' };
    }
  };

  const logoutUser = () => {
    storeLogout();
  };

  return {
    loginUser,
    registerUser,
    logoutUser,
  };
};
