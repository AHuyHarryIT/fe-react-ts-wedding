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

// Request interceptor (cookies handled automatically by browser)
api.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically with withCredentials: true
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

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}

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

// ============== Role Management ==============

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: RolePermission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const roleApi = {
  // Get all roles with pagination
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Role>> => {
    const response = await api.get<PaginatedResponse<Role>>('/roles', {
      params,
    });
    return response.data;
  },

  // Get a single role by ID
  getOne: async (id: string): Promise<StandardResponse<Role>> => {
    const response = await api.get<StandardResponse<Role>>(`/roles/${id}`);
    return response.data;
  },

  // Create a new role
  create: async (data: CreateRoleRequest): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>('/roles', data);
    return response.data;
  },

  // Update a role
  update: async (
    id: string,
    data: UpdateRoleRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.patch<StandardResponse<Role>>(
      `/roles/${id}`,
      data
    );
    return response.data;
  },

  // Delete a role
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/roles/${id}`);
    return response.data;
  },

  // Assign permissions to a role
  assignPermissions: async (
    id: string,
    data: AssignPermissionsRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>(
      `/roles/${id}/permissions/assign`,
      data
    );
    return response.data;
  },

  // Revoke permissions from a role
  revokePermissions: async (
    id: string,
    data: AssignPermissionsRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>(
      `/roles/${id}/permissions/revoke`,
      data
    );
    return response.data;
  },

  // Get permissions for a role
  getPermissions: async (
    id: string
  ): Promise<StandardResponse<Permission[]>> => {
    const response = await api.get<StandardResponse<Permission[]>>(
      `/roles/${id}/permissions`
    );
    return response.data;
  },
};

// ============== Permission Management ==============

export const permissionApi = {
  // Get all permissions
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Permission>> => {
    const response = await api.get<PaginatedResponse<Permission>>(
      '/permissions',
      { params }
    );
    return response.data;
  },
};
