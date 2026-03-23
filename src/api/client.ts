import type { ApiErrorData } from '@types';
import { extractErrorMessage, logError } from '@utils/error';
import axios, { type AxiosError } from 'axios';

const resolveApiBaseUrl = () => {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://127.0.0.1:3000';
  }

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

const refreshSession = async (): Promise<void> => {
  await api.post('/auth/refresh');
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError<ApiErrorData>;
    const errorMessage = extractErrorMessage(error);
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalRequest = axiosError.config as any;

    logError({ statusCode, url, message: errorMessage }, 'Response Error');

    // Handle 401 with automatic token refresh
    if (
      statusCode === 401 &&
      !url?.includes('/auth/login') &&
      !url?.includes('/auth/register') &&
      !url?.includes('/auth/refresh')
    ) {
      // If server says refresh token is expired, logout immediately
      const tokenExpired = axiosError.response?.headers?.['x-token-expired'];
      if (tokenExpired === 'true') {
        const { useAuthStore } = await import('@stores/authStore');
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Prevent infinite retry — only retry once
      if (originalRequest._retry) {
        const { useAuthStore } = await import('@stores/authStore');
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Refresh cookies first, then retry the original request once.
          await refreshSession();

          if (originalRequest.headers?.Authorization) {
            delete originalRequest.headers.Authorization;
          }

          const retryResponse = await api(originalRequest);
          isRefreshing = false;
          processQueue();
          return retryResponse;
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError);
          logError(refreshError, 'Request retry failed');

          // Clear auth state and redirect to login
          const { useAuthStore } = await import('@stores/authStore');
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              originalRequest._retry = true;

              if (originalRequest.headers?.Authorization) {
                delete originalRequest.headers.Authorization;
              }

              api(originalRequest).then(resolve).catch(reject);
            },
            reject,
          });
        });
      }
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
