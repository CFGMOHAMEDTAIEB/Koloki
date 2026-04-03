import { CreditCard, Banknote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PaymentMethodSelectorProps {
  selectedMethod: 'cash' | 'card' | 'bank_transfer';
  onSelectMethod: (method: 'cash' | 'card' | 'bank_transfer') => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  const { t } = useLanguage();

  const methods = [
    {
      id: 'cash' as const,
      name: t('payment.cashMethod'),
      description: t('payment.cashDescription'),
      icon: Banknote,
    },
    {
      id: 'card' as const,
      name: t('payment.cardMethod'),
      description: t('payment.cardDescription'),
      icon: CreditCard,
    },
    {
      id: 'bank_transfer' as const,
      name: t('payment.bankTransfer'),
      description: t('payment.bankTransferDescription'),
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t('payment.selectMethod')}</label>
      <div className="space-y-2">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-start gap-3 ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${
                selectedMethod === method.id
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-xs text-gray-500">{method.description}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                selectedMethod === method.id
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === method.id && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
