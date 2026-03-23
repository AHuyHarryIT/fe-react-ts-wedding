import { api } from '@/api/client';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MessageResponse,
} from '@types';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }

  return payload as T;
};

export const authApi = {
  // Login with phone number and password
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/login',
      data
    );
    return unwrapApiData<AuthResponse>(response.data);
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/register',
      data
    );
    return unwrapApiData<AuthResponse>(response.data);
  },

  // Logout (clears cookies)
  logout: async (): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>('/auth/logout');
      return response.data;
    } finally {
      // Always clear cookies on client side after logout
      await clearAuthCookies();
    }
  },

  // Get current user (alternative endpoint to /auth/profile)
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/me');
    return unwrapApiData<User>(response.data);
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/profile');
    return unwrapApiData<User>(response.data);
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<User | ApiEnvelope<User>>(
      '/auth/profile',
      data
    );
    return unwrapApiData<User>(response.data);
  },

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

  // Refresh tokens
  refreshTokens: async (): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/auth/refresh');
    return response.data;
  },
};

/**
 * Clear auth cookies from the client
 * Note: HttpOnly cookies are cleared by the server on logout
 */
export const clearAuthCookies = async (): Promise<void> => {
  // Clear auth state
  const { useAuthStore } = await import('@stores/authStore');
  useAuthStore.getState().clearAuth();

  // Remove any auth-related data from sessionStorage
  sessionStorage.clear();
};
