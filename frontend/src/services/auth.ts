import { apiCall } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

export const authService = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse['data']>('POST', '/api/auth/register', credentials);
    
    if (response.success && response.data?.token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response as AuthResponse;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse['data']>('POST', '/api/auth/login', credentials);
    
    if (response.success && response.data?.token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response as AuthResponse;
  },

  // Logout user
  logout: async (): Promise<void> => {
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
    // Redirect to login page
    window.location.href = '/auth/login';
  },

  // Get current user profile
  getProfile: async () => {
    return apiCall<User>('GET', '/api/auth/me');
  },

  // Update user profile
  updateProfile: async (data: Partial<User>) => {
    return apiCall<User>('PUT', '/api/auth/profile', data);
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('POST', '/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Refresh token
  refreshToken: async () => {
    return apiCall<{ token: string }>('POST', '/api/auth/refresh');
  },

  // Verify JWT token by getting current user
  verifyToken: async () => {
    return apiCall<User>('GET', '/api/auth/me');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  // Get token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },
};
