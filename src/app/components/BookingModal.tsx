import { Calendar, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { useNotification } from '../context/NotificationContext';

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
  const { addNotification } = useNotification();

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

  const handleBook = () => {
    if (!startDate || !endDate || !agreedToTerms) {
      addNotification('error', 'Missing Information', 'Please fill all fields');
      return;
    }

    const booking = {
      startDate,
      endDate,
      monthlyRent: monthlyPrice,
      deposit,
      totalAmount: totalCost + deposit,
      terms: [
        'No smoking inside the property',
        'Quiet hours after 10 PM',
        'Keep common areas clean',
        'Guests allowed with advance notice',
      ],
    };

    onBooking(booking);
    addNotification(
      'success',
      'Booking Created',
      'Your booking contract has been created'
    );
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold">Book {propertyTitle}</h2>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Move-in Date</label>
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
          <label className="text-sm font-medium mb-2 block">Move-out Date</label>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Cost Breakdown */}
        {days > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Monthly Rent</span>
              <span className="font-semibold">{monthlyPrice} TND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{days} days</span>
              <span className="font-semibold">
                {(totalCost).toFixed(2)} TND
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-sm">Security Deposit (50%)</span>
              <span className="font-semibold">{(deposit).toFixed(2)} TND</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{(totalCost + deposit).toFixed(2)} TND</span>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex gap-2 mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Terms & Conditions</h3>
          </div>
          <ul className="text-xs space-y-1 ml-6 text-gray-700">
            <li>• 30-day cancellation policy</li>
            <li>• Monthly lease agreement</li>
            <li>• Utilities as specified</li>
            <li>• Security deposit refundable</li>
          </ul>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={setAgreedToTerms}
          />
          <label className="text-sm">
            I agree to the terms and conditions
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleBook} className="flex-1">
            Create Contract
          </Button>
        </div>
      </div>
    </div>
  );
}
