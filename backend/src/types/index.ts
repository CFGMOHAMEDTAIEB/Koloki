import ts from 'typescript';

// User Types
export interface IAuthUser {
  userId: string;
  email: string;
  userType: 'renter' | 'owner' | 'admin';
  role?: string;
}

export interface IUser {
  _id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  userType: 'renter' | 'owner' | 'admin';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycVerification?: {
    idType: string;
    idNumber: string;
    issuedDate: Date;
    expiryDate: Date;
    verifiedAt?: Date;
  };
  backgroundCheck?: {
    status: 'pending' | 'approved' | 'rejected';
    verifiedAt?: Date;
  };
  wallet: {
    balance: number;
    currency: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

// Property Types
export interface IProperty {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  images: string[];
  roomTypes: Array<{
    type: 'single' | 'double' | 'shared';
    price: number;
    available: number;
  }>;
  amenities: string[];
  rules: string[];
  status: 'active' | 'inactive' | 'verified' | 'pending_verification' | 'rejected';
  listingFee: {
    amount: number;
    currency: string;
    paid: boolean;
    paidAt?: Date;
  };
  ratings: {
    average: number;
    count: number;
  };
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface ITransaction {
  transactionId: string;
  type: 'listing_fee' | 'colocation_commission' | 'refund' | 'withdrawal' | 'advertisement';
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  propertyId?: string;
  colocationId?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
