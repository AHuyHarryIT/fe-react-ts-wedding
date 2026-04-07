import type { PaginationParams } from './common';
import type { Package } from './package';
import type { Service } from './service';
import type { InventoryItem } from './inventory';
import type { Customer } from './customer';

export enum QuotationStatus {
  Draft = 'DRAFT',
  Sent = 'SENT',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED',
  Converted = 'CONVERTED',
}

export type QuotationItemType = 'service' | 'inventory' | 'package';

export interface QuotationItem {
  id: string;
  quotationId: string;
  itemType: QuotationItemType;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  service?: Service;
  inventoryItem?: InventoryItem;
  package?: Package;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  title: string;
  notes?: string;
  status: QuotationStatus;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalPrice: number;
  validUntil: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  customer?: Customer;
  items?: QuotationItem[];
  convertedBookingId?: string;
}

export interface CreateQuotationItemInput {
  itemType: QuotationItemType;
  itemId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreateQuotationRequest {
  customerId: string;
  title: string;
  notes?: string;
  validUntil: string;
  items: CreateQuotationItemInput[];
  discountPercent?: number;
  taxPercent?: number;
}

export interface UpdateQuotationRequest {
  customerId?: string;
  title?: string;
  notes?: string;
  validUntil?: string;
  items?: CreateQuotationItemInput[];
  discountPercent?: number;
  taxPercent?: number;
  status?: QuotationStatus;
}

export interface QueryQuotationParams extends PaginationParams {
  status?: QuotationStatus;
  customerId?: string;
}

export interface QuotationFormData {
  customerId: string;
  title: string;
  notes?: string;
  validUntil: string;
  discountPercent?: number;
  taxPercent?: number;
}

export interface QuotationSelectedItem {
  id: string;
  type: QuotationItemType;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}
