import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
} from '../controllers/campaignController.js';
import {
  getCampaignIntelligenceHandler,
  analyzeCampaignIntelligenceHandler,
} from '../controllers/campaignIntelligenceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const campaignRouter = Router();

// GET /api/campaigns - List published campaigns for creator discovery
campaignRouter.get('/', authenticateToken, getCampaigns);

// Campaign Intelligence endpoints (Requires BRAND role)
campaignRouter.get('/:id/intelligence', authenticateToken, requireRole('BRAND'), getCampaignIntelligenceHandler);
campaignRouter.post('/:id/intelligence/analyze', authenticateToken, requireRole('BRAND'), analyzeCampaignIntelligenceHandler);

// GET /api/campaigns/:id - Retrieve campaign details
campaignRouter.get('/:id', authenticateToken, getCampaignById);

// POST /api/campaigns - Create a campaign (Requires BRAND role)
campaignRouter.post('/', authenticateToken, requireRole('BRAND'), createCampaign);
