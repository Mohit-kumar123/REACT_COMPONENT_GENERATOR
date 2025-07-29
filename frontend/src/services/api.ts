import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// Configure base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-component-generator-backend-18mr.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API call wrapper
export async function apiCall<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
    });
    return response.data;
  } catch (error: any) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
}

// Health check
export const healthCheck = () => apiCall('GET', '/health');

export default api;
