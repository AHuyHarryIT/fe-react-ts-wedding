import type { PaginationParams } from './common';
import type { Job } from './job';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  jobId?: string | null;
  job?: Pick<Job, 'id' | 'name'> | null;
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
  jobId?: string | null;
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
  jobId?: string | null;
  image?: File;
}

export interface QueryServiceParams extends PaginationParams {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
