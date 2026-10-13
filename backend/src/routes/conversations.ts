import { Router } from 'express';
import multer from 'multer';
import {
  listConversations,
  getConversationById,
  sendMessage,
  acceptInvitation,
  initiateConversation,
  markMessagesAsRead,
  downloadAttachment,
  getNotifications,
  markAllNotificationsAsRead,
} from '../controllers/conversationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const conversationRouter = Router();

// In-memory buffer parser for uploads up to 10 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Real-time message notifications endpoints
export const notificationRouter = Router();
notificationRouter.get('/', authenticateToken, getNotifications);
notificationRouter.post('/mark-all-read', authenticateToken, markAllNotificationsAsRead);

conversationRouter.get('/notifications', authenticateToken, getNotifications);
conversationRouter.post('/notifications/mark-all-read', authenticateToken, markAllNotificationsAsRead);

// List conversations for current authenticated user
conversationRouter.get('/', authenticateToken, listConversations);

// Initiate conversation or retrieve existing thread
conversationRouter.post('/', authenticateToken, initiateConversation);
conversationRouter.post('/initiate', authenticateToken, initiateConversation);

// Retrieve single conversation by ID
conversationRouter.get('/:id', authenticateToken, getConversationById);

// Send message to conversation (supports JSON text, or multipart/form-data with file)
conversationRouter.post(
  '/:id/messages',
  authenticateToken,
  upload.single('file'),
  sendMessage
);

// Authenticated attachment download/stream
conversationRouter.get('/:id/attachments/:attachmentId/download', authenticateToken, downloadAttachment);
conversationRouter.get('/:id/attachments/:attachmentId', authenticateToken, downloadAttachment);

// Mark conversation messages as read
conversationRouter.post('/:id/read', authenticateToken, markMessagesAsRead);
conversationRouter.patch('/:id/read', authenticateToken, markMessagesAsRead);

// Accept invitation
conversationRouter.post('/accept-invitation', authenticateToken, requireRole('CREATOR'), acceptInvitation);
conversationRouter.post('/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);
