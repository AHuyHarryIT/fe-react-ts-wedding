import type { StandardResponse } from '@types';
import { api } from '../api/client';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  paymentType?: 'DEPOSIT' | 'REMAINING' | 'FULL' | 'INSTALLMENT';
  status:
    | 'PENDING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'CANCELLED'
    | 'ABANDONED'
    | 'REFUNDED';
  description?: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  paymentType?: 'DEPOSIT' | 'REMAINING' | 'FULL' | 'INSTALLMENT';
  description?: string;
  dueDate?: string;
  notes?: string;
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
    orderId: string,
    amount: number
  ): Promise<StandardResponse<Payment>> => {
    const response = await api.post<StandardResponse<Payment>>('/payments', {
      orderId,
      amount,
      method: 'CASH',
      paymentType: 'FULL',
      description: 'Cash payment - to be verified by staff',
    });
    return response.data;
  },
};

export default paymentApi;
