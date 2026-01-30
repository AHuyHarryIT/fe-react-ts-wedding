/**
 * Payment Status Types
 * Aligned with backend Order and Payment entities
 */

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELED';

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttempt {
  id: string;
  attemptNumber: number;
  amount: number;
  status: 'INITIATED' | 'RESPONDED' | 'SUCCESSFUL' | 'FAILED';
  requestedAt: string;
  respondedAt?: string;
  resultCode?: string;
}

export interface MomoQRPaymentRequest {
  bookingId: string;
  paymentId: string;
  amount: number;
}

export interface MomoQRCodeResponse {
  amount: number;
  orderInfo?: string;
  bookingId?: string;
  qrCodeUrl?: string;
  deepLink?: string;
  deeplink?: string;
  payUrl?: string;
  orderId?: string;
  expiresAt?: string;
  requestId?: string;
  partnerCode?: string;
  responseTime?: number;
  message?: string;
  resultCode?: number;
  deeplinkMiniApp?: string;
  qrCode?: string | null;
}

export interface PaymentPollingConfig {
  /**
   * Interval in milliseconds to poll payment status
   * @default 2000
   */
  pollInterval?: number;
  /**
   * Maximum time in milliseconds to poll before giving up
   * @default 300000 (5 minutes)
   */
  maxPollDuration?: number;
  /**
   * Whether to retry on network errors
   * @default true
   */
  retryOnError?: boolean;
}

export interface PaymentUIState {
  isPolling: boolean;
  pollCount: number;
  elapsedSeconds: number;
  lastError?: string;
  lastPollTime?: Date;
}
export interface MomoInitiateResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  deeplinkMiniApp?: string;
  qrCode?: string | null;
}
