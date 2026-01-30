import { api } from '@/api/client';
import type {
  CheckoutRequest,
  Order,
  PayRemainingRequest,
  QueryOrderParams,
  MomoInitiateResponse,
} from '@types';

export const ordersService = {
  // Checkout: First time (optional deposit) or second time (remaining payment)
  async checkout(data: CheckoutRequest): Promise<Order> {
    const response = await api.post<{ data: Order }>('/orders/checkout', data);
    return response.data.data;
  },

  // Pay remaining balance
  async payRemaining(
    bookingId: string,
    data: Omit<PayRemainingRequest, 'bookingId'>
  ): Promise<Order> {
    const response = await api.post<{ data: Order }>(
      `/orders/${bookingId}/pay-remaining`,
      data
    );
    return response.data.data;
  },

  // Get all orders
  async getOrders(
    params?: QueryOrderParams
  ): Promise<{ data: Order[]; pagination?: Record<string, unknown> }> {
    const response = await api.get<{
      data: { data: Order[]; pagination?: Record<string, unknown> };
    }>('/orders', { params });
    return response.data.data;
  },

  // Get order by booking ID
  async getOrder(bookingId: string): Promise<Order> {
    const response = await api.get<{ data: Order }>(`/orders/${bookingId}`);
    return response.data.data;
  },

  // Alias for getOrder
  async getOrderByBookingId(bookingId: string): Promise<Order> {
    return this.getOrder(bookingId);
  },

  // Get order status
  async getOrderStatus(bookingId: string): Promise<Order> {
    const response = await api.get<{ data: Order }>(
      `/orders/${bookingId}/status`
    );
    return response.data.data;
  },

  // Initiate MOMO payment for E-WALLET
  async initiateMomoPayment(
    bookingId: string,
    paymentId: string
  ): Promise<MomoInitiateResponse> {
    const response = await api.post<{ data: MomoInitiateResponse }>(
      `/orders/${bookingId}/momo/initiate`,
      {
        paymentId,
      }
    );
    return response.data.data;
  },
};
