import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { permissionApi } from '@services/PermissionService';
import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';

export function usePermissionManagement() {
  const [messageApi, contextHolder] = message.useMessage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [readReason, setReadReason] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['permissions', page, limit, search],
    queryFn: () => permissionApi.list({ page, limit, search }),
    retry: false,
  });

  useEffect(() => {
    if (!isError || !isPermissionDeniedError(error)) {
      return;
    }

    const reason = buildForbiddenReason(error);
    setReadReason(reason);
    messageApi.warning(reason);
  }, [error, isError, messageApi]);

  useEffect(() => {
    if (data) {
      setReadReason(null);
    }
  }, [data]);

  return {
    // State
    page,
    limit,
    search,
    readReason,
    canReadPermissions: readReason === null,

    // Data
    data,
    isLoading,
    contextHolder,

    // Handlers
    setPage,
    setLimit,
    setSearch,
    refetch,
  };
}
