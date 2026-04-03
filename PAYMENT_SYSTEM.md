# Payment System Implementation Guide

## Overview

The Koloki platform now includes a comprehensive payment system that supports multiple payment methods and automatically calculates 10% platform commission on each transaction.

## Key Features

### 1. **Payment Methods**
- **Hand to Hand (Cash)**: Direct payment to property owner
- **Credit/Debit Card**: Secure card payment via Stripe integration
- **Bank Transfer**: Direct bank transfer for bulk payments

### 2. **Commission Structure**
- **Platform Commission**: 10% of each transaction
- **Property Owner Receives**: 90% of transaction amount
- **Automatic Calculation**: Commission calculated and tracked for all transactions

### 3. **Transaction Types**
- Booking payments
- Listing fees
- Commission on colocation agreements
- Refunds and withdrawals

## Backend Implementation

### Transaction Model Updates

The `Transaction` model now includes:

```typescript
interface ITransaction extends mongoose.Document {
  transactionId: string;
  type: 'booking' | 'listing_fee' | 'colocation_commission' | 'refund' | 'withdrawal';
  userId: string;
  amount: number;
  commission: number;           // 10% from amount
  netAmount: number;            // 90% to owner
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  stripePaymentIntentId?: string;
  propertyId?: string;
  bookingId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  // ... other fields
}
```

### Payment Service

Located at: `backend/src/services/paymentService.ts`

Key methods:

- `calculateCommission(amount)` - Calculate 10% commission
- `calculateNetAmount(amount)` - Calculate owner receives amount (90%)
- `createPayment(input)` - Create transaction with commission
- `completePayment(transactionId)` - Mark transaction as completed
- `verifyCashPayment(transactionId, verifiedBy)` - Verify cash payments
- `getOwnerCommissions(ownerId)` - Get earnings for owner
- `getPlatformCommissions()` - Get total platform earnings

### Payment Routes

New endpoints in `backend/src/routes/payments.ts`:

#### Booking Payment
```
POST /api/payments/booking
- Creates transaction for booking
- Calculates commission automatically
```

#### Card Payment
```
POST /api/payments/card-payment
- Creates Stripe payment intent
- Tracks transaction with metadata
```

```
POST /api/payments/card-payment/confirm
- Confirms card payment completion
- Updates transaction status
```

#### Cash Payment
```
POST /api/payments/cash-payment
- Registers cash payment (pending)
- Requires verification
```

```
POST /api/payments/cash-payment/verify
- Verifies cash payment completion
- Updates transaction to confirmed
```

#### Statistics
```
GET /api/payments/stats/commissions
- Get platform commission statistics
- Admin only
```

```
GET /api/payments/earnings/:ownerId
- Get owner's earnings and commissions
- Owner or admin only
```

## Frontend Implementation

### Components

#### PaymentMethodSelector (`src/app/components/PaymentMethodSelector.tsx`)
Allows users to select payment method:
- Clean UI with three options
- Radio button selection
- Descriptions for each method
- Fully translatable

#### PaymentDialog (`src/app/components/PaymentDialog.tsx`)
Main payment interface featuring:
- Payment method selection
- Cost breakdown showing:
  - Base amount
  - Platform fee (10%)
  - Owner receives amount
  - Total to pay
- Card details input for card payments
- Commission transparency information
- Support for all 3 languages (en, fr, ar)

#### Enhanced BookingModal (`src/app/components/BookingModal.tsx`)
Updated booking flow:
1. Select dates and terms
2. Choose payment method
3. Review cost breakdown
4. Proceed to payment
5. Process via PaymentDialog

### Translation Keys

All payment-related text is fully translatable:

```typescript
payment: {
  title: 'Payment',
  selectMethod: 'Select Payment Method',
  cashMethod: 'Hand to Hand (Cash)',
  cardMethod: 'Credit/Debit Card',
  bankTransfer: 'Bank Transfer',
  costBreakdown: 'Cost Breakdown',
  baseAmount: 'Base Amount',
  platformFee: 'Platform Fee (Commission)',
  ownerReceives: 'Property Owner Receives',
  commissionInfo: 'The platform takes 10% commission from each transaction...',
  cardNumber: 'Card Number',
  expiry: 'MM/YY',
  cvc: 'CVC',
  // ... more keys
}
```

Supported languages: English, French, Arabic (with RTL)

## Commission Calculation Flow

```
1. User initiates booking for 1000 TND
2. System calculates:
   - Commission: 1000 × 0.1 = 100 TND (10%)
   - Net Amount: 1000 × 0.9 = 900 TND (90%)
3. Transaction created with both values
4. User sees breakdown in PaymentDialog:
   - Base Amount: 1000 TND
   - Platform Fee: 100 TND
   - Owner Receives: 900 TND
5. Payment processed based on method selected
6. Transaction marked as completed
7. Owner can withdraw 900 TND net amount
```

## User Experience Flow

### For Guests/Locators

1. **Browse Properties** → Select property → Click "Book Now"
2. **Set Dates** → Select move-in/move-out dates
3. **Review Terms** → Accept booking terms and conditions
4. **Choose Payment Method**:
   - Cash: Pay to owner directly
   - Card: Enter card details (encrypted)
   - Bank Transfer: Get bank details
5. **Review Breakdown**:
   - See base amount
   - Understand 10% platform fee
   - Know total cost
6. **Complete Payment** → Get confirmation
7. **Contract Created** → Booking established

### For Property Owners

1. **Receive Payment** notification
2. **View Commission Deduction**:
   - Total booking amount
   - Platform commission (10%)
   - Net amount received
3. **Access Earnings Dashboard**:
   - Total earnings
   - Total commissions paid
   - Transaction history
4. **Withdraw Funds**:
   - Bank transfer available
   - Multiple transactions bundled

## Security Considerations

1. **Card Payments**: Encrypted via Stripe
2. **Cash Payments**: Verified by both parties
3. **Bank Transfers**: Direct verification
4. **Transaction Records**: Immutable audit trail
5. **Commission Verification**: Automated calculation

## Error Handling

Payment errors are gracefully handled:

- Invalid amounts rejected
- Incomplete card info prevented
- Failed payments logged
- User notifications provided
- Transaction state maintained

## Testing the Payment System

### Manual Testing Checklist

1. **Booking with Cash Payment**
   - Select property
   - Choose dates
   - Select "Cash" payment
   - Verify UI shows correct amounts
   - See 10% commission deduction

2. **Card Payment Simulation**
   - In development, simulates Stripe
   - Full UI flow without real charges
   - Transaction created and tracked

3. **Multi-Language Support**
   - Switch language in header
   - Payment dialog updates
   - All terms and descriptions translated
   - RTL support for Arabic

4. **Commission Verification**
   - Check calculations are correct (10%)
   - Verify owner receives 90%
   - Confirm platform receives 10%

## Analytics & Reporting

The system provides insights into:

- Total transactions processed
- Total commission earned (10%)
- Average commission per transaction
- Owner earnings breakdown
- Payment method preferences
- Failed payment rates

## Future Enhancements

1. **Automated Payouts**: Daily/weekly/monthly owner payouts
2. **Invoice Generation**: PDF invoices for transactions
3. **Refund Management**: Partial and full refund support
4. **Payment Plans**: Multi-installment payment options
5. **Subscription Model**: Monthly recurring payments
6. **Tax Integration**: Tax document generation
7. **Advanced Analytics**: Business intelligence dashboard
8. **3D Secure**: Enhanced fraud protection
9. **Multiple Currencies**: Support for other currencies
10. **Payment Methods**: Apple Pay, Google Pay support

## API Documentation

### Request/Response Examples

#### Create Booking Payment
```
POST /api/payments/booking
{
  "propertyId": "prop-123",
  "bookingId": "booking-456",
  "amount": 1000,
  "paymentMethod": "cash",
  "description": "Booking payment for 30 days"
}

Response:
{
  "message": "Booking payment created",
  "transaction": {
    "transactionId": "TXN-...",
    "amount": 1000,
    "commission": 100,
    "netAmount": 900,
    "paymentMethod": "cash",
    "status": "pending"
  }
}
```

#### Get Owner Commissions
```
GET /api/payments/earnings/user-123

Response:
{
  "earnings": {
    "totalTransactions": 15,
    "totalCommissions": 450,      // 10% of all transactions
    "totalEarned": 4050,          // 90% of all transactions
    "transactions": [...]
  }
}
```

## Deployment Notes

1. Ensure `.env` has `STRIPE_SECRET_KEY` configured
2. Database migrations run automatically on first transaction
3. Commission rates are hardcoded (can be made configurable)
4. Test payment flows in development first
5. Monitor transaction logs in production

## Support & Troubleshooting

### Common Issues

**Q: Commission not calculated?**
A: Check `PaymentService.COMMISSION_RATE` constant is 0.1

**Q: Payment visible to user but not in DB?**
A: Transaction may be in 'pending' state. Check completion status.

**Q: Card payment not working?**
A: Verify Stripe API key in environment variables

**Q: Wrong commission amount?**
A: Run `npm run build` to ensure calculations are updated

## Documentation Files

- `PAYMENT_SYSTEM.md` - This file
- `backend/src/services/paymentService.ts` - Service logic
- `backend/src/routes/payments.ts` - API routes
- `src/app/components/PaymentDialog.tsx` - Payment UI
- `src/app/translations/translations.ts` - i18n keys
