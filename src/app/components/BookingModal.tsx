import { Calendar, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentDialog } from './PaymentDialog';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  monthlyPrice: number;
  onBooking: (booking: any) => void;
}

export function BookingModal({
  open,
  onOpenChange,
  propertyTitle,
  monthlyPrice,
  onBooking,
}: BookingModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { addNotification } = useNotification();
  const { t } = useLanguage();

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const days = calculateDays();
  const totalCost = days * (monthlyPrice / 30);
  const deposit = totalCost * 0.5;
  const totalAmount = totalCost + deposit;

  const handleProceedToPayment = () => {
    if (!startDate || !endDate || !agreedToTerms) {
      addNotification('error', t('common.error'), t('booking.fillAllFields'));
      return;
    }

    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    const booking = {
      startDate,
      endDate,
      monthlyRent: monthlyPrice,
      deposit,
      totalAmount,
      totalCost,
      days,
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      terms: [
        t('booking.noSmoking'),
        t('booking.quietHours'),
        t('booking.keepClean'),
        t('booking.guestsAllowed'),
      ],
    };

    onBooking(booking);
    addNotification(
      'success',
      t('booking.createSuccess'),
      t('booking.contractCreated')
    );
    onOpenChange(false);
    setShowPaymentDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setAgreedToTerms(false);
    setPaymentMethod('cash');
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold">{t('booking.book')} {propertyTitle}</h2>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">{t('booking.moveInDate')}</label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">{t('booking.moveOutDate')}</label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Cost Summary */}
          {days > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg space-y-2 border border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('booking.duration')}</span>
                <span className="font-semibold">{days} {t('booking.days')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('booking.dailyRate')}</span>
                <span className="font-semibold">{(monthlyPrice / 30).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-2">
                <span className="text-gray-600">{t('booking.rentalCost')}</span>
                <span className="font-semibold text-gray-900">{totalCost.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('booking.securityDeposit')}</span>
                <span className="font-semibold text-blue-600">{deposit.toFixed(2)} TND (50%)</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-white px-2 rounded border border-green-200">
                <span className="font-semibold text-gray-900">{t('booking.totalAmount')}</span>
                <span className="font-bold text-green-600 text-lg">{totalAmount.toFixed(2)} TND</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('payment.selectMethod')}</label>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
                {t('booking.agreeToTerms')}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              variant="outline"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={!startDate || !endDate || !agreedToTerms || days <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {t('booking.proceedToPayment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={totalAmount}
        description={`${t('booking.rentPayment')} - ${days} ${t('booking.days')}`}
        propertyTitle={propertyTitle}
        onPayment={handlePaymentSuccess}
      />
    </>
  );
}
