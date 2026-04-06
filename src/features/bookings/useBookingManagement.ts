import { bookingApi } from '@services/BookingService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Booking,
  BookingFormData,
  BookingSelectedItem,
  BookingStaffAssignmentInput,
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@types';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';

export function useBookingManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<BookingFormData>();
  const [editForm] = Form.useForm<BookingFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete booking';
      messageApi.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data),
    onSuccess: (data) => {
      messageApi.success('Booking created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      setCreateSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error: unknown) => {
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
      messageApi.success('Booking updated successfully');
      setIsEditModalOpen(false);
      setSelectedBooking(null);
      editForm.resetFields();
      setEditSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
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
    }: {
      id: string;
      staffAssignments: BookingStaffAssignmentInput[];
    }) => bookingApi.assignStaff(id, staffAssignments),
    retry: false,
  });

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

  // Handlers
  const handleCreate = async (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => {
    if (createSelectedItems.length === 0) {
      messageApi.error('Please select at least 1 package or service');
      return;
    }

    const bookingData: CreateBookingRequest = {
      customerId: values.customerId,
      packageIds: [],
      serviceIds: createSelectedItems
        .filter((item) => item.type === 'service')
        .map((item) => item.id),
      notes: values.notes,
      eventDate: values.eventDate,
      totalPrice: calculateCreateTotalPrice(),
      status: values.status,
    };

    const createResponse = await createMutation.mutateAsync(bookingData);

    if (staffAssignments?.length) {
      await assignStaffMutation.mutateAsync({
        id: createResponse.data.id,
        staffAssignments,
      });
    }
  };

  const handleEdit = async (
    values: BookingFormData,
    staffAssignments?: BookingStaffAssignmentInput[]
  ) => {
    if (!selectedBooking) return;

    if (editSelectedItems.length === 0) {
      messageApi.error('Please select at least 1 service');
      return;
    }

    const updateData: UpdateBookingRequest = {
      customerId: values.customerId,
      packageIds: [],
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

    if (staffAssignments?.length) {
      await assignStaffMutation.mutateAsync({
        id: selectedBooking.id,
        staffAssignments,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (booking: Booking) => {
    // Trigger the detail query by setting selected booking
    setSelectedBooking(booking);
    setIsLoadingBooking(true);
  };

  // React to booking detail query result to populate edit form
  useEffect(() => {
    if (!bookingDetail || isLoadingDetail || isDetailError) return;

    const freshBooking = bookingDetail.data;
    const items: BookingSelectedItem[] = [];

    // Add all booking services
    if (freshBooking.services && freshBooking.services.length > 0) {
      freshBooking.services.forEach((bs) => {
        if (bs.service) {
          items.push({
            id: bs.service.id,
            type: 'service',
            name: bs.service.name,
            price: bs.service.price || 0,
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
    setIsEditModalOpen(true);
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
    setIsCreateModalOpen(false);
    createForm.resetFields();
    setCreateSelectedItems([]);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
    editForm.resetFields();
    setEditSelectedItems([]);
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
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
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
