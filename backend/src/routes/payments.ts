import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { verifyToken } from '../middleware/errorHandler';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake');

// Create payment intent for listing fee
router.post('/listing-fee', verifyToken, async (req: Request, res: Response) => {
  try {
    const { propertyId, amount } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (property.listingFee.paid) {
      return res.status(400).json({ error: 'Listing fee already paid' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'tnd',
      metadata: {
        propertyId,
        userId: req.user.userId,
        type: 'listing_fee'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm listing fee payment
router.post('/listing-fee/confirm', verifyToken, async (req: Request, res: Response) => {
  try {
    const { propertyId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment did not succeed' });
    }

    // Update property
    const property = await Property.findByIdAndUpdate(
      propertyId,
      {
        'listingFee.paid': true,
        'listingFee.paidAt': new Date(),
        status: 'active'
      },
      { new: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      transactionId: uuidv4(),
      type: 'listing_fee',
      userId: req.user.userId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'completed',
      stripePaymentIntentId: paymentIntentId,
      propertyId: propertyId.toString(),
      description: `Listing fee for property: ${property?.title}`,
      metadata: {
        propertyId,
        listingId: property?._id
      }
    });

    await transaction.save();

    res.json({
      message: 'Listing fee paid successfully',
      property,
      transaction
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Commission payment (10% on confirmed colocation)
router.post('/commission', verifyToken, async (req: Request, res: Response) => {
  try {
    const { colocationId, ownerUserId, totalAmount, description } = req.body;

    const commissionAmount = totalAmount * 0.10; // 10% commission

    const transaction = new Transaction({
      transactionId: uuidv4(),
      type: 'colocation_commission',
      userId: ownerUserId,
      amount: commissionAmount,
      currency: 'TND',
      status: 'completed',
      colocationId,
      description: description || 'Colocation confirmation commission',
      metadata: {
        totalAmount,
        commissionPercent: 10,
        colocationId
      }
    });

    await transaction.save();

    // Add to owner's wallet
    await User.findByIdAndUpdate(ownerUserId, {
      $inc: { 'wallet.balance': commissionAmount }
    });

    res.json({
      message: 'Commission recorded',
      transaction,
      commissionAmount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/history/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    if (req.user.userId !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const paymentRoutes = router;
