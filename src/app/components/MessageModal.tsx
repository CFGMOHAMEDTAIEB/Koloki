import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostName: string;
  propertyTitle: string;
  onSendMessage: (message: string) => void;
}

export function MessageModal({
  open,
  onOpenChange,
  hostName,
  propertyTitle,
  onSendMessage,
}: MessageModalProps) {
  const [message, setMessage] = useState('');
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      addNotification(
        'success',
        'Message Sent',
        `Your message to ${hostName} has been sent`
      );
      setMessage('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Message to {hostName}</p>
            <p className="font-semibold">{propertyTitle}</p>
          </div>
          <button onClick={() => onOpenChange(false)}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-600">
            Inquiry about: {propertyTitle}
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
