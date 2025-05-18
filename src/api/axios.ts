import axios from 'axios';
import { ApiResponse } from '../types/ResponseTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const apiResponse = response.data as ApiResponse<unknown>;

    if (!apiResponse.success) {
      return Promise.reject(new Error(apiResponse.message ?? 'Unknown error'));
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user_data');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Try to get error message from API response
      const apiResponse = error.response.data as Partial<ApiResponse<unknown>>;
      throw new Error(apiResponse?.message || error.message);
    }
    throw error;
  }
);

export default axiosInstance;