import axios from 'axios';

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
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 during login - let the component handle it
    // Only redirect if it's an authenticated endpoint that fails
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/login')
    ) {
      // Clear auth state and redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
