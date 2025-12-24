import { api } from '@lib/client';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MessageResponse,
} from '@lib/types';

export const authApi = {
  // Login with phone number and password
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Logout (clears cookies)
  logout: async (): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/auth/logout');
    return response.data;
  },

  // Get current user (alternative endpoint to /auth/profile)
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
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
