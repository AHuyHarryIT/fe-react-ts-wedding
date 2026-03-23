import type { PaginationParams } from './common';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  imageUrl?: string | null;
  cloudinaryPublicId?: string | null;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  image?: File;
}

export interface ServiceFormData extends CreateServiceRequest {
  image?: File;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  image?: File;
}

export interface QueryServiceParams extends PaginationParams {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
