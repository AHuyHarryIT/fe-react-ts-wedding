import type { PaginationParams } from './common';
import type { User } from './user';
import type { Package } from './package';
import type { Service } from './service';
import type { Order } from './order';

export type BookingStatus =
  | 'PENDING'
  | 'DEPOSIT_PAID'
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

export interface BookingAssignedStaff {
  sourceKey?: string;
  staffId: string;
  serviceLabel?: string;
  staff?: User;
  job?: string;
  locationName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BookingDirectStaffAssignment
  extends Pick<
    User,
    'id' | 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'isActive'
  > {
  sourceKey?: string;
  staffId: string;
  serviceLabel?: string;
  job?: string;
  locationName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BookingStaffAssignmentInput {
  sourceKey?: string;
  staffId: string;
  serviceLabel?: string;
  job?: string;
  locationName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BookingFormData {
  customerId: User['id'];
  packageIds?: Package['id'][];
  serviceIds?: Service['id'][];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface BookingSelectedItem {
  id: string;
  type: 'package' | 'service';
  name: string;
  price: number;
  quantity: number;
}

export interface StaffAssignmentRow {
  staffId: string;
  job: string;
  requiredJobId?: string;
  requiredJobName?: string;
  serviceLabel?: string;
  sourceKey?: string;
  isRequired?: boolean;
  requiresLocation?: boolean;
  requiresTime?: boolean;
  locationName?: string;
  startTime?: string;
  endTime?: string;
}

export interface RequiredServiceAssignment {
  sourceKey: string;
  serviceLabel: string;
  requiredJobId: string;
  requiredJobName: string;
  requiresLocation?: boolean;
  requiresTime?: boolean;
}

export type AssignedStaffMember = {
  sourceKey?: string;
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  job?: string;
  serviceLabel?: string;
  locationName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export interface BookingSession {
  id: string;
  title: string;
  bookingId?: string;
  locationName?: string | null;
  address?: string | null;
  startsAt?: string;
  endsAt?: string;
  status?: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
  staffs?: BookingAssignedStaff[];
  services?: BookingService[];
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
  staffs?: BookingAssignedStaff[];
  assignedStaffs?: BookingDirectStaffAssignment[];
  sessions?: BookingSession[];
  orders?: Order[];
  order?: Order;
}

export interface CreateBookingRequest {
  customerId: User['id'];
  packageIds?: Package['id'][];
  serviceIds?: Service['id'][];
  staffIds?: User['id'][];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface UpdateBookingRequest {
  customerId?: User['id'];
  packageIds?: Package['id'][];
  serviceIds?: Service['id'][];
  staffIds?: User['id'][];
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
  includeStaffs?: boolean;
}

export interface CreateBookingSessionRequest {
  bookingId: string;
  title: string;
  locationName?: string;
  address?: string;
  startsAt: string;
  endsAt: string;
  status?: BookingStatus;
}

export interface UpdateBookingSessionRequest {
  bookingId?: string;
  title?: string;
  locationName?: string;
  address?: string;
  startsAt?: string;
  endsAt?: string;
  status?: BookingStatus;
}

export interface QueryBookingSessionParams extends PaginationParams {
  bookingId?: string;
  status?: BookingStatus;
  includeBooking?: boolean;
  includeStaff?: boolean;
  includeServices?: boolean;
}
