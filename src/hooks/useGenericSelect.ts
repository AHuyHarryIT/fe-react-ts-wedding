import { selectionApi } from '@services/SelectionService';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PaginatedResponse } from '@types';
import { useMemo, useState } from 'react';

interface UseGenericSelectParams {
  entity: string;
  limit?: number;
  extraParams?: Record<string, string | number | boolean | undefined>;
}

export function useGenericSelect<TExtra = unknown>({
  entity,
  limit = 10,
  extraParams,
}: UseGenericSelectParams) {
  const [search, setSearch] = useState('');

  const normalizedExtraParams = useMemo(() => {
    if (!extraParams) {
      return undefined;
    }

    return Object.entries(extraParams).reduce<
      Record<string, string | number | boolean>
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }, [extraParams]);

  const query = useInfiniteQuery<PaginatedResponse<TExtra>>({
    queryKey: ['selection', entity, search, normalizedExtraParams],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await selectionApi.getAll<TExtra>({
        entity,
        search,
        page: pageParam,
        limit,
        ...normalizedExtraParams,
      });
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });

  const options = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  return {
    options,
    loading: query.isFetching,
    hasNext: query.hasNextPage,
    onSearch: (value: string) => setSearch(value),
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    refetch: query.refetch,
  };
}
