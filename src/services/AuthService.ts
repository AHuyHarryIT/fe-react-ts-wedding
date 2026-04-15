import { api } from '@/api/client';
import { useAuthStore } from '@stores/authStore';
import type {
  LoginRequest,
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

type RequestConfigWithAuthHandling = {
  skipAuthRedirect?: boolean;
};

let initializeAuthPromise: Promise<User | null> | null = null;

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }

  return payload as T;
};

const normalizeUser = (incoming: User): User => ({
  ...incoming,
  firstName: incoming.firstName ?? undefined,
  lastName: incoming.lastName ?? undefined,
  email: incoming.email ?? undefined,
});

export const authApi = {
  // Login with phone number and password
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse | ApiEnvelope<AuthResponse>>(
      '/auth/login',
      data
    );
    const authData = unwrapApiData<AuthResponse>(response.data);

    return {
      ...authData,
      user: normalizeUser(authData.user),
    };
  },

  // Logout (clears cookies)
  logout: async (): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>('/auth/logout');
      return response.data;
    } finally {
      // Always clear client auth state after logout
      clearAuthCookies();
    }
  },

  // Get current user (alternative endpoint to /auth/profile)
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/me', {
      skipAuthRedirect: true,
    } as RequestConfigWithAuthHandling);
    return normalizeUser(unwrapApiData<User>(response.data));
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/auth/profile');
    return normalizeUser(unwrapApiData<User>(response.data));
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<User | ApiEnvelope<User>>(
      '/auth/profile',
      data
    );
    return normalizeUser(unwrapApiData<User>(response.data));
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
};

export async function initializeAuth(force = false): Promise<User | null> {
  const authStore = useAuthStore.getState();

  if (!force && authStore.isInitialized) {
    return authStore.user;
  }

  if (!force && initializeAuthPromise) {
    return initializeAuthPromise;
  }

  initializeAuthPromise = (async () => {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const user = await authApi.getCurrentUser();
      authStore.setAuth(user);
      return user;
    } catch {
      authStore.clearAuth();
      return null;
    } finally {
      authStore.setInitialized(true);
      authStore.setLoading(false);
      initializeAuthPromise = null;
    }
  })();

  return initializeAuthPromise;
}

/**
 * Clear auth cookies from the client
 * Note: HttpOnly cookies are cleared by the server on logout
 */
export const clearAuthCookies = (): void => {
  useAuthStore.getState().clearAuth();
};
