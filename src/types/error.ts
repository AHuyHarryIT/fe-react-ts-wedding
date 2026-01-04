export interface ApiErrorData {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}
