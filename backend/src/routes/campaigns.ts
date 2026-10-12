import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
} from '../controllers/campaignController.js';
import {
  getCampaignIntelligenceHandler,
  analyzeCampaignIntelligenceHandler,
  getCampaignMatchesHandler,
  getCampaignCollisionRadarHandler,
  getCampaignShortlistHandler,
  addToShortlistHandler,
  removeFromShortlistHandler,
  updateShortlistStatusHandler,
} from '../controllers/campaignIntelligenceController.js';
import {
  applyToCampaign,
  getCampaignApplications,
} from '../controllers/applicationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const campaignRouter = Router();

// GET /api/campaigns - List published campaigns for creator discovery
campaignRouter.get('/', authenticateToken, getCampaigns);

// Campaign Intelligence & Matching endpoints (Requires BRAND role)
campaignRouter.get('/:id/intelligence', authenticateToken, requireRole('BRAND'), getCampaignIntelligenceHandler);
campaignRouter.post('/:id/intelligence/analyze', authenticateToken, requireRole('BRAND'), analyzeCampaignIntelligenceHandler);
campaignRouter.get('/:id/matches', authenticateToken, requireRole('BRAND'), getCampaignMatchesHandler);
campaignRouter.get('/:id/collision-radar', authenticateToken, requireRole('BRAND'), getCampaignCollisionRadarHandler);

// Campaign Shortlist endpoints (Requires BRAND role)
campaignRouter.get('/:id/shortlist', authenticateToken, requireRole('BRAND'), getCampaignShortlistHandler);
campaignRouter.post('/:id/shortlist', authenticateToken, requireRole('BRAND'), addToShortlistHandler);
campaignRouter.delete('/:id/shortlist/:creatorId', authenticateToken, requireRole('BRAND'), removeFromShortlistHandler);
campaignRouter.patch('/:id/shortlist/:creatorId', authenticateToken, requireRole('BRAND'), updateShortlistStatusHandler);

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

