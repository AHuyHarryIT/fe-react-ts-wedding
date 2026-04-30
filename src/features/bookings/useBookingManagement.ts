import { bookingApi } from '@services/BookingService';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Booking,
  BookingFormData,
  BookingSelectedItem,
  BookingStaffAssignmentInput,
  BookingStaffConflictDetails,
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@types';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';

type StaffAssignmentSubmitOptions = {
  allowConflictOverride?: boolean;
  overrideReason?: string;
};

type PendingStaffAssignmentContext = {
  mode: 'create' | 'edit';
  bookingId: string;
  staffAssignments: BookingStaffAssignmentInput[];
};

type AssignmentConflictUiState = {
  activeMode: 'create' | 'edit';
  hasConflict: true;
  message: string;
  details: BookingStaffConflictDetails;
  requiresOverride: boolean;
  requiredPermission: string | null;
  allowConflictOverride: boolean;
  canToggleOverride: boolean;
  overrideReason: string;
  overrideReasonLength: number;
  canRetryWithOverride: boolean;
  retryBlockedReason: string | null;
  isRetryPending: boolean;
  hasPendingAssignment: boolean;
  onToggleOverride: (enabled: boolean) => void;
  onReasonChange: (value: string) => void;
  onRetryWithOverride: () => Promise<void>;
  onClear: () => void;
};

const extractStaffConflictDetails = (
  error: unknown
): BookingStaffConflictDetails | null => {
  const payload = (
    error as {
      response?: {
        data?: {
          code?: string;
          details?: unknown;
          error?: {
            code?: string;
            details?: unknown;
          };
        };
      };
    }
  )?.response?.data;

  const code = payload?.code ?? payload?.error?.code;
  if (code !== 'BOOKING_STAFF_CONFLICT') {
    return null;
  }

  const details = payload?.details ?? payload?.error?.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return null;
  }

  const detailObject = details as {
    conflicts?: unknown;
    requiresOverride?: unknown;
    requiredPermission?: unknown;
  };

  return {
    conflicts: Array.isArray(detailObject.conflicts)
      ? (detailObject.conflicts as BookingStaffConflictDetails['conflicts'])
      : [],
    requiresOverride:
      typeof detailObject.requiresOverride === 'boolean'
        ? detailObject.requiresOverride
        : undefined,
    requiredPermission:
      typeof detailObject.requiredPermission === 'string'
        ? detailObject.requiredPermission
        : undefined,
  };
};

export function useBookingManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<BookingFormData>();
  const [editForm] = Form.useForm<BookingFormData>();

  const [isCreateModalOpen, setIsCreateModalOpenRaw] = useState(false);
  const [isEditModalOpen, setIsEditModalOpenRaw] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [bookingActionState, setBookingActionState] = useState<{
    createReason: string | null;
    updateReason: string | null;
    deleteReason: string | null;
    cancelReason: string | null;
    completeReason: string | null;
  }>({
    createReason: null,
    updateReason: null,
    deleteReason: null,
    cancelReason: null,
    completeReason: null,
  });

  const [assignmentConflictDetails, setAssignmentConflictDetails] =
    useState<BookingStaffConflictDetails | null>(null);
  const [allowConflictOverride, setAllowConflictOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideBlockedReason, setOverrideBlockedReason] = useState<
    string | null
  >(null);
  const [pendingStaffAssignment, setPendingStaffAssignment] =
    useState<PendingStaffAssignmentContext | null>(null);

  const applyForbiddenReason = (
    error: unknown,
    key:
      | 'createReason'
      | 'updateReason'
      | 'deleteReason'
      | 'cancelReason'
      | 'completeReason'
  ) => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const context = extractPermissionContext(error);
    const reason = buildForbiddenReason(error);

    setBookingActionState((prev) => ({
      ...prev,
      [key]: reason,
    }));

    messageApi.warning(reason);
    return context !== null || reason.length > 0;
  };

  const resetAssignmentConflictState = () => {
    setAssignmentConflictDetails(null);
    setAllowConflictOverride(false);
    setOverrideReason('');
    setOverrideBlockedReason(null);
    setPendingStaffAssignment(null);
  };

  // Bulk selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<readonly string[]>([]);

  // Selected items state for create and edit
  const [createSelectedItems, setCreateSelectedItems] = useState<
    BookingSelectedItem[]
  >([]);
  const [editSelectedItems, setEditSelectedItems] = useState<
    BookingSelectedItem[]
  >([]);

  // Queries
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', currentPage, pageSize, searchText],
    queryFn: () =>
      bookingApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        includeCustomer: true,
        includePackage: true,
        includePackages: true,
        includeServices: true,
        includeOrders: true,
      }),
  });

  // Query for individual booking detail
  const {
    data: bookingDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['booking-detail-management', selectedBooking?.id],
    queryFn: () => bookingApi.getOne(selectedBooking!.id),
    enabled: !!selectedBooking?.id,
    staleTime: 0,
    retry: false,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingApi.delete(id),
    onSuccess: () => {
      messageApi.success('Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete booking';
      messageApi.error(errorMessage);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = [];
      for (const id of ids) {
        const result = await bookingApi.delete(id);
        results.push(result);
      }
      return results;
    },
    onSuccess: (_data, ids) => {
      messageApi.success(`Successfully deleted ${ids.length} booking(s)`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete bookings';
      messageApi.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create booking';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) =>
      bookingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update booking';
      messageApi.error(errorMessage);
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: ({
      id,
      staffAssignments,
      options,
    }: {
      id: string;
      staffAssignments: BookingStaffAssignmentInput[];
      options?: StaffAssignmentSubmitOptions;
    }) =>
      bookingApi.assignStaff(id, {
        staffAssignments,
        allowConflictOverride:
          options?.allowConflictOverride === true ? true : undefined,
        overrideReason:
          options?.allowConflictOverride === true
            ? options?.overrideReason
            : undefined,
      }),
    retry: false,
  });

  const submitStaffAssignments = async (
    context: PendingStaffAssignmentContext,
    options?: StaffAssignmentSubmitOptions
  ): Promise<boolean> => {
    try {
      await assignStaffMutation.mutateAsync({
        id: context.bookingId,
        staffAssignments: context.staffAssignments,
        options,
      });

      resetAssignmentConflictState();
      return true;
    } catch (error) {
      const conflictDetails = extractStaffConflictDetails(error);
      if (conflictDetails) {
        setAssignmentConflictDetails(conflictDetails);
        setPendingStaffAssignment(context);
        if (!options?.allowConflictOverride) {
          setAllowConflictOverride(false);
          setOverrideReason('');
          setOverrideBlockedReason(null);
        }

        return false;
      }

      if (isPermissionDeniedError(error)) {
        const reason = buildForbiddenReason(error);
        if (options?.allowConflictOverride) {
          setOverrideBlockedReason(reason);
          setAllowConflictOverride(false);
          messageApi.warning(reason);
          return false;
        }

        applyForbiddenReason(error, 'updateReason');
        return false;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to assign staff for booking';
      messageApi.error(errorMessage);
      return false;
    }
  };

  const completeCreateFlow = () => {
    messageApi.success('Booking created successfully');
    setIsCreateModalOpenRaw(false);
    createForm.resetFields();
    setCreateSelectedItems([]);
    resetAssignmentConflictState();
  };

  const completeEditFlow = () => {
    messageApi.success('Booking updated successfully');
    setIsEditModalOpenRaw(false);
    setSelectedBooking(null);
    editForm.resetFields();
    setEditSelectedItems([]);
    resetAssignmentConflictState();
  };

  // Calculate total price for create
  const calculateCreateTotalPrice = (): number => {
    return createSelectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // Calculate total price for edit
  const calculateEditTotalPrice = (): number => {
    return editSelectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // Add item to selected items (create)
  const handleAddCreateItem = (item: BookingSelectedItem) => {
    setCreateSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id && i.type === item.type)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Remove item from selected items (create)
  const handleRemoveCreateItem = (
    itemId: string,
    type: 'package' | 'service'
  ) => {
    setCreateSelectedItems((prev) =>
      prev.filter((item) => !(item.id === itemId && item.type === type))
    );
  };

  // Add item to selected items (edit)
  const handleAddEditItem = (item: BookingSelectedItem) => {
    setEditSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id && i.type === item.type)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Remove item from selected items (edit)
  const handleRemoveEditItem = (
    itemId: string,
    type: 'package' | 'service'
  ) => {
    setEditSelectedItems((prev) =>
      prev.filter((item) => !(item.id === itemId && item.type === type))
    );
  };

  // Update item quantity (create)
  const handleUpdateCreateItemQuantity = (
    itemId: string,
    type: 'package' | 'service',
    quantity: number
  ) => {
    setCreateSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.type === type ? { ...item, quantity } : item
      )
    );
  };

  // Update item quantity (edit)
  const handleUpdateEditItemQuantity = (
    itemId: string,
    type: 'package' | 'service',
    quantity: number
  ) => {
    setEditSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.type === type ? { ...item, quantity } : item
      )
    );
  };

  const handleCreate = async (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => {
    if (bookingActionState.createReason) {
      messageApi.warning(bookingActionState.createReason);
      return;
    }

    if (createSelectedItems.length === 0) {
      messageApi.error('Please select at least 1 package or service');
      return;
    }

    const bookingData: CreateBookingRequest = {
      customerId: values.customerId,
      packageIds: createSelectedItems
        .filter((item) => item.type === 'package')
        .map((item) => item.id),
      serviceIds: createSelectedItems
        .filter((item) => item.type === 'service')
        .map((item) => item.id),
      notes: values.notes,
      eventDate: values.eventDate,
      totalPrice: calculateCreateTotalPrice(),
      status: values.status,
    };

    const createResponse = await createMutation.mutateAsync(bookingData);

    if (!staffAssignments?.length) {
      completeCreateFlow();
      return;
    }

    const assigned = await submitStaffAssignments({
      mode: 'create',
      bookingId: createResponse.data.id,
      staffAssignments,
    });

    if (assigned) {
      completeCreateFlow();
    }
  };

  const handleEdit = async (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => {
    if (!selectedBooking) return;

    if (bookingActionState.updateReason) {
      messageApi.warning(bookingActionState.updateReason);
      return;
    }

    if (editSelectedItems.length === 0) {
      messageApi.error('Please select at least 1 package or service');
      return;
    }

    const updateData: UpdateBookingRequest = {
      customerId: values.customerId,
      packageIds: editSelectedItems
        .filter((item) => item.type === 'package')
        .map((item) => item.id),
      serviceIds: editSelectedItems
        .filter((item) => item.type === 'service')
        .map((item) => item.id),
      notes: values.notes,
      eventDate: values.eventDate,
      totalPrice: calculateEditTotalPrice(),
      status: values.status,
    };

    await updateMutation.mutateAsync({
      id: selectedBooking.id,
      data: updateData,
    });

    if (!staffAssignments?.length) {
      completeEditFlow();
      return;
    }

    const assigned = await submitStaffAssignments({
      mode: 'edit',
      bookingId: selectedBooking.id,
      staffAssignments,
    });

    if (assigned) {
      completeEditFlow();
    }
  };

  const handleToggleConflictOverride = (enabled: boolean) => {
    setAllowConflictOverride(enabled);
    if (!enabled) {
      setOverrideReason('');
      setOverrideBlockedReason(null);
    }
  };

  const handleOverrideReasonChange = (value: string) => {
    setOverrideReason(value);
    if (overrideBlockedReason) {
      setOverrideBlockedReason(null);
    }
  };

  const handleRetryAssignmentWithOverride = async () => {
    if (!pendingStaffAssignment) {
      return;
    }

    if (!allowConflictOverride) {
      messageApi.warning('Enable conflict override before retrying save.');
      return;
    }

    const reason = overrideReason.trim();
    if (!reason) {
      messageApi.warning('Override reason is required to continue.');
      return;
    }

    const mode = pendingStaffAssignment.mode;
    const assigned = await submitStaffAssignments(pendingStaffAssignment, {
      allowConflictOverride: true,
      overrideReason: reason,
    });

    if (!assigned) {
      return;
    }

    if (mode === 'create') {
      completeCreateFlow();
      return;
    }

    completeEditFlow();
  };

  const isCreateAssigning =
    createMutation.isPending ||
    (assignStaffMutation.isPending &&
      pendingStaffAssignment?.mode === 'create');
  const isEditAssigning =
    updateMutation.isPending ||
    (assignStaffMutation.isPending && pendingStaffAssignment?.mode === 'edit');

  const buildConflictUiState = (
    mode: 'create' | 'edit'
  ): AssignmentConflictUiState | null => {
    if (!assignmentConflictDetails || pendingStaffAssignment?.mode !== mode) {
      return null;
    }

    const canRetryWithOverride =
      allowConflictOverride && overrideReason.trim().length > 0;

    return {
      activeMode: mode,
      hasConflict: true,
      message:
        'Overlapping assignments detected. Review conflicts and provide override reason to continue.',
      details: assignmentConflictDetails,
      requiresOverride: assignmentConflictDetails.requiresOverride === true,
      requiredPermission: assignmentConflictDetails.requiredPermission ?? null,
      allowConflictOverride,
      canToggleOverride: overrideBlockedReason === null,
      overrideReason,
      overrideReasonLength: overrideReason.trim().length,
      canRetryWithOverride,
      retryBlockedReason: overrideBlockedReason,
      isRetryPending: assignStaffMutation.isPending,
      hasPendingAssignment: pendingStaffAssignment !== null,
      onToggleOverride: handleToggleConflictOverride,
      onReasonChange: handleOverrideReasonChange,
      onRetryWithOverride: handleRetryAssignmentWithOverride,
      onClear: resetAssignmentConflictState,
    };
  };

  const createAssignmentConflictState = buildConflictUiState('create');
  const editAssignmentConflictState = buildConflictUiState('edit');

  const handleDelete = (id: string) => {
    if (bookingActionState.deleteReason) {
      messageApi.warning(bookingActionState.deleteReason);
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (bookingActionState.deleteReason) {
      messageApi.warning(bookingActionState.deleteReason);
      return;
    }

    bulkDeleteMutation.mutate(ids);
  };

  const handleOpenEdit = (booking: Booking) => {
    resetAssignmentConflictState();
    setSelectedBooking(booking);
    setIsLoadingBooking(true);
  };

  const handleOpenCreateModal = () => {
    resetAssignmentConflictState();
    setIsCreateModalOpenRaw(true);
  };

  // React to booking detail query result to populate edit form
  useEffect(() => {
    if (!bookingDetail || isLoadingDetail || isDetailError) return;

    const freshBooking = bookingDetail.data;
    const items: BookingSelectedItem[] = [];

    if (freshBooking.packages && freshBooking.packages.length > 0) {
      freshBooking.packages.forEach((bp) => {
        if (bp.package) {
          items.push({
            id: bp.package.id,
            type: 'package',
            name: bp.package.name,
            price: bp.price || bp.package.price || 0,
            quantity: bp.quantity || 1,
          });
        }
      });
    }

    if (freshBooking.services && freshBooking.services.length > 0) {
      freshBooking.services.forEach((bs) => {
        if (bs.service) {
          items.push({
            id: bs.service.id,
            type: 'service',
            name: bs.service.name,
            price: bs.price || bs.service.price || 0,
            quantity: bs.quantity || 1,
          });
        }
      });
    }

    setSelectedBooking(freshBooking);
    setEditSelectedItems(items);
    editForm.setFieldsValue({
      customerId: freshBooking.customerId,
      notes: freshBooking.notes || '',
      eventDate: freshBooking.eventDate,
      totalPrice: freshBooking.totalPrice,
      status: freshBooking.status,
    });
    setIsEditModalOpenRaw(true);
    setIsLoadingBooking(false);
  }, [bookingDetail, isLoadingDetail, isDetailError, editForm]);

  // Handle detail query errors
  useEffect(() => {
    if (isDetailError) {
      messageApi.error('Failed to load booking details');
      setIsLoadingBooking(false);
    }
  }, [isDetailError, messageApi]);

  const handleViewBooking = (booking: Booking) => {
    setDetailBooking(booking);
    setIsDetailModalOpen(true);
    setIsLoadingBooking(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailBooking(null);
  };

  const handleDetailBookingUpdated = (booking: Booking) => {
    setDetailBooking(booking);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpenRaw(false);
    createForm.resetFields();
    setCreateSelectedItems([]);
    resetAssignmentConflictState();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpenRaw(false);
    setSelectedBooking(null);
    editForm.resetFields();
    setEditSelectedItems([]);
    resetAssignmentConflictState();
  };

  const setIsCreateModalOpen = (open: boolean) => {
    if (open) {
      handleOpenCreateModal();
      return;
    }

    handleCloseCreateModal();
  };

  const setIsEditModalOpen = (open: boolean) => {
    if (open) {
      setIsEditModalOpenRaw(true);
      return;
    }

    handleCloseEditModal();
  };

  return {
    bookings: bookingsData?.data || [],
    loading: bookingsLoading,
    loadingBooking: isLoadingBooking,
    total: bookingsData?.pagination?.total || 0,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    detailBooking,
    selectedBooking,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    createSelectedItems,
    editSelectedItems,
    isDetailModalOpen,
    bookingActionState,
    canCreateBooking: bookingActionState.createReason === null,
    canUpdateBooking: bookingActionState.updateReason === null,
    canDeleteBooking: bookingActionState.deleteReason === null,
    canCancelBooking: bookingActionState.cancelReason === null,
    canCompleteBooking: bookingActionState.completeReason === null,
    createModalLoading: isCreateAssigning,
    editModalLoading: isEditAssigning,
    createAssignmentConflictState,
    editAssignmentConflictState,
    // Bulk selection
    selectedRowKeys,
    setSelectedRowKeys,
    bulkDeleteMutation,
    // Actions
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleOpenEdit,
    handleViewBooking,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailModal,
    handleDetailBookingUpdated,
    handleAddCreateItem,
    handleRemoveCreateItem,
    handleAddEditItem,
    handleRemoveEditItem,
    calculateCreateTotalPrice,
    calculateEditTotalPrice,
    handleUpdateCreateItemQuantity,
    handleUpdateEditItemQuantity,
  };
}
