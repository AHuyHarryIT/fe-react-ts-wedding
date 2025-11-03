import { RsvpStatus } from '@prisma/client';

export class CreateGuestDto {
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus?: RsvpStatus;
  plusOne?: boolean;
  dietaryRestrictions?: string;
  weddingId: string;
}
