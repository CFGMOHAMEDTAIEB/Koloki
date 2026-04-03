# Messages & History Features Implementation Guide

## Overview

The Koloki platform now includes a complete **Messages System** for user communications and a **History System** for tracking all transactions and payments.

## Messages Feature

### Purpose
- Enable users to request property viewings
- Facilitate price negotiations between locators and property owners
- Track all inquiries and communications
- Support multiple request types with acceptance/rejection workflow

### User Flows

#### For Property Locators
1. Browse properties on Home page
2. Click "Message Host" button
3. Send inquiry or viewing request
4. Track all conversations in Messages tab
5. Receive responses from property owners

#### For Property Owners
1. Receive notifications of new messages
2. View conversations with interested locators
3. Accept or reject viewing requests
4. Respond to price negotiations
5. Manage all inquiries in one place

### Request Types

1. **Viewing Request** - Request to visit property at specific time
2. **Price Negotiation** - Propose alternative prices
3. **Inquiry** - General questions about property

### Features

- **Real-time Conversation List** with avatar and last message preview
- **Search Conversations** by participant name or property title
- **Message History** with timestamps and sender info
- **Request Handling** - Accept/reject with one-click action
- **Unread Badge** - Shows count of unread conversations
- **Read Status Tracking** - Know which messages have been read
- **Multi-language Support** - Full i18n for all messages (en, fr, ar)

### Frontend Components

#### Messages Page (`src/app/pages/Messages.tsx`)
- Conversation list with search
- Individual chat interface
- Message sending with Enter key support
- Request action buttons (Accept/Reject)
- Participant avatars and property details
- Time-based organization of messages

### Backend Implementation

#### Models

**Message** (`backend/src/models/Message.ts`)
```typescript
{
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
```

**Conversation** (`backend/src/models/Message.ts`)
```typescript
{
  participants: [{ id, name, avatar }];
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  messages: string[]; // Message IDs
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Routes (`backend/src/routes/messages.ts`)

- `GET /api/messages/conversations` - Get all conversations for user
- `GET /api/messages/conversations/:conversationId` - Get specific conversation with messages
- `POST /api/messages/conversations` - Create new conversation
- `POST /api/messages` - Send new message
- `PATCH /api/messages/:messageId/read` - Mark message as read
- `GET /api/messages/unread-count` - Get unread message count
- `GET /api/messages/search?q=query` - Search conversations

### Translation Keys

All message-related text is fully translatable:

```typescript
messages: {
  title: 'Messages',
  empty: 'No conversations yet',
  searchPlaceholder: 'Search conversations...',
  typeMessage: 'Type a message...',
  messageSent: 'Message sent',
  loginRequired: 'Please log in to view messages',
  accept: 'Accept',
  reject: 'Reject',
  requestType: {
    viewing: 'Viewing Request',
    negotiation: 'Price Negotiation',
    inquiry: 'Inquiry',
  },
  requestAccepted: 'Request accepted',
  requestRejected: 'Request rejected',
}
```

Languages: English (en), French (fr), Arabic (ar with RTL)

---

## History Feature

### Purpose
- Track all transactions (bookings, payments, commissions)
- Display payment method and status
- Show commission breakdown (10% platform, 90% owner)
- Provide transaction export capability
- Enable withdrawal management

### User Flows

#### For Locators
1. View all booking payments made
2. Check payment status and method
3. See transaction history
4. Export payment records as PDF

#### For Property Owners
1. Track all commissions earned
2. View withdrawal history
3. See net amount received vs. platform fee
4. Analyze earnings by property
5. Export financial records

### Features

- **Transaction Filtering** by type (booking, commission, withdrawal, refund)
- **Status Indicators** - Completed, Pending, Failed
- **Commission Breakdown** - See how much platform took (10%)
- **Net Amount Display** - Know exactly what owners receive (90%)
- **Statistics Cards** - Total amount, commission, transaction count
- **Date Sorting** - Newest transactions first
- **Export Button** - Download as PDF (UI ready)
- **Multi-language Support** - Full i18n (en, fr, ar)

### Frontend Components

#### History Page (`src/app/pages/History.tsx`)
- Statistics dashboard (3 metric cards)
- Transaction type filter buttons
- Transaction list with detailed breakdown
- Status color coding
- Export functionality UI
- Empty state handling
- Responsive grid layout

### Transaction Types

1. **Booking** - Payment for booking property (shows commission)
2. **Listing Fee** - Fee to list property
3. **Commission** - Commission earned by owners
4. **Withdrawal** - Money withdrawn to bank
5. **Refund** - Refunds issued

### Status States

- **Completed** - Transaction finished successfully
- **Pending** - Awaiting confirmation
- **Failed** - Transaction failed

### Analytics Data

Each transaction includes:
- Transaction ID (reference)
- Amount
- Commission (if applicable)
- Net amount (if applicable)
- Payment method (cash, card, bank transfer)
- Status
- Date
- Description/property title

### Translation Keys

```typescript
history: {
  title: 'Transaction History',
  empty: 'No transactions yet',
  loginRequired: 'Please log in to view history',
  totalAmount: 'Total Amount',
  totalCommission: 'Total Commission',
  transactions: 'Transactions',
  commission: 'Commission',
  netAmount: 'Net Amount',
  export: 'Export as PDF',
  type: {
    booking: 'Booking Payment',
    listing_fee: 'Listing Fee',
    commission: 'Commission Earned',
    withdrawal: 'Withdrawal',
    refund: 'Refund',
  },
  status: {
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
  },
}
```

Languages: English (en), French (fr), Arabic (ar with RTL)

---

## Navigation Updates

### Bottom Navigation

Added two new navigation items for authenticated users:

1. **Messages** (MessageCircle icon) - Access messaging system
2. **History** (Clock icon) - View transaction history

Navigation order:
1. Home
2. Favorites
3. Messages (authenticated only)
4. History (authenticated only)
5. Profile (authenticated only)

### Route Structure

```
/                  - Home
/favorites         - Favorites
/messages          - Messages page
/history           - History page
/profile           - Profile page
/property/:id      - Property details
```

---

## Authentication & Authorization

### Messages Access
- ✅ Login required to view/send messages
- ✅ Cannot see other users' conversations
- ✅ Only participants can access conversation
- ✅ Unread tracking per user

### History Access
- ✅ Login required to view history
- ✅ Can only view own transactions
- ✅ Owner commissions visible only to owner
- ✅ Admin can view all transaction stats

---

## Database Schema

### Message Collection
```
- conversationId (reference)
- senderId (reference)
- senderName (indexed)
- receiverId (reference)
- receiverName
- content
- isRequest (boolean)
- requestType (enum)
- propertyId (reference)
- propertyTitle
- status (read/unread)
- timestamps
```

### Conversation Collection
```
- participants (array with id, name, avatar)
- propertyId (reference, indexed)
- propertyTitle
- lastMessage (string)
- lastMessageTime (date)
- messages (array of message references)
- timestamps
```

---

## Integration with Existing Features

### Booking Integration
- Message -> Accept viewing request -> Book property -> Payment -> History

### Payment Integration
- Complete payment -> Transaction created -> Visible in History
- Commission calculated -> Owner sees in History

### Notification Integration
- New message → Notification badge in Messages
- Request accepted/rejected → Notification alert

---

## Future Enhancements

1. **Real-time Messaging** - WebSocket integration
2. **File Sharing** - Upload property images in messages
3. **Voice Messages** - Audio message support
4. **Video Call** - Direct video calls to arrange viewings
5. **Message Scheduling** - Schedule messages to send later
6. **Auto-responses** - Set automatic responses for busy times
7. **Message Templates** - Pre-defined common responses
8. **Advanced Analytics** - Engagement metrics and trends
9. **Archive Conversations** - Hide old conversations
10. **Bulk Export** - Export multiple transactions at once
11. **Tax Reports** - Generate tax documentation
12. **Recurring Withdrawals** - Automatic payout scheduling
13. **Message Notifications** - Email/SMS alerts
14. **Telegram Integration** - Messages via Telegram
15. **Chatbot** - AI assistant for common questions

---

## Testing Checklist

### Messages Feature
- [ ] Create new conversation
- [ ] Send message successfully
- [ ] View conversation history
- [ ] Search conversations by name/property
- [ ] Accept viewing request
- [ ] Reject viewing request
- [ ] Mark message as read
- [ ] See unread badge
- [ ] Different request types work
- [ ] Multi-language support
- [ ] RTL works for Arabic

### History Feature
- [ ] View all transactions
- [ ] Filter by transaction type
- [ ] See correct commission calculation
- [ ] See correct net amount
- [ ] View all 5 transaction types
- [ ] See all 3 status states
- [ ] Statistics update correctly
- [ ] Date sorting works
- [ ] Export button visible
- [ ] Multi-language support
- [ ] RTL works for Arabic

### Navigation
- [ ] Messages tab visible for authenticated users
- [ ] History tab visible for authenticated users
- [ ] Tabs hidden for guest users
- [ ] All tabs responsive on mobile
- [ ] Active tab highlighting works
- [ ] Navigation between pages works

### Authorization
- [ ] Cannot view others' messages
- [ ] Cannot view others' history
- [ ] Cannot send messages as guest
- [ ] Login required message shows

---

## Performance Considerations

- Message queries are indexed by conversationId and senderId
- History queries are indexed by userId and date
- Pagination recommended for large message histories
- Lazy loading for conversation lists
- Avatar images use caching

---

## Deployment Notes

1. Run database migrations for Message and Conversation collections
2. No environment variables required for base functionality
3. Enable read replicas for high-traffic conversations
4. Set up message retention policy (e.g., delete after 1 year)
5. Configure file storage for future image/voice features
6. Set up email notifications service
7. Monitor message queue for performance

---

## Troubleshooting

### Common Issues

**Q: Messages not appearing in conversation?**
A: Check that conversationId matches and Socket connection is established

**Q: History showing wrong commission?**
A: Verify Commission Rate = 0.1 (10%) in Payment Service

**Q: Translation keys missing?**
A: Ensure keys are added to all three language objects in translations.ts

**Q: Unread count not updating?**
A: Refresh page or verify message status is being updated to 'read'

---

## API Documentation

### Send Message Example
```
POST /api/messages

{
  "conversationId": "conv-123",
  "receiverId": "user-456",
  "receiverName": "Ahmed",
  "content": "Can we schedule a viewing?",
  "isRequest": true,
  "requestType": "viewing",
  "propertyId": "prop-789",
  "propertyTitle": "Modern Apartment"
}

Response:
{
  "id": "msg-001",
  "conversationId": "conv-123",
  "senderId": "current-user",
  "content": "Can we schedule a viewing?",
  "status": "unread",
  "timestamp": "2024-04-03T14:30:00Z"
}
```

### Get Conversation Example
```
GET /api/messages/conversations/conv-123

Response:
{
  "id": "conv-123",
  "participants": [...],
  "propertyTitle": "Modern Apartment",
  "messages": [
    { message objects with full details }
  ],
  "lastMessage": "Can we schedule a viewing?",
  "lastMessageTime": "2024-04-03T14:30:00Z"
}
```

---

## Support

For issues or questions about the Messages & History features, refer to:
- [PAYMENT_SYSTEM.md](PAYMENT_SYSTEM.md) for payment-related history
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for security considerations
- Backend API documentation in route files
