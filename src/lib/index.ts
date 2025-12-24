// Re-export all services and types from a single entry point
export { api } from './client';

// Auth Service
export { authApi } from './services/AuthService';
export type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MessageResponse,
} from './types';

// Role Service
export { roleApi } from './services/RoleService';
export type {
  Role,
  Permission,
  RolePermission,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from './services/RoleService';

// Permission Service
export { permissionApi } from './services/PermissionService';

// Common Types
export type {
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  StandardResponse,
} from './common';
