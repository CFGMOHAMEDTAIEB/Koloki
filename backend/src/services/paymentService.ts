import { Transaction } from '../models/Transaction';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentInput {
  userId: string;
  propertyId?: string;
  bookingId?: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  type: 'booking' | 'listing_fee' | 'colocation_commission';
  description: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  // 10% commission rate
  static readonly COMMISSION_RATE = 0.1;

  /**
   * Calculate commission on transaction amount
   * @param amount - Transaction amount
   * @returns Commission amount (10%)
   */
  static calculateCommission(amount: number): number {
    return Math.round(amount * this.COMMISSION_RATE * 100) / 100;
  }

  /**
   * Calculate net amount after commission
   * @param amount - Transaction amount
   * @returns Net amount to owner (90%)
   */
  static calculateNetAmount(amount: number): number {
    return Math.round(amount * (1 - this.COMMISSION_RATE) * 100) / 100;
  }

  /**
   * Create a payment transaction with commission calculation
   */
  static async createPayment(input: PaymentInput) {
    const commission = this.calculateCommission(input.amount);
    const netAmount = this.calculateNetAmount(input.amount);

    const transaction = new Transaction({
      transactionId: `TXN-${uuidv4()}`,
      type: input.type,
      userId: input.userId,
      propertyId: input.propertyId,
      bookingId: input.bookingId,
      amount: input.amount,
      commission,
      netAmount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      status: input.paymentMethod === 'cash' ? 'pending' : 'pending',
      description: input.description,
      metadata: input.metadata || {}
    });

    return transaction.save();
  }

  /**
   * Complete a payment transaction
   */
  static async completePayment(transactionId: string, paymentIntentId?: string) {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'completed',
        ...(paymentIntentId && { stripePaymentIntentId: paymentIntentId })
      },
      { new: true }
    );
    return transaction;
  }

  /**
   * Get all transactions for a user
   */
  static async getUserTransactions(userId: string) {
    return Transaction.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get commission earned for a property owner
   */
  static async getOwnerCommissions(ownerId: string) {
    const transactions = await Transaction.find({
      userId: ownerId,
      status: 'completed'
    });

    const totalCommissions = transactions.reduce((sum, t) => sum + t.commission, 0);
    const totalEarned = transactions.reduce((sum, t) => sum + t.netAmount, 0);

    return {
      totalTransactions: transactions.length,
      totalCommissions,
      totalEarned,
      transactions
    };
  }

  /**
   * Get total commission earned by platform
   */
  static async getPlatformCommissions() {
    const transactions = await Transaction.find({ status: 'completed' });
    return {
      totalTransactions: transactions.length,
      totalCommissions: transactions.reduce((sum, t) => sum + t.commission, 0),
      totalProcessed: transactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  /**
   * Create payment intent for card/bank transfer
   */
  static async createPaymentIntent(input: PaymentInput) {
    if (input.paymentMethod === 'cash') {
      // For cash, create but keep as pending
      return this.createPayment(input);
    }

    // For card/bank_transfer, create with pending status
    const transaction = await this.createPayment(input);
    
    // In production, integrate with Stripe/bank API here
    // For now, return transaction details
    return {
      transaction,
      clientSecret: `secret_${transaction._id}`,
      paymentIntentId: `intent_${transaction._id}`
    };
  }

  /**
   * Verify and complete cash payment
   * (In production, this would be called after verification of cash payment)
   */
  static async verifyCashPayment(transactionId: string, verifiedBy: string) {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'completed',
        metadata: {
          verifiedBy,
          verifiedAt: new Date()
        }
      },
      { new: true }
    );
    return transaction;
  }

  /**
   * Refund a transaction
   */
  static async refundPayment(transactionId: string, reason: string) {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'refunded',
        metadata: {
          refundReason: reason,
          refundedAt: new Date()
        }
      },
      { new: true }
    );
    return transaction;
  }
}
