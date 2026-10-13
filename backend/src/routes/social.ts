import { Router } from 'express';
import {
  getConnectedAccounts,
  getYouTubeAuthUrl,
  handleYouTubeOAuthCallback,
  getYouTubeVideos,
  syncYouTubeAccount,
  connectYouTubeManual,
  getInstagramAuthUrl,
  handleInstagramOAuthCallback,
  getInstagramMedia,
  syncInstagramAccount,
  connectInstagramManual,
  disconnectSocialAccount,
} from '../controllers/socialController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const socialRouter = Router();

// 1. OAuth Public Callbacks
socialRouter.get('/youtube/callback', handleYouTubeOAuthCallback);
socialRouter.get('/instagram/callback', handleInstagramOAuthCallback);

// 2. Creator Social Account Management (Auth required)
socialRouter.get('/accounts', authenticateToken, requireRole('CREATOR'), getConnectedAccounts);

// YouTube
socialRouter.get('/youtube/auth-url', authenticateToken, requireRole('CREATOR'), getYouTubeAuthUrl);
socialRouter.get('/youtube/videos', authenticateToken, requireRole('CREATOR'), getYouTubeVideos);
socialRouter.post('/youtube/sync', authenticateToken, requireRole('CREATOR'), syncYouTubeAccount);
socialRouter.post('/youtube/connect-manual', authenticateToken, requireRole('CREATOR'), connectYouTubeManual);

// Instagram
socialRouter.get('/instagram/auth-url', authenticateToken, requireRole('CREATOR'), getInstagramAuthUrl);
socialRouter.get('/instagram/media', authenticateToken, requireRole('CREATOR'), getInstagramMedia);
socialRouter.post('/instagram/sync', authenticateToken, requireRole('CREATOR'), syncInstagramAccount);
socialRouter.post('/instagram/connect-manual', authenticateToken, requireRole('CREATOR'), connectInstagramManual);

// Account Disconnect
socialRouter.delete('/accounts/:socialAccountId', authenticateToken, requireRole('CREATOR'), disconnectSocialAccount);
