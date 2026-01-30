import type { PaginationParams } from './common';
import type { User } from './user';
import type { Package } from './package';
import type { Service } from './service';
import type { Order } from './order';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface BookingPackage {
  bookingId: Booking['id'];
  packageId: Package['id'];
  quantity: number;
  price: number; // Price at time of booking
  package?: Package;
}

export interface BookingService {
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number; // Price at time of booking
  service?: Service;
}

export interface Booking {
  id: string;
  customerId: User['id'];
  notes?: string;
  eventDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  customer?: User;
  packages?: BookingPackage[];
  services?: BookingService[];
  orders?: Order[];
  order?: Order;
}

export interface CreateBookingRequest {
  customerId: User['id'];
  packageIds?: Package['id'][];
  serviceIds?: Service['id'][];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface UpdateBookingRequest {
  customerId?: User['id'];
  packageIds?: Package['id'][];
  serviceIds?: Service['id'][];
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
  includePackages?: boolean;
  includeServices?: boolean;
}
