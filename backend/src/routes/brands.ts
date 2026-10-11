import { Router } from 'express';
import {
  getBrandProfile,
  upsertBrandProfile,
  getBrandPublicProfile,
} from '../controllers/brandController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const brandRouter = Router();

// Current authenticated brand endpoints
brandRouter.get('/me', authenticateToken, requireRole('BRAND'), getBrandProfile);
brandRouter.patch('/me', authenticateToken, requireRole('BRAND'), upsertBrandProfile);
brandRouter.post('/profile', authenticateToken, requireRole('BRAND'), upsertBrandProfile);

// Public/discoverable brand endpoint
brandRouter.get('/:brandId', authenticateToken, getBrandPublicProfile);
