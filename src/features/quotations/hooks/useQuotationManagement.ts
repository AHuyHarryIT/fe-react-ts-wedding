import { quotationApi } from '@services/QuotationService';
import { serviceApi } from '@services/ServiceService';
import { packageApi } from '@services/PackageService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Quotation,
  QuotationItem,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationStatus,
} from '@/types/quotation';
import type { Service } from '@/types/service';
import { getErrorMessage } from '@utils/error';
import { Form, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CreateQuotationItem = {
  id: string;
  type: 'service' | 'package';
  name: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  description?: string;
};

export function useQuotationManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [detailQuotation, setDetailQuotation] = useState<Quotation | null>(
    null
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    QuotationStatus | 'ALL'
  >('ALL');
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [createSelectedItems, setCreateSelectedItems] = useState<
    CreateQuotationItem[]
  >([]);
  const [editSelectedItems, setEditSelectedItems] = useState<
    CreateQuotationItem[]
  >([]);

  const { data: servicesData } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: async () => await serviceApi.getAll({ limit: 500 }),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: async () => await packageApi.getAll({ limit: 500 }),
  });

  const serviceList = useMemo(
    () =>
      (servicesData?.data ?? [])?.map((s: Service) => ({
        id: s.id,
        type: 'service' as const,
        name: s.name,
        unitPrice: s.price ?? 0,
      })) ?? [],
    [servicesData]
  );

  const packageList = useMemo(
    () =>
      (packagesData?.data ?? [])?.map((p) => ({
        id: p.id,
        type: 'package' as const,
        name: p.name,
        unitPrice: p.price ?? 0,
      })) ?? [],
    [packagesData]
  );

  const queryClient = useQueryClient();

  const { data, isLoading: quotationsLoading } = useQuery({
    queryKey: [
      'quotations',
      {
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        status: activeStatusFilter === 'ALL' ? undefined : activeStatusFilter,
      },
    ],
    queryFn: () =>
      quotationApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        status: activeStatusFilter === 'ALL' ? undefined : activeStatusFilter,
      }),
  });

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ['quotation', selectedQuotation?.id],
    queryFn: () => quotationApi.getOne(selectedQuotation!.id),
    enabled: !!selectedQuotation?.id,
  });

  useEffect(() => {
    if (detailData?.data) {
      setDetailQuotation(detailData.data);
    }
  }, [detailData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateQuotationRequest) => quotationApi.create(data),
    onSuccess: () => {
      messageApi.success('Quotation created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      setCreateSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to create quotation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Quotation updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      setEditSelectedItems([]);
      setSelectedQuotation(null);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to update quotation');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotationApi.delete,
    onSuccess: () => {
      messageApi.success('Quotation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: () => {
      messageApi.error('Failed to delete quotation');
    },
  });

  const sendMutation = useMutation({
    mutationFn: quotationApi.send,
    onSuccess: () => {
      messageApi.success('Quotation sent');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: () => {
      messageApi.error('Failed to send quotation');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: quotationApi.accept,
    onSuccess: () => {
      messageApi.success('Quotation accepted');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: () => {
      messageApi.error('Failed to accept quotation');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: quotationApi.reject,
    onSuccess: () => {
      messageApi.success('Quotation rejected');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: () => {
      messageApi.error('Failed to reject quotation');
    },
  });

  const convertMutation = useMutation({
    mutationFn: quotationApi.convertToBooking,
    onSuccess: () => {
      messageApi.success('Quotation converted to booking');
      setIsDetailDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: () => {
      messageApi.error('Failed to convert quotation to booking');
    },
  });

  const handleCreate = useCallback(
    (values: CreateQuotationRequest) => {
      const items: QuotationItem[] = createSelectedItems.map(
        ({ id, unitPrice, quantity, discountPercent }) => ({
          id,
          unitPrice,
          quantity,
          discountPercent,
        })
      );
      createMutation.mutate({
        ...values,
        items,
      } as unknown as CreateQuotationRequest);
    },
    [createMutation, createSelectedItems]
  );

  const handleEdit = useCallback(
    (values: UpdateQuotationRequest) => {
      const id = selectedQuotation?.id;
      if (!id) return;
      const items: QuotationItem[] = editSelectedItems.map(
        ({ id: itemId, unitPrice, quantity, discountPercent }) => ({
          id: itemId,
          unitPrice,
          quantity,
          discountPercent,
        })
      );
      updateMutation.mutate({
        id,
        data: { ...values, items } as unknown as QuotationItem[],
      });
    },
    [updateMutation, editSelectedItems, selectedQuotation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleOpenEdit = useCallback(
    (quotation: Quotation) => {
      setSelectedQuotation(quotation);
      setEditSelectedItems(
        (quotation.items ?? []).map((item) => {
          // Handle service items
          if (item.itemType === 'service' && item.service) {
            return {
              id: item.service.id,
              type: 'service' as const,
              name: item.service.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              discountPercent: item.discountPercent,
              description: item.notes ?? '',
            };
          }
          // Handle package items
          if (item.itemType === 'package' && item.package) {
            return {
              id: item.package.id,
              type: 'package' as const,
              name: item.package.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              discountPercent: item.discountPercent,
              description: item.notes ?? '',
            };
          }
          // Fallback for inventory or missing relations
          return {
            id: item.itemId,
            type:
              item.itemType === 'inventory'
                ? 'service'
                : (item.itemType as 'service' | 'package'),
            name: item.itemName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            discountPercent: item.discountPercent,
            description: item.notes ?? '',
          };
        })
      );
      editForm.setFieldsValue({
        title: quotation.title,
        customerId: quotation.customer?.id,
        notes: quotation.notes,
      });
      setIsEditModalOpen(true);
    },
    [editForm]
  );

  const handleViewQuotation = useCallback((quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
    setCreateSelectedItems([]);
  }, [createForm]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedQuotation(null);
    setEditSelectedItems([]);
  }, [editForm]);

  const handleCloseDetailDrawer = useCallback(() => {
    setIsDetailDrawerOpen(false);
    setDetailQuotation(null);
  }, []);

  const handleAddCreateItem = useCallback(
    (item: {
      id: string;
      type: 'service' | 'package';
      name: string;
      unitPrice: number;
    }) => {
      setCreateSelectedItems((prev) => [
        ...prev,
        {
          ...item,
          quantity: 1,
          discountPercent: 0,
          description: '',
        },
      ]);
    },
    []
  );

  const handleRemoveCreateItem = useCallback((id: string) => {
    setCreateSelectedItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleAddEditItem = useCallback(
    (item: {
      id: string;
      type: 'service' | 'package';
      name: string;
      unitPrice: number;
    }) => {
      setEditSelectedItems((prev) => [
        ...prev,
        {
          ...item,
          quantity: 1,
          discountPercent: 0,
          description: '',
        },
      ]);
    },
    []
  );

  const handleRemoveEditItem = useCallback((id: string) => {
    setEditSelectedItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleUpdateCreateItemQuantity = useCallback(
    (id: string, field: 'quantity' | 'discountPercent', value: number) => {
      setCreateSelectedItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, [field]: Math.max(0, value) } : i
        )
      );
    },
    []
  );

  const handleUpdateEditItemQuantity = useCallback(
    (id: string, field: 'quantity' | 'discountPercent', value: number) => {
      setEditSelectedItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, [field]: Math.max(0, value) } : i
        )
      );
    },
    []
  );

  const calculateCreateSubtotal = useCallback(
    () =>
      createSelectedItems.reduce(
        (sum, i) =>
          sum + i.unitPrice * i.quantity * (1 - i.discountPercent / 100),
        0
      ),
    [createSelectedItems]
  );

  const calculateCreateTotal = useCallback(
    () => calculateCreateSubtotal(),
    [calculateCreateSubtotal]
  );

  const calculateEditSubtotal = useCallback(
    () =>
      editSelectedItems.reduce(
        (sum, i) =>
          sum + i.unitPrice * i.quantity * (1 - i.discountPercent / 100),
        0
      ),
    [editSelectedItems]
  );

  const calculateEditTotal = useCallback(
    () => calculateEditSubtotal(),
    [calculateEditSubtotal]
  );

  const handleSend = useCallback(
    (id: string) => {
      sendMutation.mutate(id);
    },
    [sendMutation]
  );

  const handleAccept = useCallback(
    (id: string) => {
      acceptMutation.mutate(id);
    },
    [acceptMutation]
  );

  const handleReject = useCallback(
    (id: string) => {
      rejectMutation.mutate(id);
    },
    [rejectMutation]
  );

  const handleConvertToBooking = useCallback(
    (id: string) => {
      convertMutation.mutate(id);
    },
    [convertMutation]
  );

  return {
    quotations: (data?.data ?? []) as Quotation[],
    loading: quotationsLoading,
    loadingDetail,
    total: data?.pagination?.total ?? 0,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    detailQuotation,
    selectedQuotation,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    createSelectedItems,
    editSelectedItems,
    isDetailDrawerOpen,
    activeStatusFilter,
    setActiveStatusFilter,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    serviceList,
    packageList,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleViewQuotation,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailDrawer,
    handleAddCreateItem,
    handleRemoveCreateItem,
    handleAddEditItem,
    handleRemoveEditItem,
    calculateCreateSubtotal,
    calculateEditSubtotal,
    calculateCreateTotal,
    calculateEditTotal,
    handleUpdateCreateItemQuantity,
    handleUpdateEditItemQuantity,
    handleSend,
    handleAccept,
    handleReject,
    handleConvertToBooking,
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
