import { Router } from 'express';
import {
  getMyCreatorCollaborations,
  getMyBrandCollaborations,
  getCollaborationById,
  submitCollaborationDeliverable,
  reviewCollaborationDeliverable,
} from '../controllers/collaborationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const collaborationRouter = Router();

// Single collaboration detail
collaborationRouter.get('/:id', authenticateToken, getCollaborationById);

// Creator submits a verified YouTube video to deliverable
collaborationRouter.post('/:id/submit-video', authenticateToken, requireRole('CREATOR'), submitCollaborationDeliverable);

// Brand reviews and approves/rejects deliverable
collaborationRouter.post('/:id/review-deliverable', authenticateToken, requireRole('BRAND'), reviewCollaborationDeliverable);
