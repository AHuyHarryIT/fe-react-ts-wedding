import { useCallback, useState } from 'react';
import { Modal, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseBulkDeleteOptions {
  /** API delete function that accepts a single ID */
  deleteFn: (id: string) => Promise<unknown>;
  /** Query keys to invalidate after deletion */
  queryKeys: string[][];
  /** Entity label for messages (e.g. "booking", "customer") */
  entityLabel: string;
  /** Optional: process all deletions sequentially */
  sequential?: boolean;
}

interface UseBulkDeleteReturn {
  selectedRowKeys: readonly string[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<readonly string[]>>;
  isDeleting: boolean;
  /** Call this from the table's rowSelection.onChange */
  onSelectionChange: (selectedKeys: React.Key[]) => void;
  /** Opens the confirmation modal and performs bulk deletion */
  handleBulkDelete: () => void;
  /** Clears selection */
  clearSelection: () => void;
}

export function useBulkDelete<T extends { id: string }>(
  options: UseBulkDeleteOptions<T>
): UseBulkDeleteReturn {
  const { deleteFn, queryKeys, entityLabel, sequential = true } = options;
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState<readonly string[]>([]);

  const deleteMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      if (sequential) {
        const results: unknown[] = [];
        for (const key of keys) {
          results.push(await deleteFn(key));
        }
        return results;
      }
      return Promise.all(keys.map((key) => deleteFn(key)));
    },
    onSuccess: (_data, keys) => {
      for (const qk of queryKeys) {
        queryClient.invalidateQueries({ queryKey: qk });
      }
      messageApi.success(
        `Successfully deleted ${keys.length} ${entityLabel}(s)`
      );
      setSelectedRowKeys([]);
    },
    onError: () => {
      messageApi.error(`Failed to delete ${entityLabel}(s). Please try again.`);
    },
  });

  const onSelectionChange = useCallback((selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys.map(String));
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      messageApi.info('No items selected');
      return;
    }

    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} ${entityLabel}(s)`,
      content: `Are you sure you want to permanently delete ${selectedRowKeys.length} ${entityLabel}(s)? This action cannot be undone.`,
      okText: `Delete ${selectedRowKeys.length}`,
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteMutation.mutate([...selectedRowKeys]);
      },
    });
  }, [selectedRowKeys, entityLabel, deleteMutation, messageApi]);

  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    isDeleting: deleteMutation.isPending,
    onSelectionChange,
    handleBulkDelete,
    clearSelection,
    //
    // but we provide it here in case the hook is used standalone
    messageContextHolder,
  };
}
