import { Router } from 'express';
import {
  getConnectedAccounts,
  getYouTubeAuthUrl,
  handleYouTubeOAuthCallback,
  getYouTubeVideos,
  syncYouTubeAccount,
  connectYouTubeManual,
  disconnectSocialAccount,
} from '../controllers/socialController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const socialRouter = Router();

// 1. YouTube OAuth 2.0 public callback
socialRouter.get('/youtube/callback', handleYouTubeOAuthCallback);

// 2. Creator Social Account Management (Auth required)
socialRouter.get('/accounts', authenticateToken, requireRole('CREATOR'), getConnectedAccounts);
socialRouter.get('/youtube/auth-url', authenticateToken, requireRole('CREATOR'), getYouTubeAuthUrl);
socialRouter.get('/youtube/videos', authenticateToken, requireRole('CREATOR'), getYouTubeVideos);
socialRouter.post('/youtube/sync', authenticateToken, requireRole('CREATOR'), syncYouTubeAccount);
socialRouter.post('/youtube/connect-manual', authenticateToken, requireRole('CREATOR'), connectYouTubeManual);
socialRouter.delete('/accounts/:socialAccountId', authenticateToken, requireRole('CREATOR'), disconnectSocialAccount);
