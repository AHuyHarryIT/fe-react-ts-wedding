import type { PaginationParams } from './common';
import type { Service } from './service';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  images?: PackageImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  services?: PackageService[];
}

export interface PackageImage {
  id: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  sortOrder: number;
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
  coverImage?: File;
  galleryImages?: File[];
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  serviceIds?: Service['id'][];
  coverImage?: File;
  galleryImages?: File[];
  galleryOrder?: string[];
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
