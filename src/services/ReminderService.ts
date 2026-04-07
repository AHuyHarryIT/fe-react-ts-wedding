import { api } from '@/api/client';
import type {
  Reminder,
  ReminderCreateDto,
  ReminderQueryDto,
} from '@/types/reminders';

const baseUrl = '/reminders';

export async function getReminders(params: ReminderQueryDto) {
  const { page = 1, limit = 20, type, status, bookingId, customerId } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (type) query.set('type', type);
  if (status) query.set('status', status);
  if (bookingId) query.set('bookingId', bookingId);
  if (customerId) query.set('customerId', customerId);

  const res = await api.get(`${baseUrl}?${query}`);
  return res.data;
}

export async function getReminderById(id: string): Promise<{ data: Reminder }> {
  const res = await api.get(`${baseUrl}/${id}`);
  return res.data;
}

export async function createReminder(data: ReminderCreateDto) {
  const res = await api.post(baseUrl, data);
  return res.data;
}

export async function updateReminder(
  id: string,
  data: Partial<ReminderCreateDto> & { status?: string }
) {
  const res = await api.patch(`${baseUrl}/${id}`, data);
  return res.data;
}

export async function deleteReminder(id: string) {
  const res = await api.delete(`${baseUrl}/${id}`);
  return res.data;
}

// Notifications
export async function getNotifications(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await api.get(`${baseUrl}/notifications?${query}`);
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.patch(`${baseUrl}/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch(`${baseUrl}/notifications/read-all`);
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get(`${baseUrl}/notifications/unread-count`);
  return res.data;
}
