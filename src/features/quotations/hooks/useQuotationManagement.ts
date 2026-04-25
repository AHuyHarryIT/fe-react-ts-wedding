import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { quotationApi } from '@services/QuotationService';
import { serviceApi } from '@services/ServiceService';
import { packageApi } from '@services/PackageService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Quotation,
  QuotationSelectedItem,
  CreateQuotationItemInput,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationStatus,
} from '@/types/quotation';
import type { Service } from '@/types/service';
import { getErrorMessage } from '@utils/error';
import { Form, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QuotationActionState {
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  sendReason: string | null;
  acceptReason: string | null;
  rejectReason: string | null;
  convertReason: string | null;
}

interface QuotationActionPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSend: boolean;
  canAccept: boolean;
  canReject: boolean;
  canConvert: boolean;
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  sendReason: string | null;
  acceptReason: string | null;
  rejectReason: string | null;
  convertReason: string | null;
}

const INITIAL_QUOTATION_ACTION_STATE: QuotationActionState = {
  createReason: null,
  updateReason: null,
  deleteReason: null,
  sendReason: null,
  acceptReason: null,
  rejectReason: null,
  convertReason: null,
};

const mapSelectedItemToCreateInput = (
  item: QuotationSelectedItem
): CreateQuotationItemInput => ({
  itemType: item.type,
  itemId: item.id,
  quantity: item.quantity,
  unitPrice: item.price,
  notes: item.notes,
});

const mapQuotationItemToSelectedItem = (
  item: NonNullable<Quotation['items']>[number]
): QuotationSelectedItem => {
  if (item.itemType === 'service') {
    return {
      id: item.service?.id ?? item.itemId,
      type: 'service',
      name: item.service?.name ?? item.itemName,
      price: item.unitPrice,
      quantity: item.quantity,
      notes: item.notes,
    };
  }

  if (item.itemType === 'package') {
    return {
      id: item.package?.id ?? item.itemId,
      type: 'package',
      name: item.package?.name ?? item.itemName,
      price: item.unitPrice,
      quantity: item.quantity,
      notes: item.notes,
    };
  }

  return {
    id: item.inventoryItem?.id ?? item.itemId,
    type: 'inventory',
    name: item.inventoryItem?.name ?? item.itemName,
    price: item.unitPrice,
    quantity: item.quantity,
    notes: item.notes,
  };
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
    QuotationSelectedItem[]
  >([]);
  const [editSelectedItems, setEditSelectedItems] = useState<
    QuotationSelectedItem[]
  >([]);
  const [actionState, setActionState] = useState<QuotationActionState>(
    INITIAL_QUOTATION_ACTION_STATE
  );

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

  const quotationActionState: QuotationActionPermissions = {
    canCreate: actionState.createReason === null,
    canUpdate: actionState.updateReason === null,
    canDelete: actionState.deleteReason === null,
    canSend: actionState.sendReason === null,
    canAccept: actionState.acceptReason === null,
    canReject: actionState.rejectReason === null,
    canConvert: actionState.convertReason === null,
    createReason: actionState.createReason,
    updateReason: actionState.updateReason,
    deleteReason: actionState.deleteReason,
    sendReason: actionState.sendReason,
    acceptReason: actionState.acceptReason,
    rejectReason: actionState.rejectReason,
    convertReason: actionState.convertReason,
  };

  const applyForbiddenReason = (
    error: unknown,
    key: keyof QuotationActionState
  ): boolean => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const reason = buildForbiddenReason(error);
    setActionState((prev) => ({
      ...prev,
      [key]: reason,
    }));
    messageApi.warning(reason);

    return true;
  };

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
    mutationFn: (payload: CreateQuotationRequest) =>
      quotationApi.create(payload),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, createReason: null }));
      messageApi.success('Quotation created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      setCreateSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to create quotation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationApi.update(id, data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, updateReason: null }));
      messageApi.success('Quotation updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      setEditSelectedItems([]);
      setSelectedQuotation(null);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to update quotation');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotationApi.delete,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, deleteReason: null }));
      messageApi.success('Quotation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to delete quotation');
    },
  });

  const sendMutation = useMutation({
    mutationFn: quotationApi.send,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, sendReason: null }));
      messageApi.success('Quotation sent');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'sendReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to send quotation');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: quotationApi.accept,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, acceptReason: null }));
      messageApi.success('Quotation accepted');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'acceptReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to accept quotation');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: quotationApi.reject,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, rejectReason: null }));
      messageApi.success('Quotation rejected');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'rejectReason')) {
        return;
      }
      messageApi.error(getErrorMessage(error) || 'Failed to reject quotation');
    },
  });

  const convertMutation = useMutation({
    mutationFn: quotationApi.convertToBooking,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, convertReason: null }));
      messageApi.success('Quotation converted to booking');
      setIsDetailDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'convertReason')) {
        return;
      }
      messageApi.error(
        getErrorMessage(error) || 'Failed to convert quotation to booking'
      );
    },
  });

  const handleCreate = useCallback(
    (values: CreateQuotationRequest) => {
      if (!quotationActionState.canCreate) {
        messageApi.warning(actionState.createReason || 'Action is not allowed');
        return;
      }

      const items = createSelectedItems.map(mapSelectedItemToCreateInput);

      createMutation.mutate({
        ...values,
        items,
      });
    },
    [
      actionState.createReason,
      createMutation,
      createSelectedItems,
      messageApi,
      quotationActionState.canCreate,
    ]
  );

  const handleEdit = useCallback(
    (values: UpdateQuotationRequest) => {
      if (!quotationActionState.canUpdate) {
        messageApi.warning(actionState.updateReason || 'Action is not allowed');
        return;
      }

      const id = selectedQuotation?.id;
      if (!id) return;

      const items = editSelectedItems.map(mapSelectedItemToCreateInput);

      updateMutation.mutate({
        id,
        data: { ...values, items },
      });
    },
    [
      actionState.updateReason,
      editSelectedItems,
      messageApi,
      quotationActionState.canUpdate,
      selectedQuotation,
      updateMutation,
    ]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!quotationActionState.canDelete) {
        messageApi.warning(actionState.deleteReason || 'Action is not allowed');
        return;
      }

      deleteMutation.mutate(id);
    },
    [
      actionState.deleteReason,
      deleteMutation,
      messageApi,
      quotationActionState.canDelete,
    ]
  );

  const handleOpenEdit = useCallback(
    (quotation: Quotation) => {
      if (!quotationActionState.canUpdate) {
        messageApi.warning(actionState.updateReason || 'Action is not allowed');
        return;
      }

      setSelectedQuotation(quotation);
      setEditSelectedItems(
        (quotation.items ?? []).map(mapQuotationItemToSelectedItem)
      );
      editForm.setFieldsValue({
        title: quotation.title,
        customerId: quotation.customer?.id ?? quotation.customerId,
        notes: quotation.notes,
        validUntil: quotation.validUntil,
        discountPercent: quotation.discountPercent,
        taxPercent: quotation.taxPercent,
      });
      setIsEditModalOpen(true);
    },
    [
      actionState.updateReason,
      editForm,
      messageApi,
      quotationActionState.canUpdate,
    ]
  );

  const handleOpenCreateModal = useCallback(() => {
    if (!quotationActionState.canCreate) {
      messageApi.warning(actionState.createReason || 'Action is not allowed');
      return;
    }

    setIsCreateModalOpen(true);
  }, [actionState.createReason, messageApi, quotationActionState.canCreate]);

  const handleSetCreateModalOpen = useCallback(
    (open: boolean) => {
      if (open) {
        handleOpenCreateModal();
        return;
      }

      setIsCreateModalOpen(false);
    },
    [handleOpenCreateModal]
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

  const handleAddCreateItem = useCallback((item: QuotationSelectedItem) => {
    setCreateSelectedItems((prev) => {
      const existing = prev.find(
        (candidate) => candidate.id === item.id && candidate.type === item.type
      );

      if (!existing) {
        return [...prev, item];
      }

      return prev.map((candidate) =>
        candidate.id === item.id && candidate.type === item.type
          ? { ...candidate, quantity: candidate.quantity + item.quantity }
          : candidate
      );
    });
  }, []);

  const handleRemoveCreateItem = useCallback(
    (id: string, type: QuotationSelectedItem['type']) => {
      setCreateSelectedItems((prev) =>
        prev.filter((item) => !(item.id === id && item.type === type))
      );
    },
    []
  );

  const handleAddEditItem = useCallback((item: QuotationSelectedItem) => {
    setEditSelectedItems((prev) => {
      const existing = prev.find(
        (candidate) => candidate.id === item.id && candidate.type === item.type
      );

      if (!existing) {
        return [...prev, item];
      }

      return prev.map((candidate) =>
        candidate.id === item.id && candidate.type === item.type
          ? { ...candidate, quantity: candidate.quantity + item.quantity }
          : candidate
      );
    });
  }, []);

  const handleRemoveEditItem = useCallback(
    (id: string, type: QuotationSelectedItem['type']) => {
      setEditSelectedItems((prev) =>
        prev.filter((item) => !(item.id === id && item.type === type))
      );
    },
    []
  );

  const handleUpdateCreateItemQuantity = useCallback(
    (id: string, type: QuotationSelectedItem['type'], quantity: number) => {
      setCreateSelectedItems((prev) =>
        prev.map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    },
    []
  );

  const handleUpdateEditItemQuantity = useCallback(
    (id: string, type: QuotationSelectedItem['type'], quantity: number) => {
      setEditSelectedItems((prev) =>
        prev.map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    },
    []
  );

  const calculateCreateSubtotal = useCallback(
    () =>
      createSelectedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
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
        (sum, item) => sum + item.price * item.quantity,
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
      if (!quotationActionState.canSend) {
        messageApi.warning(actionState.sendReason || 'Action is not allowed');
        return;
      }

      sendMutation.mutate(id);
    },
    [
      actionState.sendReason,
      messageApi,
      quotationActionState.canSend,
      sendMutation,
    ]
  );

  const handleAccept = useCallback(
    (id: string) => {
      if (!quotationActionState.canAccept) {
        messageApi.warning(actionState.acceptReason || 'Action is not allowed');
        return;
      }

      acceptMutation.mutate(id);
    },
    [
      acceptMutation,
      actionState.acceptReason,
      messageApi,
      quotationActionState.canAccept,
    ]
  );

  const handleReject = useCallback(
    (id: string) => {
      if (!quotationActionState.canReject) {
        messageApi.warning(actionState.rejectReason || 'Action is not allowed');
        return;
      }

      rejectMutation.mutate(id);
    },
    [
      actionState.rejectReason,
      messageApi,
      quotationActionState.canReject,
      rejectMutation,
    ]
  );

  const handleConvertToBooking = useCallback(
    (id: string) => {
      if (!quotationActionState.canConvert) {
        messageApi.warning(
          actionState.convertReason || 'Action is not allowed'
        );
        return;
      }

      convertMutation.mutate(id);
    },
    [
      actionState.convertReason,
      convertMutation,
      messageApi,
      quotationActionState.canConvert,
    ]
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
    quotationActionState,
    setActiveStatusFilter,
    setIsCreateModalOpen: handleSetCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    serviceList,
    packageList,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenCreateModal,
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
