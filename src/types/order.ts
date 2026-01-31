import type { Booking } from './booking';
import type { PaginationParams } from './common';

export type OrderStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'E_WALLET'
  | 'MOMO';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'REFUNDED'
  | 'PARTIAL_PAID';

export type PaymentType =
  | 'DEPOSIT'
  | 'FULL'
  | 'REMAINING'
  | 'INSTALLMENT'
  | 'ADJUSTMENT';

export interface OrderSummary {
  totalPrice: number;
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
  orderId: string;
  amount: number;
  method: PaymentMethod;
  paymentType?: PaymentType;
  status: PaymentStatus;
  description?: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id?: string;
  bookingId: Booking['id'];
  referenceNumber?: string;
  totalPrice: number;
  status: OrderStatus;
  booking?: Booking;
  payments?: Payment[];
  summary?: OrderSummary;
  depositAmount?: number;
  remainingAmount?: number;
  depositPaid?: number;
  remainingPaid?: number;
  createdAt?: string;
  updatedAt?: string;
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
