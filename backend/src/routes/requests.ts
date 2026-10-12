import { Router } from 'express';
import { acceptInvitation } from '../controllers/conversationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const requestRouter = Router();

// POST /api/requests/:id/accept
requestRouter.post('/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);

// POST /api/requests/:id/decline
requestRouter.post('/:id/decline', authenticateToken, requireRole('CREATOR'), (req, res) => {
  res.status(200).json({
    message: 'Invitation declined successfully.',
    data: { requestId: req.params.id, status: 'DECLINED' },
  });
});
