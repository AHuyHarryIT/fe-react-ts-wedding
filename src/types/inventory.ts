import type { PaginationParams } from './common';

export type ItemType = 'SOLD' | 'RENTAL' | 'SERVICE_ADDON';
export type RentalStatus =
  | 'AVAILABLE'
  | 'CHECKED_OUT'
  | 'MAINTENANCE'
  | 'DAMAGED';
export type InventoryLogType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'CHECKOUT'
  | 'CHECKIN'
  | 'DAMAGE_REPORT'
  | 'MAINTENANCE_START'
  | 'MAINTENANCE_END'
  | 'ADJUSTMENT';

export interface InventoryCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  sku?: string;
  costPrice: number;
  sellPrice: number;
  rentalDeposit?: number;
  rentalPricePerDay?: number;
  stockCount: number;
  checkedOutCount: number;
  lowStockThreshold?: number;
  rentalStatus?: RentalStatus;
  categoryId?: string;
  category?: InventoryCategory;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  type: InventoryLogType;
  quantity: number;
  note?: string;
  checkoutDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  damageNote?: string;
  damageCost?: number;
  actorId?: string;
  createdAt: string;
}

export interface CreateInventoryCategoryRequest {
  name: string;
}

export interface UpdateInventoryCategoryRequest {
  name?: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  description?: string;
  type: ItemType;
  sku?: string;
  costPrice?: number;
  sellPrice?: number;
  rentalDeposit?: number;
  rentalPricePerDay?: number;
  stockCount?: number;
  lowStockThreshold?: number;
  rentalStatus?: RentalStatus;
  categoryId?: string;
  isActive?: boolean;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  description?: string;
  type?: ItemType;
  sku?: string;
  costPrice?: number;
  sellPrice?: number;
  rentalDeposit?: number;
  rentalPricePerDay?: number;
  stockCount?: number;
  lowStockThreshold?: number;
  rentalStatus?: RentalStatus;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface QueryInventoryItemParams extends PaginationParams {
  type?: string;
  isActive?: boolean;
  categoryId?: string;
}

export interface CheckoutItemRequest {
  quantity: number;
  note?: string;
  expectedReturnDate?: string;
}

export interface CheckinItemRequest {
  quantity: number;
  note?: string;
  damageNote?: string;
  damageCost?: number;
}

export interface StockAdjustmentRequest {
  quantity: number;
  note?: string;
}
