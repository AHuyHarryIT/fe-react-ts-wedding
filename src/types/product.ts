export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQty: number;
  isActive: boolean;
  categoryId?: string;
  imageFileId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
  image?: File;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
  image?: File;
}
