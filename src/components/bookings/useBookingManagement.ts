import { bookingApi } from '@services/BookingService';
import { packageApi } from '@services/PackageService';
import { userApi } from '@services/UserService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@types';
import { Form, message } from 'antd';
import { useState } from 'react';

interface BookingFormData {
  customerId: string;
  packageId: string;
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
}

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
        includeSessions: true,
      }),
  });

  const { data: customersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll({ limit: 100 }),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageApi.getAll({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data),
    onSuccess: () => {
      messageApi.success('Booking created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update booking';
      messageApi.error(errorMessage);
    },
  });

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

  // Handlers
  const handleCreate = (values: BookingFormData) => {
    const bookingData: CreateBookingRequest = {
      customerId: values.customerId,
      packageId: values.packageId,
      notes: values.notes,
      eventDate: values.eventDate,
      totalPrice: values.totalPrice || 0,
      status: values.status,
    };
    createMutation.mutate(bookingData);
  };

  const handleEdit = (values: BookingFormData) => {
    if (selectedBooking) {
      const updateData: UpdateBookingRequest = {
        customerId: values.customerId,
        packageId: values.packageId,
        notes: values.notes,
        eventDate: values.eventDate,
        totalPrice: values.totalPrice,
        status: values.status,
      };
      updateMutation.mutate({ id: selectedBooking.id, data: updateData });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    editForm.setFieldsValue({
      customerId: booking.customerId,
      packageId: booking.packageId,
      notes: booking.notes || '',
      eventDate: booking.eventDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
    editForm.resetFields();
  };

  return {
    bookings: bookingsData?.data || [],
    loading: bookingsLoading,
    total: bookingsData?.pagination?.total || 0,
    customers: customersData?.data || [],
    packages: packagesData?.data || [],
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedBooking,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  };
}
