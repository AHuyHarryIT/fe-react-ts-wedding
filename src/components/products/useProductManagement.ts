import { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productApi,
  categoryApi,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '@lib';

interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
}

export function useProductManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<ProductFormData>();
  const [editForm] = Form.useForm<ProductFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchText],
    queryFn: () =>
      productApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.create(data),
    onSuccess: () => {
      messageApi.success('Product created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create product';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Product updated successfully');
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update product';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      messageApi.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete product';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: ProductFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: ProductFormData) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQty: product.stockQty,
      isActive: product.isActive,
      categoryId: product.categoryId,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    editForm.resetFields();
  };

  return {
    // State
    isCreateModalOpen,
    isEditModalOpen,
    selectedProduct,
    searchText,
    currentPage,
    pageSize,
    productsData,
    productsLoading,
    categoriesData,
    createForm,
    editForm,
    messageApi,
    contextHolder,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,

    // Handlers
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
