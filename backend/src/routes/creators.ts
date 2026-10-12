import { Router } from 'express';
import {
  getCreatorProfile,
  upsertCreatorProfile,
  getCreatorPublicProfile,
  getCreatorMetrics,
  completeCreatorOnboarding,
  listCreators,
} from '../controllers/creatorController.js';
import { getMyCreatorApplications } from '../controllers/applicationController.js';
import { getMyCreatorCollaborations } from '../controllers/collaborationController.js';
import { acceptInvitation } from '../controllers/conversationController.js';
import {
  getCreatorContent,
  getContentDetails,
} from '../controllers/contentController.js';
import {
  getCreatorIntelligence,
  analyzeCreatorIntelligence,
} from '../controllers/creatorIntelligenceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const creatorRouter = Router();

// Discover creators (for brands)
creatorRouter.get('/', authenticateToken, listCreators);

// Current authenticated creator profile
creatorRouter.get('/me', authenticateToken, requireRole('CREATOR'), getCreatorProfile);
creatorRouter.patch('/me', authenticateToken, requireRole('CREATOR'), upsertCreatorProfile);
creatorRouter.post('/me/onboarding', authenticateToken, requireRole('CREATOR'), completeCreatorOnboarding);
creatorRouter.post('/profile', authenticateToken, requireRole('CREATOR'), upsertCreatorProfile);
creatorRouter.get('/me/metrics', authenticateToken, requireRole('CREATOR'), getCreatorMetrics);
creatorRouter.get('/me/applications', authenticateToken, requireRole('CREATOR'), getMyCreatorApplications);
creatorRouter.get('/me/application', authenticateToken, requireRole('CREATOR'), getMyCreatorApplications);
creatorRouter.get('/me/collaborations', authenticateToken, requireRole('CREATOR'), getMyCreatorCollaborations);
creatorRouter.post('/me/requests/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);
creatorRouter.post('/me/invitations/:id/accept', authenticateToken, requireRole('CREATOR'), acceptInvitation);

// Content endpoints
creatorRouter.get('/me/content', authenticateToken, requireRole('CREATOR'), getCreatorContent);
creatorRouter.get('/me/content/:contentId', authenticateToken, requireRole('CREATOR'), getContentDetails);

// Intelligence endpoints
creatorRouter.get('/me/intelligence', authenticateToken, requireRole('CREATOR'), getCreatorIntelligence);
creatorRouter.post('/me/intelligence/analyze', authenticateToken, requireRole('CREATOR'), analyzeCreatorIntelligence);

// Public/discoverable creator endpoint
creatorRouter.get('/:creatorId', authenticateToken, getCreatorPublicProfile);
