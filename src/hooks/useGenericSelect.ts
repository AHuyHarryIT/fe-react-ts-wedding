import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SelectionResponse } from '@types';
import { api } from '@/api/client';

interface UseGenericSelectParams {
  entity: string;
  limit?: number;
  enabled?: boolean;
}

export function useGenericSelect<TExtra = unknown>({
  entity,
  limit = 20,
  enabled = true,
}: UseGenericSelectParams) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery<SelectionResponse<TExtra>>({
    queryKey: ['selection', entity, search, page],
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/selections', {
        params: { entity, search, page, limit },
      });
      return data;
    },
  });

  const options = query.data?.items ?? [];

  const loadMore = () => {
    if (query.data?.pagination.hasNext && !query.isFetching) {
      setPage((p) => p + 1);
    }
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    options,
    loading: query.isFetching,
    onSearch,
    loadMore,
    refetch: query.refetch,
    pagination: query.data?.pagination,
  };
}
