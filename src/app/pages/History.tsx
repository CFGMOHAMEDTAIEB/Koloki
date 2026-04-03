import { Clock, TrendingUp, CreditCard, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  id: string;
  type: 'booking' | 'listing_fee' | 'commission' | 'withdrawal' | 'refund';
  date: string;
  amount: number;
  commission?: number;
  netAmount?: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  propertyTitle?: string;
  referenceId: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'booking',
    date: '2024-04-02',
    amount: 1000,
    commission: 100,
    netAmount: 900,
    paymentMethod: 'card',
    status: 'completed',
    description: 'Booking payment',
    propertyTitle: 'Modern Apartment in Tunis',
    referenceId: 'TXN-001',
  },
  {
    id: '2',
    type: 'commission',
    date: '2024-04-01',
    amount: 50,
    paymentMethod: 'card',
    status: 'completed',
    description: 'Commission earned',
    propertyTitle: 'Cozy Room in Sousse',
    referenceId: 'COM-001',
  },
  {
    id: '3',
    type: 'booking',
    date: '2024-03-30',
    amount: 800,
    commission: 80,
    netAmount: 720,
    paymentMethod: 'cash',
    status: 'completed',
    description: 'Booking payment',
    propertyTitle: 'Studio in La Marsa',
    referenceId: 'TXN-002',
  },
  {
    id: '4',
    type: 'withdrawal',
    date: '2024-03-25',
    amount: 5000,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    description: 'Withdrawal to bank account',
    referenceId: 'WD-001',
  },
  {
    id: '5',
    type: 'refund',
    date: '2024-03-20',
    amount: 500,
    paymentMethod: 'card',
    status: 'completed',
    description: 'Refund issued',
    propertyTitle: 'Apartment in Sfax',
    referenceId: 'RTN-001',
  },
];

export function History() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions =
    filterType === 'all' ? transactions : transactions.filter(t => t.type === filterType);

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = filteredTransactions
    .filter(t => t.commission)
    .reduce((sum, t) => sum + (t.commission || 0), 0);
  const completedCount = filteredTransactions.filter(t => t.status === 'completed').length;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      booking: 'bg-blue-100 text-blue-700',
      listing_fee: 'bg-purple-100 text-purple-700',
      commission: 'bg-green-100 text-green-700',
      withdrawal: 'bg-orange-100 text-orange-700',
      refund: 'bg-red-100 text-red-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    return type === 'commission' || type === 'withdrawal' ? TrendingUp : CreditCard;
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <Clock className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('auth.login')}</h2>
        <p className="text-gray-500">{t('history.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold mb-4">{t('history.title')}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <p className="text-xs text-gray-600">{t('history.totalAmount')}</p>
            <p className="text-lg font-bold text-blue-700">{totalAmount.toFixed(2)} TND</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <p className="text-xs text-gray-600">{t('history.totalCommission')}</p>
            <p className="text-lg font-bold text-green-700">{totalCommission.toFixed(2)} TND</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <p className="text-xs text-gray-600">{t('history.transactions')}</p>
            <p className="text-lg font-bold text-purple-700">{completedCount}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('common.all')}
            </button>
            {['booking', 'commission', 'withdrawal', 'refund'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(`history.type.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-4">
            <Clock className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">{t('history.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredTransactions.map(tx => {
              const TypeIcon = getTypeIcon(tx.type);
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(tx.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{t(`history.type.${tx.type}`)}</p>
                        {tx.propertyTitle && <p className="text-xs text-gray-500">{tx.propertyTitle}</p>}
                        <p className="text-xs text-gray-400 mt-1">{tx.referenceId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {tx.amount > 0 ? '+' : '-'}{tx.amount.toFixed(2)} TND
                      </p>
                      <p className={`text-xs font-semibold ${getStatusColor(tx.status)}`}>
                        {t(`history.status.${tx.status}`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span className="text-gray-400">•</span>
                      <span>{t(`payment.${tx.paymentMethod}` as any) || tx.paymentMethod}</span>
                    </div>
                    {tx.commission !== undefined && (
                      <div className="text-blue-600">
                        {t('history.commission')}: {tx.commission.toFixed(2)} TND
                      </div>
                    )}
                    {tx.netAmount !== undefined && (
                      <div className="text-green-600">
                        {t('history.netAmount')}: {tx.netAmount.toFixed(2)} TND
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Button */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white border-t p-4 flex justify-end">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            {t('history.export')}
          </Button>
        </div>
      )}
    </div>
  );
}
