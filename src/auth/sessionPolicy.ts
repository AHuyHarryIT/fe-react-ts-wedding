import axios from 'axios';
import type { ApiErrorData } from '@types';
import { useAuthStore } from '@stores/authStore';

const POST_LOGIN_REDIRECT_KEY = 'staff_post_login_redirect';
const AUTH_FEEDBACK_REASON_KEY = 'staff_auth_feedback_reason';
const AUTH_ROUTE = '/login';
const DEFAULT_REDIRECT_PATH = '/';

type RecordValue = Record<string, unknown>;

export type AuthFeedbackReason = 'login-required' | 'session-expired';

export interface ForbiddenContext {
  requiredPermissions: string[];
  missingPermissions: string[];
}

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const currentPath = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_PATH;
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

const normalizeRedirectPath = (value?: string | null): string => {
  if (!value || typeof value !== 'string') {
    return DEFAULT_REDIRECT_PATH;
  }

  if (!value.startsWith('/')) {
    return DEFAULT_REDIRECT_PATH;
  }

  if (value === AUTH_ROUTE) {
    return DEFAULT_REDIRECT_PATH;
  }

  return value;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const getErrorData = (error: unknown): ApiErrorData | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.data as ApiErrorData | undefined;
  }

  if (isRecord(error)) {
    return error as unknown as ApiErrorData;
  }

  return undefined;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  const data = getErrorData(error) as
    | (ApiErrorData & { statusCode?: number })
    | undefined;
  return data?.statusCode;
};

export const captureRedirectPath = (path?: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const targetPath = normalizeRedirectPath(path ?? currentPath());
  if (targetPath !== AUTH_ROUTE) {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, targetPath);
  }
};

export const consumeRedirectPath = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_PATH;
  }

  const stored = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (stored) {
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return normalizeRedirectPath(stored);
};

export const setAuthFeedbackReason = (reason: AuthFeedbackReason): void => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(AUTH_FEEDBACK_REASON_KEY, reason);
};

export const getAuthFeedbackReason = (): AuthFeedbackReason | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = sessionStorage.getItem(AUTH_FEEDBACK_REASON_KEY);
  if (stored === 'login-required' || stored === 'session-expired') {
    return stored;
  }

  return null;
};

export const consumeAuthFeedbackReason = (): AuthFeedbackReason | null => {
  const reason = getAuthFeedbackReason();

  if (typeof window !== 'undefined' && reason) {
    sessionStorage.removeItem(AUTH_FEEDBACK_REASON_KEY);
  }

  return reason;
};

export const forceRelogin = (
  reason: AuthFeedbackReason = 'session-expired',
  redirectPath?: string
): void => {
  useAuthStore.getState().clearAuth();
  captureRedirectPath(redirectPath);
  setAuthFeedbackReason(reason);

  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== AUTH_ROUTE) {
    window.location.assign(AUTH_ROUTE);
  }
};

export const isSessionExpiredResponse = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const tokenExpiredHeader = error.response?.headers?.['x-token-expired'];
    const code = (
      error.response?.data as (ApiErrorData & { code?: string }) | undefined
    )?.code;

    if (statusCode === 401) {
      return true;
    }

    if (tokenExpiredHeader === 'true') {
      return true;
    }

    return code === 'UNAUTHORIZED';
  }

  const statusCode = getErrorStatus(error);
  const data = getErrorData(error) as
    | (ApiErrorData & { code?: string })
    | undefined;
  return statusCode === 401 || data?.code === 'UNAUTHORIZED';
};

export const mapForbiddenContext = (
  error: unknown
): ForbiddenContext | null => {
  const statusCode = getErrorStatus(error);
  const data = getErrorData(error) as
    | (ApiErrorData & {
        code?: string;
        details?: unknown;
      })
    | undefined;

  if (statusCode !== 403 && data?.code !== 'FORBIDDEN') {
    return null;
  }

  const rootDetails = isRecord(data?.details)
    ? (data.details as RecordValue)
    : undefined;
  const nestedDetails = isRecord(data?.error)
    ? isRecord(data.error.details)
      ? (data.error.details as RecordValue)
      : undefined
    : undefined;
  const details = rootDetails ?? nestedDetails;

  return {
    requiredPermissions: toStringArray(details?.requiredPermissions),
    missingPermissions: toStringArray(details?.missingPermissions),
  };
};
