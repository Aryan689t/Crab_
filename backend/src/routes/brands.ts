import { Router } from 'express';
import { getBrandProfile, upsertBrandProfile, getBrandPublicProfile, getBrandRecentActivity } from '../controllers/brandController.js';
import { getMyBrandCampaigns } from '../controllers/campaignController.js';
import { getMyBrandApplications } from '../controllers/applicationController.js';
import { getMyBrandCollaborations } from '../controllers/collaborationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const brandRouter = Router();

// Current authenticated brand endpoints
brandRouter.get('/me', authenticateToken, requireRole('BRAND'), getBrandProfile);
brandRouter.get('/me/activity', authenticateToken, requireRole('BRAND'), getBrandRecentActivity);
brandRouter.get('/me/campaigns', authenticateToken, requireRole('BRAND'), getMyBrandCampaigns);
brandRouter.get('/me/applications', authenticateToken, requireRole('BRAND'), getMyBrandApplications);
brandRouter.get('/me/application', authenticateToken, requireRole('BRAND'), getMyBrandApplications);
brandRouter.get('/me/collaborations', authenticateToken, requireRole('BRAND'), getMyBrandCollaborations);
brandRouter.patch('/me', authenticateToken, requireRole('BRAND'), upsertBrandProfile);
brandRouter.post('/profile', authenticateToken, requireRole('BRAND'), upsertBrandProfile);

// Public/discoverable brand endpoint
brandRouter.get('/:brandId', authenticateToken, getBrandPublicProfile);
