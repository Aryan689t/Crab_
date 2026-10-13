import { Router } from 'express';
import {
  listConversations,
  getConversationById,
  sendMessage,
  acceptInvitation,
  initiateConversation,
  markMessagesAsRead,
} from '../controllers/conversationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const conversationRouter = Router();

// List conversations for current authenticated user
conversationRouter.get('/', authenticateToken, listConversations);

// Initiate conversation or retrieve existing thread
conversationRouter.post('/', authenticateToken, initiateConversation);
conversationRouter.post('/initiate', authenticateToken, initiateConversation);

// Retrieve single conversation by ID
conversationRouter.get('/:id', authenticateToken, getConversationById);

// Send message to conversation
conversationRouter.post('/:id/messages', authenticateToken, sendMessage);

// Mark conversation messages as read
conversationRouter.post('/:id/read', authenticateToken, markMessagesAsRead);
conversationRouter.patch('/:id/read', authenticateToken, markMessagesAsRead);

// Accept invitation
conversationRouter.post('/accept-invitation', authenticateToken, requireRole('CREATOR'), acceptInvitation);
conversationRouter.post('/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);

