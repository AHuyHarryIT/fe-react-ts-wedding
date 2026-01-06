import type { PaginationParams } from './common';
import type { User } from './user';
import type { Package } from './package';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface Booking {
  id: string;
  customerId: string;
  packageId: string;
  notes?: string;
  eventDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  customer?: User;
  package?: Package;
}

export interface CreateBookingRequest {
  customerId: string;
  packageId: string;
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface UpdateBookingRequest {
  customerId?: string;
  packageId?: string;
  notes?: string;
  eventDate?: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface QueryBookingParams extends PaginationParams {
  status?: BookingStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  includeCustomer?: boolean;
  includePackage?: boolean;
  includeSessions?: boolean;
}
