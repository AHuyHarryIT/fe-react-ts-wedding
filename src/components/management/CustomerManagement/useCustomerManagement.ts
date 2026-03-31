import { customerApi } from '@services/CustomerService';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from '@types';
import { getErrorMessage } from '@utils/error';
import dayjs from 'dayjs';
import { Form, message } from 'antd';
import { useCallback, useState } from 'react';

export function useCustomerManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [messageApi, contextHolder] = message.useMessage();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: [
      'customers',
      { page: currentPage, limit: pageSize, search: searchText },
    ],
    queryFn: () =>
      customerApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  const { data: selectedCustomerData } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: () => customerApi.getOne(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      messageApi.success('Customer account created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      refetchCustomers();
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to create customer account'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Customer account updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      setSelectedCustomerId(null);
      refetchCustomers();
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to update customer account'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      messageApi.success('Customer account deleted successfully');
      refetchCustomers();
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to delete customer account'
      );
    },
  });

  const handleCreate = useCallback(
    (values: CreateCustomerRequest) => {
      createMutation.mutate(values);
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    (values: UpdateCustomerRequest) => {
      if (!selectedCustomerId) return;
      updateMutation.mutate({
        id: selectedCustomerId,
        data: values,
      });
    },
    [selectedCustomerId, updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleOpenEdit = useCallback(
    (customer: Customer) => {
      setSelectedCustomerId(customer.id);
      setSelectedCustomer(customer);
      editForm.setFieldsValue({
        firstName: customer.firstName || undefined,
        lastName: customer.lastName || undefined,
        email: customer.email || undefined,
        weddingDate: customer.weddingDate ? dayjs(customer.weddingDate) : null,
        weddingVenue: customer.weddingVenue || undefined,
        emailNotifications: customer.emailNotifications,
        smsNotifications: customer.smsNotifications,
        marketingEmails: customer.marketingEmails,
        isActive: customer.isActive,
      });
      setIsEditModalOpen(true);
    },
    [editForm]
  );

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedCustomerId(null);
  }, [editForm]);

  return {
    isCreateModalOpen,
    isEditModalOpen,
    selectedCustomer: selectedCustomerData?.data || selectedCustomer,
    searchText,
    currentPage,
    pageSize,
    customersData,
    customersLoading,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    setIsCreateModalOpen,
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
