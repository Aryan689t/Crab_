import { Router } from 'express';
import { getBrandProfile, upsertBrandProfile, getBrandPublicProfile } from '../controllers/brandController.js';
import { getMyBrandCampaigns } from '../controllers/campaignController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const brandRouter = Router();

// Current authenticated brand endpoints
brandRouter.get('/me', authenticateToken, requireRole('BRAND'), getBrandProfile);
brandRouter.get('/me/campaigns', authenticateToken, requireRole('BRAND'), getMyBrandCampaigns);
brandRouter.patch('/me', authenticateToken, requireRole('BRAND'), upsertBrandProfile);
brandRouter.post('/profile', authenticateToken, requireRole('BRAND'), upsertBrandProfile);

// Public/discoverable brand endpoint
brandRouter.get('/:brandId', authenticateToken, getBrandPublicProfile);
