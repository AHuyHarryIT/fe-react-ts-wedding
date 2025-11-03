import { VendorCategory } from '@prisma/client';

export class CreateVendorDto {
  name: string;
  category: VendorCategory;
  contactName?: string;
  email?: string;
  phone?: string;
  price?: number;
  paid?: boolean;
  notes?: string;
  weddingId: string;
}
