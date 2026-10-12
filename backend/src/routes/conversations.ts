import { Router } from 'express';
import {
  listConversations,
  getConversationById,
  sendMessage,
  acceptInvitation,
} from '../controllers/conversationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const conversationRouter = Router();

// List conversations for current authenticated user
conversationRouter.get('/', authenticateToken, listConversations);

// Retrieve single conversation by ID
conversationRouter.get('/:id', authenticateToken, getConversationById);

// Send message to conversation
conversationRouter.post('/:id/messages', authenticateToken, sendMessage);

// Accept invitation
conversationRouter.post('/accept-invitation', authenticateToken, requireRole('CREATOR'), acceptInvitation);
conversationRouter.post('/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);
