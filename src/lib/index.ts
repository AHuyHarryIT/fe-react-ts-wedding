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

// Product Service
export { productApi } from './services/ProductService';
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from './services/ProductService';

// Category Service
export { categoryApi } from './services/CategoryService';
export type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './services/CategoryService';

// Album Service
export { albumApi } from './services/AlbumService';
export type {
  Album,
  AlbumFile,
  AlbumWithFiles,
  CreateAlbumRequest,
  UpdateAlbumRequest,
  GenerateShareTokenRequest,
  AddFilesToAlbumRequest,
  RemoveFilesFromAlbumRequest,
} from './services/AlbumService';

// Common Types
export type {
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  StandardResponse,
} from './common';
