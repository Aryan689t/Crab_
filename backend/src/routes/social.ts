import { Router } from 'express';
import {
  getConnectedAccounts,
  connectSocialAccount,
  syncSocialAccount,
  disconnectSocialAccount,
} from '../controllers/socialController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const socialRouter = Router();

socialRouter.get('/accounts', authenticateToken, requireRole('CREATOR'), getConnectedAccounts);
socialRouter.post('/:platform/connect', authenticateToken, requireRole('CREATOR'), connectSocialAccount);
socialRouter.post('/accounts/:socialAccountId/sync', authenticateToken, requireRole('CREATOR'), syncSocialAccount);
socialRouter.delete('/accounts/:socialAccountId', authenticateToken, requireRole('CREATOR'), disconnectSocialAccount);
