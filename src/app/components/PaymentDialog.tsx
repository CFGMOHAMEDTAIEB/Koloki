import { X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  propertyTitle: string;
  onPayment: (paymentDetails: PaymentDetails) => void;
}

export interface PaymentDetails {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  transactionId?: string;
  cardNumber?: string;
}

const COMMISSION_RATE = 0.1; // 10%

function calculateCommission(amount: number): number {
  return Math.round(amount * COMMISSION_RATE * 100) / 100;
}

function calculateNetAmount(amount: number): number {
  return Math.round(amount * (1 - COMMISSION_RATE) * 100) / 100;
}

export function PaymentDialog({
  open,
  onOpenChange,
  amount,
  description,
  propertyTitle,
  onPayment,
}: PaymentDialogProps) {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const commission = calculateCommission(amount);
  const netAmount = calculateNetAmount(amount);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      addNotification('error', t('payment.error'), t('payment.invalidAmount'));
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCVC) {
        addNotification('error', t('payment.error'), t('payment.incompleteCardInfo'));
        return;
      }
    }

    setIsProcessing(true);

    try {
      const paymentDetails: PaymentDetails = {
        amount,
        paymentMethod,
        ...(paymentMethod === 'card' && { cardNumber }),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPayment(paymentDetails);
      addNotification(
        'success',
        t('payment.success'),
        t('payment.paymentProcessed')
      );
      onOpenChange(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
    } catch (error) {
      addNotification('error', t('payment.error'), t('payment.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('payment.title')}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Booking Details */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg space-y-2 border border-blue-200">
          <div className="text-sm font-medium text-gray-600">{t('payment.bookingDetails')}</div>
          <div className="font-semibold text-gray-900">{propertyTitle}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-gray-600 mb-3">{t('payment.costBreakdown')}</div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">{t('payment.baseAmount')}</span>
            <span className="font-semibold text-gray-900">{amount.toFixed(2)} TND</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">{t('payment.platformFee')}</span>
            <span className="font-semibold text-blue-600">{commission.toFixed(2)} TND (10%)</span>
          </div>

          <div className="flex justify-between items-center py-2 bg-green-50 px-2 rounded">
            <span className="font-semibold text-gray-900">{t('payment.ownerReceives')}</span>
            <span className="font-bold text-green-600">{netAmount.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Info Alert */}
        <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">{t('payment.commissionInfo')}</p>
        </div>

        {/* Payment Method Selection */}
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onSelectMethod={setPaymentMethod}
        />

        {/* Card Details (if card selected) */}
        {paymentMethod === 'card' && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-600">{t('payment.cardDetails')}</div>
            
            <Input
              placeholder={t('payment.cardNumber')}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              maxLength={16}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t('payment.expiry')}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
              />
              <Input
                placeholder={t('payment.cvc')}
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? t('payment.processing') : `${t('payment.pay')} ${amount.toFixed(2)} TND`}
          </Button>
        </div>
      </div>
    </div>
  );
}
