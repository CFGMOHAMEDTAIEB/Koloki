import mongoose from 'mongoose';

interface IProperty extends mongoose.Document {
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
  preferenceTenants: string[];
  minStayDays: number;
  maxOccupancy: number;
  availableFrom: Date;
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
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new mongoose.Schema<IProperty>({
  ownerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 5000
  },
  location: {
    address: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  images: [String],
  roomTypes: [
    {
      type: {
        type: String,
        enum: ['single', 'double', 'shared']
      },
      price: Number,
      available: Number
    }
  ],
  amenities: [String],
  rules: [String],
  preferenceTenants: [String],
  minStayDays: {
    type: Number,
    default: 30
  },
  maxOccupancy: Number,
  availableFrom: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'verified', 'pending_verification', 'rejected'],
    default: 'pending_verification'
  },
  listingFee: {
    amount: {
      type: Number,
      default: 10, // 10 DT
    },
    currency: {
      type: String,
      default: 'TND'
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: Date
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date
}, { timestamps: true });

export const Property = mongoose.model<IProperty>('Property', propertySchema);
