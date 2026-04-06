import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@shared/components/management';
import { PermissionTable } from './PermissionTable';
import { usePermissionManagement } from './usePermissionManagement';

export function PermissionManagement() {
  const {
    page,
    limit,
    search,
    data,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    refetch,
  } = usePermissionManagement();

  return (
    <ManagementLayout
      header={
        <ManagementHeader
          title="Permission Management"
          subtitle="System permissions"
          showCreateButton={false}
        />
      }
      searchBar={
        <SearchBar
          value={search}
          onChange={setSearch}
          onRefresh={refetch}
          placeholder="Search permissions..."
        />
      }
      table={
        <PermissionTable
          data={data?.data || []}
          loading={isLoading}
          currentPage={page}
          pageSize={limit}
          total={data?.pagination?.total || 0}
          onPageChange={(newPage, newPageSize) => {
            setPage(newPage);
            setLimit(newPageSize || 10);
          }}
        />
      }
    />
  );
}
