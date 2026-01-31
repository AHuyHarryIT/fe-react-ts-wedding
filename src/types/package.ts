import type { PaginationParams } from './common';
import type { Service } from './service';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  services?: PackageService[];
}

export interface PackageService {
  packageId: Package['id'];
  serviceId: Service['id'];
  service?: Service;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  serviceIds?: Service['id'][];
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface UpdatePackageServicesRequest {
  serviceIds: Service['id'][];
}

export interface QueryPackageParams extends PaginationParams {
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  includeServices?: boolean;
}
