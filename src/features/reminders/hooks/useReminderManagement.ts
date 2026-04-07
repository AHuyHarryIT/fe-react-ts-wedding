import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ReminderService from '@/services/ReminderService';
import type { ReminderQueryDto } from '@/types/reminders';

export function useRemindersQuery(params: ReminderQueryDto) {
  return useQuery({
    queryKey: ['reminders', params],
    queryFn: () => ReminderService.getReminders(params),
  });
}

export function useReminderQuery(id: string) {
  return useQuery({
    queryKey: ['reminder', id],
    queryFn: () => ReminderService.getReminderById(id),
    enabled: !!id,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ReminderService.createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      ReminderService.updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReminderService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => ReminderService.getNotifications({}),
  });
}

export function useMarkReadAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ReminderService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => ReminderService.getUnreadCount(),
    refetchInterval: 30000,
  });
}
