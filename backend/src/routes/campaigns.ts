import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
} from '../controllers/campaignController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const campaignRouter = Router();

// GET /api/campaigns - List published campaigns for creator discovery
campaignRouter.get('/', authenticateToken, getCampaigns);

// GET /api/campaigns/:id - Retrieve campaign details
campaignRouter.get('/:id', authenticateToken, getCampaignById);

// POST /api/campaigns - Create a campaign (Requires BRAND role)
campaignRouter.post('/', authenticateToken, requireRole('BRAND'), createCampaign);
