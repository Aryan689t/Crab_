import { Request, Response, NextFunction } from 'express';
import { fetchYouTubeChannelData } from '../integrations/youtube/index.js';
import { fetchInstagramAccountData } from '../integrations/instagram/index.js';

export async function getConnectedAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      data: [
        {
          id: 'social_yt_01',
          platform: 'YOUTUBE',
          handle: '@alextechlabs',
          status: 'CONNECTED',
          connectedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          lastSyncedAt: new Date().toISOString(),
          stats: {
            subscribers: 142000,
            views: 18450000,
            videos: 128,
          },
        },
        {
          id: 'social_ig_01',
          platform: 'INSTAGRAM',
          handle: '@alex.codes',
          status: 'CONNECTED',
          connectedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
          stats: {
            followers: 48500,
            posts: 245,
          },
        },
      ],
    });
  } catch (err) {
    next(err);
  }
}

export async function connectSocialAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const platform = typeof req.params.platform === 'string' ? req.params.platform.toUpperCase() : 'YOUTUBE';
    const redirectUri = req.body.redirectUri || 'http://localhost:3000/creator/dashboard';

    // In production OAuth, this returns Google or Meta OAuth consent URL
    res.status(200).json({
      data: {
        platform,
        authorizationUrl: `http://localhost:3000/creator/dashboard?oauth_simulated=true&platform=${platform}`,
        status: 'PENDING_AUTHORIZATION',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function syncSocialAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const socialAccountId = typeof req.params.socialAccountId === 'string' ? req.params.socialAccountId : 'social_yt_01';

    // Trigger sync pipeline (Fetch -> Normalize -> Store -> Trigger AI Embedding)
    res.status(200).json({
      data: {
        socialAccountId,
        status: 'SYNC_COMPLETED',
        syncedAt: new Date().toISOString(),
        itemsImported: 12,
        metricsUpdated: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function disconnectSocialAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      data: {
        success: true,
        message: 'Social account disconnected successfully.',
      },
    });
  } catch (err) {
    next(err);
  }
}
