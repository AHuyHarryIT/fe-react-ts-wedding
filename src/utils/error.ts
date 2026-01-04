import type { ApiErrorData } from '@types';
import type { AxiosError } from 'axios';
import axios from 'axios';

/**
 * Extract error message from various error types
 * Prioritizes API error messages, then Error messages
 */
export function getErrorMessage(error: unknown): string {
  // Handle AxiosError
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorData>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  // Handle standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return 'An error occurred';
}

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;

    // Extract from API response body
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Fallback to HTTP status message
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }

    // Network error
    if (axiosError.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }

    // Timeout error
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    return axiosError.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

// Error logger for debugging
export const logError = (error: unknown, context: string): void => {
  if (import.meta.env.DEV) {
    console.error(`[API Error - ${context}]`, error);
  }
};
