import mongoose from 'mongoose';

interface ITransaction extends mongoose.Document {
  transactionId: string;
  type: 'listing_fee' | 'colocation_commission' | 'refund' | 'withdrawal' | 'advertisement' | 'booking';
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  stripePaymentIntentId?: string;
  propertyId?: string;
  colocationId?: string;
  bookingId?: string;
  description: string;
  commission: number; // 10% from transaction amount
  netAmount: number; // Amount paid to owner (90%)
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
    enum: ['listing_fee', 'colocation_commission', 'refund', 'withdrawal', 'advertisement', 'booking'],
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer'],
    required: true,
    default: 'cash'
  },
  stripePaymentIntentId: String,
  commission: {
    type: Number,
    required: true,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true,
    default: 0
  },
  propertyId: {
    type: String,
    ref: 'Property'
  },
  bookingId: {
    type: String,
    ref: 'Booking'
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
