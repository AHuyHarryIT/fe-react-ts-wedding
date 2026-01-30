import type { Booking } from './booking';
import type { PaginationParams } from './common';

export type OrderStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'E_WALLET'
  | 'MOMO';

export type OrderPaymentStatus =
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUNDED'
  | 'SUCCESS';

export interface OrderSummary {
  totalPrice?: number;
  totalAmount?: number;
  depositAmount: number;
  remainingAmount: number;
  depositPaid: number;
  remainingPaid?: number;
  totalPaid: number;
  isPaid?: boolean;
  pendingAmount?: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  paymentType?: 'DEPOSIT' | 'FULL' | 'REMAINING';
  status: OrderPaymentStatus;
  txnId?: string;
  note?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Order {
  bookingId: Booking['id'];
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  depositPaid: number;
  remainingPaid: number;
  status: OrderStatus;
  booking?: Booking;
  payments?: Payment[];
  summary?: OrderSummary;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CheckoutRequest {
  bookingId: string;
  makeDeposit?: boolean;
  depositValue?: number;
  isDepositPercentage?: boolean;
  paymentMethod?: PaymentMethod;
  note?: string;
  txnId?: string;
}

export interface PayRemainingRequest {
  bookingId: string;
  paymentAmount: number;
  paymentMethod?: PaymentMethod;
  note?: string;
  txnId?: string;
}

export interface QueryOrderParams extends PaginationParams {
  status?: OrderStatus;
  bookingId?: string;
}
