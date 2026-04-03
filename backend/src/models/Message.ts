import mongoose from 'mongoose';

interface IMessage extends mongoose.Document {
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  isRequest: boolean;
  requestType?: 'viewing' | 'negotiation' | 'inquiry';
  propertyId?: string;
  propertyTitle?: string;
  status: 'read' | 'unread';
  createdAt: Date;
  updatedAt: Date;
}

interface IConversation extends mongoose.Document {
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  messages: string[]; // References to message IDs
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  conversationId: {
    type: String,
    required: true,
    ref: 'Conversation'
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRequest: {
    type: Boolean,
    default: false
  },
  requestType: {
    type: String,
    enum: ['viewing', 'negotiation', 'inquiry'],
  },
  propertyId: String,
  propertyTitle: String,
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread'
  }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema<IConversation>({
  participants: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: String
  }],
  propertyId: {
    type: String,
    required: true,
    ref: 'Property'
  },
  propertyTitle: {
    type: String,
    required: true
  },
  lastMessage: String,
  lastMessageTime: Date,
  messages: [{
    type: String,
    ref: 'Message'
  }]
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
