import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { permissionApi } from '@lib';

export function usePermissionManagement() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['permissions', page, limit, search],
    queryFn: () => permissionApi.list({ page, limit, search }),
  });

  return {
    // State
    page,
    limit,
    search,

    // Data
    data,
    isLoading,

    // Handlers
    setPage,
    setLimit,
    setSearch,
    refetch,
  };
}
