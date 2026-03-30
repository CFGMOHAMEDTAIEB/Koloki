import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  phone: string;
  passwordHash: string;
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
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profileImage: String,
  userType: {
    type: String,
    enum: ['renter', 'owner', 'admin'],
    default: 'renter'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  kycVerification: {
    idType: String,
    idNumber: String,
    issuedDate: Date,
    expiryDate: Date,
    verifiedAt: Date
  },
  backgroundCheck: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'TND'
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const hashedPassword = await bcrypt.hash(this.passwordHash, 10);
    this.passwordHash = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
