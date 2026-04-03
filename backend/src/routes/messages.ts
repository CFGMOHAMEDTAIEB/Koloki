import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/errorHandler';
import { Message, Conversation } from '../models/Message';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all conversations for a user
router.get('/conversations', verifyToken, async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find({
      'participants.id': req.user.userId
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific conversation with messages
router.get('/conversations/:conversationId', verifyToken, async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate({
        path: 'messages',
        select: 'senderId senderName receiverId content isRequest requestType status createdAt'
      });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === req.user.userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new conversation
router.post('/conversations', verifyToken, async (req: Request, res: Response) => {
  try {
    const { propertyId, propertyTitle, participantId, participantName, participantAvatar } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      propertyId,
      'participants.id': participantId
    });

    if (conversation) {
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [
        { id: req.user.userId, name: req.user.name },
        { id: participantId, name: participantName, avatar: participantAvatar }
      ],
      propertyId,
      propertyTitle,
      messages: []
    });

    await conversation.save();
    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/messages', verifyToken, async (req: Request, res: Response) => {
  try {
    const { conversationId, receiverId, receiverName, content, isRequest, requestType, propertyId, propertyTitle } = req.body;

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: req.user.userId,
      senderName: req.user.name,
      receiverId,
      receiverName,
      content,
      isRequest: isRequest || false,
      requestType,
      propertyId,
      propertyTitle,
      status: 'unread'
    });

    await message.save();

    // Update conversation
    conversation.messages.push(message._id as any);
    conversation.lastMessage = content;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/messages/:messageId/read', verifyToken, async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status: 'read' },
      { new: true }
    );

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread message count
router.get('/unread-count', verifyToken, async (req: Request, res: Response) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user.userId,
      status: 'unread'
    });

    res.json({ unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search conversations
router.get('/search', verifyToken, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    const conversations = await Conversation.find({
      'participants.id': req.user.userId,
      $or: [
        { propertyTitle: { $regex: q, $options: 'i' } },
        { 'participants.name': { $regex: q, $options: 'i' } }
      ]
    });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const messageRoutes = router;
