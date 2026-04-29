export interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  share_token?: string;
  expiresAt?: string;
  coverFileId?: string;
  ownerUserId: string;
  bookingId?: string;
  customerId?: string;
  oneDriveFolderUrl?: string;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
  };
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
  };
  coverFile?: {
    id: string;
    storageUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  _count?: {
    files: number;
  };
}

export interface AlbumImage {
  albumId: string;
  fileId: string;
  sortOrder: number;
  caption?: string;
  image: {
    id: string;
    name: string;
    storageUrl: string;
    mimeType: string;
    byteSize: number;
  };
}

export interface AlbumWithFiles extends Album {
  files?: AlbumImage[];
}

export interface CreateAlbumRequest {
  ownerUserId?: string;
  title: string;
  description?: string;
  bookingId?: string;
  customerId?: string;
  isPublic?: boolean;
  share_token?: string;
  expiresAt?: string;
  coverFileId?: string;
}

export interface UpdateAlbumRequest {
  title?: string;
  description?: string;
  bookingId?: string;
  customerId?: string;
  isPublic?: boolean;
  expiresAt?: string;
  coverFileId?: string;
}

export interface GenerateShareTokenRequest {
  expiresAt?: string;
}

export interface AddFilesToAlbumRequest {
  files: Array<{
    fileId: string;
    sortOrder?: number;
    caption?: string;
  }>;
}

export interface RemoveFilesFromAlbumRequest {
  fileIds: string[];
}
