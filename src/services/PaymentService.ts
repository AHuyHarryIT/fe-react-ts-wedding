import type { StandardResponse } from '@types';
import { api } from '../api/client';

export interface Payment {
  id: string;
  bookingId: string;
  totalAmount: number;
  depositTxnId?: string;
  depositMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  depositStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  depositAmount: number;
  depositNote?: string;
  depositAt?: string;
  remainingTxnId?: string;
  remainingMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  remainingStatus?: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  remainingAmount?: number;
  remainingNote?: string;
  remainingAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  totalAmount: number;
  depositAmount: number;
  depositMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  depositStatus?: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  depositNote?: string;
  depositTxnId?: string;
}

export interface MomoPaymentRequest {
  amount: number;
  bookingId: string;
}

export interface MomoPaymentResponse {
  success: boolean;
  payUrl?: string;
  message: string;
  paymentId: string;
  transId?: number;
}

export const paymentApi = {
  // Create Momo payment
  createMomo: async (
    data: MomoPaymentRequest
  ): Promise<StandardResponse<MomoPaymentResponse>> => {
    const response = await api.post<StandardResponse<MomoPaymentResponse>>(
      '/payments/momo/create',
      data
    );
    return response.data;
  },

  // Create cash payment
  createCash: async (
    bookingId: string,
    amount: number
  ): Promise<StandardResponse<Payment>> => {
    const response = await api.post<StandardResponse<Payment>>('/payments', {
      bookingId,
      totalAmount: amount,
      depositAmount: amount,
      depositMethod: 'CASH',
      depositStatus: 'SUCCESSFUL',
      depositNote: 'Cash payment - to be verified by staff',
    });
    return response.data;
  },
};

export default paymentApi;
