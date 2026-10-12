import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
} from '../controllers/campaignController.js';
import {
  applyToCampaign,
  getCampaignApplications,
} from '../controllers/applicationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const campaignRouter = Router();

// GET /api/campaigns - List published campaigns for creator discovery
campaignRouter.get('/', authenticateToken, getCampaigns);

// GET /api/campaigns/:id - Retrieve campaign details
campaignRouter.get('/:id', authenticateToken, getCampaignById);

// POST /api/campaigns - Create a campaign (Requires BRAND role)
campaignRouter.post('/', authenticateToken, requireRole('BRAND'), createCampaign);

// POST /api/campaigns/:id/applications (and :id/apply) - Apply to campaign (Requires CREATOR role)
campaignRouter.post('/:id/applications', authenticateToken, requireRole('CREATOR'), applyToCampaign);
campaignRouter.post('/:id/application', authenticateToken, requireRole('CREATOR'), applyToCampaign);
campaignRouter.post('/:id/apply', authenticateToken, requireRole('CREATOR'), applyToCampaign);

// GET /api/campaigns/:id/applications - List applications for brand's campaign (Requires BRAND role)
campaignRouter.get('/:id/applications', authenticateToken, requireRole('BRAND'), getCampaignApplications);
campaignRouter.get('/:id/application', authenticateToken, requireRole('BRAND'), getCampaignApplications);

