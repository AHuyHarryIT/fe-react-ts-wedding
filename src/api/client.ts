import type { ApiErrorData } from '@types';
import { extractErrorMessage, logError } from '@utils/error';
import axios, { type AxiosError } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cookie-based auth
});

// Track if a token refresh is in progress to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor - refresh token before each request
api.interceptors.request.use(
  async (config) => {
    // Skip token refresh for login, register, and refresh endpoints
    const skipRefresh = ['/auth/login', '/auth/register', '/auth/refresh'].some(
      (path) => config.url?.includes(path)
    );

    if (!skipRefresh) {
      try {
        // If a refresh is already in progress, wait for it
        if (isRefreshing) {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } else {
          // Refresh the token before making the request
          isRefreshing = true;
          await api.post('/auth/refresh');
          isRefreshing = false;
          processQueue();
        }
      } catch (error) {
        isRefreshing = false;
        processQueue(error);
        logError(error, 'Token Refresh');
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = error as AxiosError<ApiErrorData>;
    const errorMessage = extractErrorMessage(error);
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;

    logError({ statusCode, url, message: errorMessage }, 'Response Error');

    // Handle specific HTTP error codes
    switch (statusCode) {
      case 400:
        // Bad request - validation errors
        console.warn(
          '[Validation Error]',
          axiosError.response?.data?.error?.details
        );
        break;

      case 401:
        // Unauthorized - token expired or invalid
        if (!url?.includes('/login') && !url?.includes('/register')) {
          // Clear auth state and redirect to login
          window.location.href = '/login';
        }
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
