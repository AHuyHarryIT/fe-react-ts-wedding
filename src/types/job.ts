import type { PaginationParams } from './common';

export interface Job {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateJobRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateJobRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export type JobCatalogItem = Job;
export type CreateJobCatalogRequest = CreateJobRequest;
export type UpdateJobCatalogRequest = UpdateJobRequest;
export type JobFormData = CreateJobRequest;

export interface QueryJobParams extends PaginationParams {
  isActive?: boolean;
}
