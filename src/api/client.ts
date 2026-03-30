import type { ApiErrorData } from '@types';
import { extractErrorMessage, logError } from '@utils/error';
import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@stores/authStore';

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  return 'http://localhost:3000';
};

const API_BASE_URL = resolveApiBaseUrl();
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cookie-based auth
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError<ApiErrorData>;
    const errorMessage = extractErrorMessage(error);
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;

    logError({ statusCode, url, message: errorMessage }, 'Response Error');

    // Handle unauthorized sessions by clearing local auth state.
    if (statusCode === 401 && !url?.includes('/auth/login')) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle specific HTTP error codes
    switch (statusCode) {
      case 400:
        // Bad request - validation errors
        console.warn(
          '[Validation Error]',
          axiosError.response?.data?.error?.details
        );
        break;

      case 403:
        // Forbidden - insufficient permissions
        console.warn(
          '[Permission Error]',
          'User does not have permission to perform this action'
        );
        break;

      case 404:
        // Not found
        console.warn('[Not Found Error]', `Resource not found: ${url}`);
        break;

      case 409:
        // Conflict - duplicate resource
        console.warn('[Conflict Error]', errorMessage);
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error(
          '[Server Error]',
          `Server error (${statusCode}): ${errorMessage}`
        );
        break;

      default:
        if (!navigator.onLine) {
          console.warn('[Network Error]', 'No internet connection');
        }
    }

    // Re-throw the error with enhanced message for downstream handlers
    return Promise.reject(error);
  }
);
