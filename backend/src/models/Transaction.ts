import mongoose from 'mongoose';

interface ITransaction extends mongoose.Document {
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

const transactionSchema = new mongoose.Schema<ITransaction>({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['listing_fee', 'colocation_commission', 'refund', 'withdrawal', 'advertisement'],
    required: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TND'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  propertyId: {
    type: String,
    ref: 'Property'
  },
  colocationId: {
    type: String,
    ref: 'Colocation'
  },
  description: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
