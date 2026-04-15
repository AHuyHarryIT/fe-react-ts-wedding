import type { ApiErrorData } from '@types';
import { extractErrorMessage, logError } from '@utils/error';
import axios, { type AxiosError } from 'axios';
import {
  forceRelogin,
  isSessionExpiredResponse,
  mapForbiddenContext,
  type ForbiddenContext,
} from '@/auth/sessionPolicy';

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  return 'http://localhost:3000';
};

const API_BASE_URL = resolveApiBaseUrl();

type RequestConfigWithAuthHandling = AxiosError['config'] & {
  skipErrorLogging?: boolean;
  skipAuthRedirect?: boolean;
};

type ApiErrorWithForbiddenContext = AxiosError<ApiErrorData> & {
  forbiddenContext?: ForbiddenContext;
};

const AUTH_REDIRECT_BYPASS_ENDPOINTS = ['/auth/login'];

const shouldBypassAuthRedirect = (url?: string): boolean =>
  AUTH_REDIRECT_BYPASS_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

const normalizeForbiddenPayload = (
  axiosError: ApiErrorWithForbiddenContext,
  forbiddenContext: ForbiddenContext
): void => {
  if (
    !axiosError.response?.data ||
    typeof axiosError.response.data !== 'object'
  ) {
    return;
  }

  const responseData = axiosError.response.data as ApiErrorData;

  const existingDetails =
    responseData.details &&
    typeof responseData.details === 'object' &&
    !Array.isArray(responseData.details)
      ? (responseData.details as Record<string, unknown>)
      : {};

  axiosError.response.data = {
    ...responseData,
    details: {
      ...existingDetails,
      requiredPermissions: forbiddenContext.requiredPermissions,
      missingPermissions: forbiddenContext.missingPermissions,
    },
  };
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cookie-based auth
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as ApiErrorWithForbiddenContext;
    const errorMessage = extractErrorMessage(error);
    const statusCode = axiosError.response?.status;
    const url = axiosError.config?.url;
    const originalRequest = axiosError.config as RequestConfigWithAuthHandling;
    const skipErrorLogging = Boolean(originalRequest?.skipErrorLogging);

    if (!skipErrorLogging) {
      logError({ statusCode, url, message: errorMessage }, 'Response Error');
    }

    if (originalRequest?.skipAuthRedirect) {
      return Promise.reject(axiosError);
    }

    if (statusCode === 403) {
      const forbiddenContext = mapForbiddenContext(axiosError);
      if (forbiddenContext) {
        axiosError.forbiddenContext = forbiddenContext;
        normalizeForbiddenPayload(axiosError, forbiddenContext);
      }

      return Promise.reject(axiosError);
    }

    if (shouldBypassAuthRedirect(url)) {
      return Promise.reject(axiosError);
    }

    if (isSessionExpiredResponse(axiosError)) {
      forceRelogin('session-expired');
      return Promise.reject(axiosError);
    }

    // Handle specific HTTP error codes
    switch (statusCode) {
      case 400:
        // Bad request - validation errors
        console.warn(
          '[Validation Error]',
          axiosError.response?.data?.error?.details
        );
        break;

      case 404:
        // Not found
        if (!skipErrorLogging) {
          console.warn('[Not Found Error]', `Resource not found: ${url}`);
        }
        break;

      case 409:
        // Conflict - duplicate resource
        console.warn('[Conflict Error]', errorMessage);
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error(
          '[Server Error]',
          `Server error (${statusCode}): ${errorMessage}`
        );
        break;

      default:
        if (!navigator.onLine) {
          console.warn('[Network Error]', 'No internet connection');
        }
    }

    // Re-throw the error with enhanced message for downstream handlers
    return Promise.reject(axiosError);
  }
);
