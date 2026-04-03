import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  propertyTitle: string;
  propertyId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRequest: boolean;
  requestType?: 'viewing' | 'negotiation' | 'inquiry';
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: 'user-2',
    participantName: 'Ahmed Ben Ali',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    propertyTitle: 'Modern Apartment in Tunis',
    propertyId: '1',
    lastMessage: 'Can we schedule a viewing for tomorrow?',
    lastMessageTime: '2 hours ago',
    unread: 2,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-2',
        senderName: 'Ahmed Ben Ali',
        content: 'Hi, I\'m interested in your apartment',
        timestamp: '2024-04-03 10:30 AM',
        isRequest: false,
      },
      {
        id: 'msg-2',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Great! When would you like to visit?',
        timestamp: '2024-04-03 10:35 AM',
        isRequest: false,
      },
      {
        id: 'msg-3',
        senderId: 'user-2',
        senderName: 'Ahmed Ben Ali',
        content: 'Can we schedule a viewing for tomorrow?',
        timestamp: '2024-04-03 10:40 AM',
        isRequest: true,
        requestType: 'viewing',
      },
    ],
  },
  {
    id: '2',
    participantId: 'user-3',
    participantName: 'Leila Bouali',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leila',
    propertyTitle: 'Cozy Room in Sousse',
    propertyId: '2',
    lastMessage: 'What is the final price?',
    lastMessageTime: '4 hours ago',
    unread: 0,
    messages: [
      {
        id: 'msg-4',
        senderId: 'user-3',
        senderName: 'Leila Bouali',
        content: 'The room looks nice, can we negotiate the price?',
        timestamp: '2024-04-03 08:00 AM',
        isRequest: true,
        requestType: 'negotiation',
      },
    ],
  },
];

export function Messages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: user?.name || 'You',
      content: messageText,
      timestamp: new Date().toLocaleString(),
      isRequest: false,
    };

    setConversations(
      conversations.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageText,
              lastMessageTime: 'now',
            }
          : conv
      )
    );

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: 'now',
    });

    setMessageText('');
    addNotification('success', t('common.success'), t('messages.messageSent'));
  };

  const handleAcceptRequest = (messageId: string) => {
    if (!selectedConversation) return;
    addNotification('success', t('common.success'), t('messages.requestAccepted'));
  };

  const handleRejectRequest = (messageId: string) => {
    if (!selectedConversation) return;
    addNotification('success', t('common.success'), t('messages.requestRejected'));
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('auth.login')}</h2>
        <p className="text-gray-500">{t('messages.loginRequired')}</p>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <img
                src={selectedConversation.participantAvatar}
                alt={selectedConversation.participantName}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{selectedConversation.participantName}</p>
                <p className="text-xs text-gray-500">{selectedConversation.propertyTitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  msg.senderId === 'current-user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.isRequest && (
                  <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                    <p className="text-xs font-semibold mb-2 opacity-80">
                      {t(`messages.requestType.${msg.requestType}`)}
                    </p>
                    {msg.senderId !== 'current-user' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(msg.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded"
                        >
                          {t('messages.accept')}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(msg.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 rounded"
                        >
                          {t('messages.reject')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4 flex gap-2">
          <Input
            placeholder={t('messages.typeMessage')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold mb-4">{t('messages.title')}</h1>
        <Input
          placeholder={t('messages.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">{t('messages.empty')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className="w-full p-4 bg-white border-b hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={conversation.participantAvatar}
                    alt={conversation.participantName}
                    className="h-12 w-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-sm">{conversation.participantName}</p>
                      {conversation.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conversation.propertyTitle}</p>
                    <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conversation.lastMessageTime}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
