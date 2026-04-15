export interface ApiErrorData {
  success: false;
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
  error?: {
    code?: string;
    details?: unknown;
  };
}
