import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { Order, CheckoutRequest, PayRemainingRequest } from '@types';
import { ordersService } from '@services/OrdersService';

interface UseCheckoutState {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

export const useCheckout = (bookingId: string) => {
  const [state, setState] = useState<UseCheckoutState>({
    order: null,
    loading: false,
    error: null,
  });

  // Load existing order
  const loadOrder = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const order = await ordersService.getOrder(bookingId);
      setState((prev) => ({ ...prev, order, loading: false }));
      return order;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMsg =
        axiosError?.response?.data?.message || 'Failed to load order';
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      return null;
    }
  }, [bookingId]);

  // Create new order or pay deposit
  const checkout = useCallback(async (data: CheckoutRequest) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const order = await ordersService.checkout(data);
      setState((prev) => ({ ...prev, order, loading: false }));
      message.success('Checkout successful!');
      return order;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMsg = axiosError?.response?.data?.message || 'Checkout failed';
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      message.error(errorMsg);
      return null;
    }
  }, []);

  // Pay remaining balance
  const payRemaining = useCallback(
    async (bookingId: string, data: PayRemainingRequest) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const order = await ordersService.payRemaining(bookingId, data);
        setState((prev) => ({ ...prev, order, loading: false }));
        message.success('Payment completed successfully!');
        return order;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const errorMsg =
          axiosError?.response?.data?.message || 'Payment failed';
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
        message.error(errorMsg);
        return null;
      }
    },
    []
  );

  // Get order status
  const getStatus = useCallback(async (bookingId: string) => {
    try {
      return await ordersService.getOrderStatus(bookingId);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMsg =
        axiosError?.response?.data?.message || 'Failed to get order status';
      setState((prev) => ({ ...prev, error: errorMsg }));
      return null;
    }
  }, []);

  // Clear state
  const reset = useCallback(() => {
    setState({ order: null, loading: false, error: null });
  }, []);

  return {
    order: state.order,
    loading: state.loading,
    error: state.error,
    loadOrder,
    checkout,
    payRemaining,
    getStatus,
    reset,
  };
};
