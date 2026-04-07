import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Order, CheckoutRequest, PayRemainingRequest } from '@types';
import { getMutationError } from '@utils/mutationError';
import { ordersService } from '@services/OrdersService';

interface UseCheckoutReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  loadOrder: () => void;
  checkout: (data: CheckoutRequest) => void;
  payRemaining: (data: PayRemainingRequest) => void;
  getStatus: () => void;
  reset: () => void;
}

export const useCheckout = (bookingId: string): UseCheckoutReturn => {
  const queryClient = useQueryClient();

  // Query: load existing order
  const {
    data: orderData,
    isLoading: isLoadingOrder,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ['checkout-order', bookingId],
    queryFn: () => ordersService.getOrder(bookingId),
    enabled: false,
    retry: false,
    staleTime: 15 * 1000, // 15 sec
  });

  // Mutation: checkout / create order
  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => ordersService.checkout(data),
    onError: (error) => {
      console.error('Checkout failed', error);
    },
  });

  // Mutation: pay remaining balance
  const payRemainingMutation = useMutation({
    mutationFn: (data: PayRemainingRequest) =>
      ordersService.payRemaining(bookingId, data),
    onError: (error) => {
      console.error('Payment failed', error);
    },
  });

  const loadOrder = () => {
    void refetchOrder();
  };

  const checkout = (data: CheckoutRequest) => {
    checkoutMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['checkout-order', bookingId],
        });
        void refetchOrder();
      },
    });
  };

  const payRemaining = (data: PayRemainingRequest) => {
    payRemainingMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['checkout-order', bookingId],
        });
        void refetchOrder();
      },
    });
  };

  const getStatus = () => {
    void refetchOrder();
  };

  const reset = () => {
    queryClient.removeQueries({ queryKey: ['checkout-order', bookingId] });
  };

  return {
    order: orderData ?? null,
    loading:
      isLoadingOrder ||
      checkoutMutation.isPending ||
      payRemainingMutation.isPending,
    error: getMutationError(
      checkoutMutation.error ?? payRemainingMutation.error
    ),
    loadOrder,
    checkout,
    payRemaining,
    getStatus,
    reset,
  };
};
