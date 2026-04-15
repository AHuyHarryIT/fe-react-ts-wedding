export interface ForbiddenPermissionDetails {
  requiredPermissions?: string[];
  missingPermissions?: string[];
}

export interface ApiErrorData {
  success: false;
  message: string;
  statusCode?: number;
  code?: string;
  details?: ForbiddenPermissionDetails;
  error?: {
    code?: string;
    details?: ForbiddenPermissionDetails;
  };
}
