export interface Service {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateServiceRequest {
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}
