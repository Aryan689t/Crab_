import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';
import {
  generateYouTubeAuthUrl,
  validateOAuthState,
  exchangeCodeForTokens,
  fetchAuthenticatedChannel,
  fetchChannelUploads,
  syncCreatorYouTube,
  verifyVideoBelongsToChannel,
} from '../integrations/youtube/index.js';

/**
 * GET /api/social/accounts
 * Returns the authenticated creator's connected social accounts from PostgreSQL.
 */
export async function getConnectedAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      include: {
        socialAccounts: {
          include: {
            contents: {
              take: 10,
              orderBy: { publishedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    const accounts = creator.socialAccounts.map((acc) => {
      let refData: any = {};
      try {
        refData = acc.authorizationReference ? JSON.parse(acc.authorizationReference) : {};
      } catch {
        refData = {};
      }

      const isOwner = Boolean(refData.ownershipVerified);
      const connectionState = refData.connectionState || (isOwner ? 'OWNER_AUTHORIZED' : 'PUBLIC_DATA_AVAILABLE');

      return {
        id: acc.id,
        platform: acc.platform,
        channelId: acc.platformAccountId,
        username: acc.username,
        handle: refData.customUrl || acc.username,
        title: refData.channelTitle || acc.username,
        thumbnailUrl: refData.thumbnailUrl || '',
        status: acc.status,
        ownershipVerified: isOwner,
        connectionState,
        connectedAt: acc.connectedAt,
        lastSyncedAt: acc.lastSyncedAt,
        stats: {
          subscriberCount: refData.subscriberCount ?? null,
          viewCount: refData.viewCount ?? null,
          videoCount: refData.videoCount ?? acc.contents.length,
          averageViews: refData.averageViews ?? null,
          engagementRate: refData.engagementRate ?? null,
        },
        metrics: {
          subscribers: refData.subscriberCount ?? null,
          followers: refData.subscriberCount ?? null,
          views: refData.viewCount ?? null,
          videos: refData.videoCount ?? acc.contents.length,
          averageViews: refData.averageViews ?? null,
          engagementRate: refData.engagementRate ?? null,
        },
        recentVideos: acc.contents.map((c) => ({
          id: c.platformContentId,
          title: c.title,
          description: c.description,
          permalink: c.permalink,
          publishedAt: c.publishedAt,
          thumbnailUrl: `https://i.ytimg.com/vi/${c.platformContentId}/hqdefault.jpg`,
          views: c.views !== null ? Number(c.views) : null,
          likes: c.likes ?? null,
          comments: c.comments ?? null,
        })),
      };
    });

    res.status(200).json({
      data: accounts,
      meta: { total: accounts.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/social/youtube/auth-url
 * Returns Google OAuth 2.0 authorization URL for connecting a YouTube channel.
 */
export async function getYouTubeAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    if (!config.google.clientId || !config.google.clientSecret) {
      res.status(400).json({
        error: 'GoogleOAuthNotConfigured',
        message:
          'Google OAuth 2.0 is not configured on the backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.',
        instructions: {
          step1: 'Visit https://console.cloud.google.com and create a project.',
          step2: 'Enable YouTube Data API v3.',
          step3: 'Configure OAuth consent screen (External, scope: https://www.googleapis.com/auth/youtube.readonly).',
          step4: 'Create OAuth Client ID (Web Application), set Authorized Redirect URI to http://localhost:5000/api/social/youtube/callback.',
          step5: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.',
        },
      });
      return;
    }

    const { authUrl, state } = generateYouTubeAuthUrl(creator.id);
    res.status(200).json({
      data: {
        authUrl,
        state,
        platform: 'YOUTUBE',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/social/youtube/callback
 * Handles Google OAuth 2.0 callback, exchanges code for tokens, imports channel and uploads.
 */
export async function handleYouTubeOAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.warn('[YOUTUBE_OAUTH] Google OAuth error:', error);
      res.redirect('http://localhost:3000/creator/collaborations?oauth_error=' + encodeURIComponent(String(error)));
      return;
    }

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      res.status(400).json({ error: 'InvalidRequest', message: 'Missing authorization code or state parameter.' });
      return;
    }

    // 1. Validate CSRF state
    const validation = validateOAuthState(state);
    if (!validation.valid || !validation.creatorId) {
      res.status(403).json({ error: 'InvalidState', message: 'OAuth state is invalid or has expired.' });
      return;
    }

    const creatorId = validation.creatorId;

    // 2. Exchange code for access & refresh tokens
    const tokenResult = await exchangeCodeForTokens(code);

    // 3. Retrieve authorized channel profile
    const channelProfile = await fetchAuthenticatedChannel(tokenResult.accessToken);

    // 4. Fetch recent uploads from uploads playlist
    let recentVideos: any[] = [];
    if (channelProfile.uploadsPlaylistId) {
      try {
        recentVideos = await fetchChannelUploads(channelProfile.uploadsPlaylistId, tokenResult.accessToken);
      } catch (err: any) {
        console.warn('[YOUTUBE_OAUTH] Could not fetch uploads playlist on initial connect:', err.message);
      }
    }

    // 5. Securely persist SocialAccount in PostgreSQL
    const refData = {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresAt: Date.now() + tokenResult.expiresIn * 1000,
      channelTitle: channelProfile.title,
      customUrl: channelProfile.customUrl,
      thumbnailUrl: channelProfile.thumbnailUrl,
      subscriberCount: channelProfile.subscriberCount,
      viewCount: channelProfile.viewCount,
      videoCount: channelProfile.videoCount,
      uploadsPlaylistId: channelProfile.uploadsPlaylistId,
    };

    const existingAccount = await prisma.socialAccount.findFirst({
      where: { creatorId, platform: 'YOUTUBE' },
    });

    let socialAccount;
    if (existingAccount) {
      socialAccount = await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: {
          platformAccountId: channelProfile.channelId,
          username: channelProfile.customUrl || channelProfile.title,
          authorizationReference: JSON.stringify(refData),
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
        },
      });
    } else {
      socialAccount = await prisma.socialAccount.create({
        data: {
          creatorId,
          platform: 'YOUTUBE',
          platformAccountId: channelProfile.channelId,
          username: channelProfile.customUrl || channelProfile.title,
          authorizationReference: JSON.stringify(refData),
          status: 'CONNECTED',
        },
      });
    }

    // 6. Persist uploaded videos into Content table
    for (const video of recentVideos) {
      try {
        await prisma.content.upsert({
          where: {
            platform_platformContentId: {
              platform: 'YOUTUBE',
              platformContentId: video.id,
            },
          },
          update: {
            title: video.title,
            description: video.description,
            permalink: video.permalink,
            publishedAt: new Date(video.publishedAt),
            socialAccountId: socialAccount.id,
          },
          create: {
            creatorId,
            socialAccountId: socialAccount.id,
            platform: 'YOUTUBE',
            platformContentId: video.id,
            title: video.title,
            description: video.description,
            permalink: video.permalink,
            contentType: 'VIDEO',
            publishedAt: new Date(video.publishedAt),
          },
        });
      } catch (err: any) {
        console.warn(`[CONTENT_UPSERT] Skipped video ${video.id}:`, err.message);
      }
    }

    // Redirect creator back to collaborations page with success indicator
    res.redirect(
      `http://localhost:3000/creator/collaborations?youtube_connected=true&channel=${encodeURIComponent(
        channelProfile.title
      )}`
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/social/youtube/videos
 * Returns the creator's real uploaded YouTube videos from Content table or live sync.
 */
export async function getYouTubeVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    const videos = await prisma.content.findMany({
      where: {
        creatorId: creator.id,
        platform: 'YOUTUBE',
      },
      orderBy: { publishedAt: 'desc' },
      take: 25,
    });

    res.status(200).json({
      data: videos.map((v) => ({
        id: v.platformContentId,
        title: v.title || 'YouTube Video',
        description: v.description || '',
        permalink: v.permalink || `https://www.youtube.com/watch?v=${v.platformContentId}`,
        publishedAt: v.publishedAt?.toISOString() || v.fetchedAt.toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${v.platformContentId}/hqdefault.jpg`,
      })),
      meta: { total: videos.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/social/youtube/sync
 * Manually checks for new uploads and synchronizes channel profile.
 */
export async function syncYouTubeAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    const result = await syncCreatorYouTube(creator.id);

    res.status(200).json({
      data: {
        success: true,
        channel: result.channel,
        videos: result.videos,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/social/youtube/connect-manual
 * Connects channel by public handle or channel ID (for testing when OAuth consent is in review).
 */
export async function connectYouTubeManual(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const channelHandleOrUrl =
      req.body?.channelHandleOrUrl || req.body?.channelUrl || req.body?.channelHandle || '';
    if (!channelHandleOrUrl || typeof channelHandleOrUrl !== 'string') {
      res.status(400).json({ error: 'ValidationError', message: 'YouTube channel URL or handle is required.' });
      return;
    }

    const creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { userId: req.user.id },
          ...(req.user.email ? [{ user: { email: req.user.email } }] : []),
        ],
      },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    // Call real synchronization and channel resolution
    const syncResult = await syncCreatorYouTube(creator.id, channelHandleOrUrl.trim());

    // Update creator avatar if not set
    if (!creator.profileImageUrl && syncResult.channel?.thumbnailUrl) {
      await prisma.creator.update({
        where: { id: creator.id },
        data: { profileImageUrl: syncResult.channel.thumbnailUrl },
      });
    }

    res.status(200).json({
      data: {
        success: true,
        message: `YouTube channel ${syncResult.channel.title} resolved and synchronized successfully.`,
        channel: syncResult.channel,
        videos: syncResult.videos,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/social/accounts/:socialAccountId
 * Disconnects the specified social account.
 */
export async function disconnectSocialAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const { socialAccountId } = req.params;

    const account = await prisma.socialAccount.findFirst({
      where: {
        id: typeof socialAccountId === 'string' ? socialAccountId : (socialAccountId as string[])[0],
        creator: { userId: req.user.id },
      },
    });

    if (!account) {
      res.status(404).json({ error: 'AccountNotFound', message: 'Social account not found or unauthorized.' });
      return;
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: 'DISCONNECTED' },
    });

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
