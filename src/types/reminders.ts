export enum ReminderType {
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  RENTAL_RETURN = 'RENTAL_RETURN',
  LOW_STOCK = 'LOW_STOCK',
  CUSTOM = 'CUSTOM',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  message: string;
  status: ReminderStatus;
  scheduledAt: string;
  triggeredAt: string | null;
  bookingId: string | null;
  customerId: string | null;
  itemId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { notifications: number };
}

export interface Notification {
  id: string;
  reminderId: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  recipientStaffId: string | null;
  createdAt: string;
}

export interface ReminderCreateDto {
  type: ReminderType;
  title: string;
  message: string;
  scheduledAt: string;
  bookingId?: string;
  customerId?: string;
  itemId?: string;
}

export interface ReminderQueryDto {
  page?: number;
  limit?: number;
  type?: ReminderType;
  status?: ReminderStatus;
  bookingId?: string;
  customerId?: string;
}
