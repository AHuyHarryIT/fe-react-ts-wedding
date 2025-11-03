import { WeddingStatus } from '@prisma/client';

export class CreateWeddingDto {
  brideName: string;
  groomName: string;
  weddingDate: Date;
  venue?: string;
  budget?: number;
  status?: WeddingStatus;
  description?: string;
  userId: string;
}
