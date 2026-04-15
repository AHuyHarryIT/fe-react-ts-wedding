import axios from 'axios';
import type { ApiErrorData } from '@types';

interface RecordValue {
  [key: string]: unknown;
}

export interface PermissionContext {
  requiredPermissions: string[];
  missingPermissions: string[];
}

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const parsePermissionDetails = (
  details: unknown
): { context: PermissionContext; hasPermissionKeys: boolean } | null => {
  if (!isRecord(details)) {
    return null;
  }

  const hasRequiredPermissions = Object.prototype.hasOwnProperty.call(
    details,
    'requiredPermissions'
  );
  const hasMissingPermissions = Object.prototype.hasOwnProperty.call(
    details,
    'missingPermissions'
  );

  const context: PermissionContext = {
    requiredPermissions: toStringArray(details.requiredPermissions),
    missingPermissions: toStringArray(details.missingPermissions),
  };

  return {
    context,
    hasPermissionKeys: hasRequiredPermissions || hasMissingPermissions,
  };
};

const getErrorData = (error: unknown): ApiErrorData | undefined => {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    return error.response?.data;
  }

  if (isRecord(error)) {
    const directData = error as unknown as ApiErrorData;
    if (directData.message && directData.success === false) {
      return directData;
    }

    const response = error.response;
    if (isRecord(response)) {
      const data = response.data;
      if (isRecord(data) || typeof data === 'object') {
        return data as ApiErrorData;
      }
    }
  }

  return undefined;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (isRecord(error) && typeof error.statusCode === 'number') {
    return error.statusCode;
  }

  const data = getErrorData(error);
  return data?.statusCode;
};

const getErrorCode = (error: unknown): string | undefined => {
  const data = getErrorData(error);
  return data?.code ?? data?.error?.code;
};

export const isPermissionDeniedError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  const code = getErrorCode(error);

  return status === 403 || code === 'FORBIDDEN';
};

export const extractPermissionContext = (
  error: unknown
): PermissionContext | null => {
  if (!isPermissionDeniedError(error)) {
    return null;
  }

  const data = getErrorData(error);

  const rootResult = parsePermissionDetails(data?.details);
  if (rootResult?.hasPermissionKeys) {
    return rootResult.context;
  }

  const nestedResult = parsePermissionDetails(data?.error?.details);
  if (nestedResult?.hasPermissionKeys) {
    return nestedResult.context;
  }

  return null;
};

export const buildForbiddenReason = (
  source: unknown,
  fallback = 'You do not have permission to perform this action.'
): string => {
  const context: PermissionContext | null =
    isRecord(source) &&
    Array.isArray(source.requiredPermissions) &&
    Array.isArray(source.missingPermissions)
      ? (source as PermissionContext)
      : extractPermissionContext(source);

  if (!context) {
    return fallback;
  }

  if (context.missingPermissions.length === 1) {
    return `Missing permission: ${context.missingPermissions[0]}`;
  }

  if (context.missingPermissions.length > 1) {
    return `Missing permissions: ${context.missingPermissions.join(', ')}`;
  }

  if (context.requiredPermissions.length === 1) {
    return `Required permission: ${context.requiredPermissions[0]}`;
  }

  if (context.requiredPermissions.length > 1) {
    return `Required permissions: ${context.requiredPermissions.join(', ')}`;
  }

  return fallback;
};
