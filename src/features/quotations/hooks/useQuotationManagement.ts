import { quotationApi } from '@services/QuotationService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationStatus,
} from '@/types/quotation';

export interface UseQuotationManagementReturn {
  quotations: Quotation[];
  total: number;
  page: number;
  limit: number;
  setFilter: (filter: string) => void;
  setSelectedQuotation: (quot: Quotation | null) => void;
  setEditingQuotation: (id: string | null) => void;
  selectedQuotation: Quotation | null;
  loading: boolean;
  deleteMutation: {
    mutate: (id: string) => void;
    isPending: boolean;
  };
  createMutation: {
    mutate: (data: CreateQuotationRequest) => void;
    isPending: boolean;
  };
  updateMutation: {
    mutate: (args: { id: string; data: UpdateQuotationRequest }) => void;
    isPending: boolean;
  };
  sendMutation: {
    mutate: (id: string) => void;
    isPending: boolean;
  };
  acceptMutation: {
    mutate: (id: string) => void;
    isPending: boolean;
  };
  rejectMutation: {
    mutate: (id: string) => void;
    isPending: boolean;
  };
  convertMutation: {
    mutate: (id: string) => void;
    isPending: boolean;
  };
}

export function useQuotationManagement(
  params: {
    status?: QuotationStatus;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): UseQuotationManagementReturn {
  const { page = 1, limit = 20, status, search } = params;
  const queryClient = useQueryClient();

  // State management (simplified for hooks)
  const queryFilters: Record<string, unknown> = { page, limit };
  if (status) queryFilters.status = status;
  if (search) queryFilters.search = search;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['quotations', queryFilters],
    queryFn: () => quotationApi.getAll(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: (data: CreateQuotationRequest) => quotationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateQuotationRequest) => quotationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => quotationApi.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => quotationApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => quotationApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => quotationApi.convertToBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  return {
    quotations: data?.data?.data ?? [],
    total: data?.data?.total ?? 0,
    page,
    limit,
    setFilter: () => {
      /* handled by parent */
    },
    setSelectedQuotation: () => {
      /* handled by parent */
    },
    setEditingQuotation: () => {
      /* handled by parent */
    },
    selectedQuotation: null,
    loading: isLoading || isFetching,
    deleteMutation: {
      mutate: deleteMutation.mutate,
      isPending: deleteMutation.isPending,
    },
    createMutation: {
      mutate: createMutation.mutate,
      isPending: createMutation.isPending,
    },
    updateMutation: {
      mutate: updateMutation.mutate,
      isPending: updateMutation.isPending,
    },
    sendMutation: {
      mutate: sendMutation.mutate,
      isPending: sendMutation.isPending,
    },
    acceptMutation: {
      mutate: acceptMutation.mutate,
      isPending: acceptMutation.isPending,
    },
    rejectMutation: {
      mutate: rejectMutation.mutate,
      isPending: rejectMutation.isPending,
    },
    convertMutation: {
      mutate: convertMutation.mutate,
      isPending: convertMutation.isPending,
    },
  };
}

export function useQuotationDetail(id: string) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationApi.getOne(id),
    enabled: !!id,
  });
}

export function useQuotationServiceSelect() {
  return useQuery({
    queryKey: ['services-select'],
    queryFn: () => quotationApi.getServices(),
  });
}
