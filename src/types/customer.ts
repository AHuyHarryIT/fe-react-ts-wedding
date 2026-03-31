export interface Customer {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  weddingDate?: string | null;
  weddingVenue?: string | null;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCustomerRequest {
  phoneNumber: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  weddingDate?: string | null;
  weddingVenue?: string | null;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  isActive?: boolean;
}

export interface UpdateCustomerRequest {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  weddingDate?: string | null;
  weddingVenue?: string | null;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  isActive?: boolean;
}
