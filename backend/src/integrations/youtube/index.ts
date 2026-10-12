import crypto from 'crypto';
import { config } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

export interface YouTubeChannelProfile {
  channelId: string;
  title: string;
  customUrl?: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  uploadsPlaylistId: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  permalink: string;
  channelId?: string;
  channelTitle?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

// In-memory CSRF state cache with 15-minute expiration
const oauthStateCache = new Map<string, { creatorId: string; expiresAt: number }>();

/**
 * Generates secure Google OAuth 2.0 consent URL for YouTube Data API v3.
 * Minimum scope: https://www.googleapis.com/auth/youtube.readonly
 */
export function generateYouTubeAuthUrl(creatorId: string): { authUrl: string; state: string } {
  if (!config.google.clientId) {
    throw new Error(
      'GOOGLE_CLIENT_ID is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.'
    );
  }

  const nonce = crypto.randomBytes(24).toString('hex');
  const state = `${creatorId}__${nonce}`;
  oauthStateCache.set(state, {
    creatorId,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state,
    include_granted_scopes: 'true',
  });

  return {
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    state,
  };
}

/**
 * Validates the OAuth state parameter to prevent CSRF attacks.
 */
export function validateOAuthState(state: string): { valid: boolean; creatorId?: string } {
  const entry = oauthStateCache.get(state);
  if (!entry) return { valid: false };

  oauthStateCache.delete(state);
  if (Date.now() > entry.expiresAt) return { valid: false };

  return { valid: true, creatorId: entry.creatorId };
}

/**
 * Exchanges authorization code for Google access and refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
}> {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) missing.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to exchange Google OAuth code: ${errorBody}`);
  }

  const data: any = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

/**
 * Refreshes Google access token using stored refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new Error('Google OAuth credentials missing for token refresh.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to refresh Google access token: ${errorBody}`);
  }

  const data: any = await res.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Retrieves the authenticated user's YouTube channel profile.
 */
export async function fetchAuthenticatedChannel(accessToken: string): Promise<YouTubeChannelProfile> {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch YouTube channel profile: ${errorBody}`);
  }

  const data: any = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for the authorized Google account.');
  }

  const item = data.items[0];
  const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;

  return {
    channelId: item.id,
    title: item.snippet?.title || 'YouTube Channel',
    customUrl: item.snippet?.customUrl || '',
    description: item.snippet?.description || '',
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      '',
    subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
    viewCount: parseInt(item.statistics?.viewCount || '0', 10),
    videoCount: parseInt(item.statistics?.videoCount || '0', 10),
    uploadsPlaylistId: uploadsPlaylistId || `UU${item.id.substring(2)}`,
  };
}

/**
 * Retrieves uploaded videos from the channel's uploads playlist.
 */
export async function fetchChannelUploads(
  uploadsPlaylistId: string,
  accessToken?: string,
  apiKey?: string,
  maxResults = 20
): Promise<YouTubeVideoItem[]> {
  const keyParam = apiKey || config.youtube.apiKey ? `&key=${apiKey || config.youtube.apiKey}` : '';
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}${keyParam}`;

  const headers: HeadersInit = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch uploads playlist items: ${errorBody}`);
  }

  const data: any = await res.json();
  if (!data.items) return [];

  return data.items
    .filter((item: any) => item.contentDetails?.videoId)
    .map((item: any) => {
      const videoId = item.contentDetails.videoId;
      return {
        id: videoId,
        title: item.snippet?.title || 'Untitled Video',
        description: item.snippet?.description || '',
        publishedAt:
          item.contentDetails?.videoPublishedAt ||
          item.snippet?.publishedAt ||
          new Date().toISOString(),
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        permalink: `https://www.youtube.com/watch?v=${videoId}`,
        channelId: item.snippet?.channelId,
        channelTitle: item.snippet?.channelTitle,
      };
    });
}

/**
 * Verifies whether a given video ID belongs to the creator's connected channel.
 * Prevents submitting videos from other creators or unrelated channels.
 */
export async function verifyVideoBelongsToChannel(
  videoId: string,
  expectedChannelId: string,
  accessToken?: string,
  apiKey?: string
): Promise<{ verified: boolean; video?: YouTubeVideoItem; reason?: string }> {
  // First, check if already in local PostgreSQL Content table for this channel
  const localContent = await prisma.content.findFirst({
    where: {
      platformContentId: videoId,
      platform: 'YOUTUBE',
      socialAccount: {
        platformAccountId: expectedChannelId,
      },
    },
  });

  if (localContent) {
    return {
      verified: true,
      video: {
        id: localContent.platformContentId,
        title: localContent.title || 'YouTube Video',
        description: localContent.description || '',
        publishedAt: localContent.publishedAt?.toISOString() || new Date().toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        permalink: localContent.permalink || `https://www.youtube.com/watch?v=${videoId}`,
        channelId: expectedChannelId,
      },
    };
  }

  // Also check if video exists in local database belonging to a DIFFERENT channel
  const foreignContent = await prisma.content.findFirst({
    where: {
      platformContentId: videoId,
      platform: 'YOUTUBE',
      NOT: {
        socialAccount: {
          platformAccountId: expectedChannelId,
        },
      },
    },
    include: {
      socialAccount: true,
    },
  });

  if (foreignContent) {
    return {
      verified: false,
      reason: `Video belongs to channel ${foreignContent.socialAccount?.platformAccountId || 'another creator'}, not the connected channel ${expectedChannelId}.`,
    };
  }

  // Otherwise, query YouTube API directly
  const keyParam = apiKey || config.youtube.apiKey ? `&key=${apiKey || config.youtube.apiKey}` : '';
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}${keyParam}`;

  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    return { verified: false, reason: 'Failed to query YouTube API for video validation.' };
  }

  const data: any = await res.json();
  if (!data.items || data.items.length === 0) {
    return { verified: false, reason: 'Video not found on YouTube.' };
  }

  const item = data.items[0];
  const actualChannelId = item.snippet?.channelId;

  if (actualChannelId !== expectedChannelId) {
    return {
      verified: false,
      reason: `Video belongs to channel ${actualChannelId}, not the connected channel ${expectedChannelId}.`,
    };
  }

  return {
    verified: true,
    video: {
      id: item.id,
      title: item.snippet?.title || 'YouTube Video',
      description: item.snippet?.description || '',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      permalink: `https://www.youtube.com/watch?v=${videoId}`,
      channelId: actualChannelId,
      channelTitle: item.snippet?.channelTitle,
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      likeCount: parseInt(item.statistics?.likeCount || '0', 10),
      commentCount: parseInt(item.statistics?.commentCount || '0', 10),
    },
  };
}

/**
 * Synchronizes the creator's YouTube channel profile and uploaded videos with PostgreSQL.
 */
export async function syncCreatorYouTube(creatorId: string): Promise<{
  success: boolean;
  channel: YouTubeChannelProfile;
  videos: YouTubeVideoItem[];
}> {
  const account = await prisma.socialAccount.findFirst({
    where: { creatorId, platform: 'YOUTUBE', status: 'CONNECTED' },
  });

  if (!account) {
    throw new Error('No connected YouTube account found for this creator.');
  }

  let refData: any = {};
  try {
    refData = account.authorizationReference ? JSON.parse(account.authorizationReference) : {};
  } catch {
    refData = {};
  }

  let accessToken: string | undefined = refData.accessToken;
  const refreshToken: string | undefined = refData.refreshToken;

  // Refresh token if needed
  if (refreshToken && (!accessToken || Date.now() > (refData.expiresAt || 0))) {
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      accessToken = refreshed.accessToken;
      refData.accessToken = refreshed.accessToken;
      refData.expiresAt = Date.now() + refreshed.expiresIn * 1000;
    } catch (err: any) {
      console.warn('[YOUTUBE_SYNC] Refresh token failed:', err.message);
    }
  }

  let profile: YouTubeChannelProfile;
  let videos: YouTubeVideoItem[] = [];

  if (accessToken) {
    // 1. Fetch channel profile
    profile = await fetchAuthenticatedChannel(accessToken);

    // 2. Fetch recent uploads
    if (profile.uploadsPlaylistId) {
      videos = await fetchChannelUploads(profile.uploadsPlaylistId, accessToken);
    }
  } else if (config.youtube.apiKey && account.platformAccountId) {
    // Public API query fallback using channel ID
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${account.platformAccountId}&key=${config.youtube.apiKey}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const item = data.items?.[0];

    if (!item) {
      throw new Error(`Channel ${account.platformAccountId} not found.`);
    }

    profile = {
      channelId: item.id,
      title: item.snippet?.title || account.username,
      customUrl: item.snippet?.customUrl || '',
      description: item.snippet?.description || '',
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
      subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      videoCount: parseInt(item.statistics?.videoCount || '0', 10),
      uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads || '',
    };

    if (profile.uploadsPlaylistId) {
      videos = await fetchChannelUploads(profile.uploadsPlaylistId, undefined, config.youtube.apiKey);
    }
  } else {
    // Return stored profile information if no live access tokens or API key
    profile = {
      channelId: account.platformAccountId,
      title: refData.channelTitle || account.username,
      customUrl: refData.customUrl || account.username,
      description: refData.description || '',
      thumbnailUrl: refData.thumbnailUrl || '',
      subscriberCount: refData.subscriberCount || 0,
      viewCount: refData.viewCount || 0,
      videoCount: refData.videoCount || 0,
      uploadsPlaylistId: refData.uploadsPlaylistId || '',
    };

    // Load from local Content table
    const storedContents = await prisma.content.findMany({
      where: { creatorId, platform: 'YOUTUBE' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    videos = storedContents.map((c) => ({
      id: c.platformContentId,
      title: c.title || 'YouTube Video',
      description: c.description || '',
      publishedAt: c.publishedAt?.toISOString() || c.fetchedAt.toISOString(),
      thumbnailUrl: `https://i.ytimg.com/vi/${c.platformContentId}/hqdefault.jpg`,
      permalink: c.permalink || `https://www.youtube.com/watch?v=${c.platformContentId}`,
    }));
  }

  // Update SocialAccount in PostgreSQL
  refData = {
    ...refData,
    channelTitle: profile.title,
    customUrl: profile.customUrl,
    thumbnailUrl: profile.thumbnailUrl,
    subscriberCount: profile.subscriberCount,
    viewCount: profile.viewCount,
    videoCount: profile.videoCount,
    uploadsPlaylistId: profile.uploadsPlaylistId,
  };

  await prisma.socialAccount.update({
    where: { id: account.id },
    data: {
      username: profile.customUrl || profile.title,
      authorizationReference: JSON.stringify(refData),
      lastSyncedAt: new Date(),
    },
  });

  // Upsert videos into Content table
  for (const video of videos) {
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
          socialAccountId: account.id,
        },
        create: {
          creatorId,
          socialAccountId: account.id,
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

  // Record snapshot in CreatorMetricSnapshot
  if (profile.subscriberCount > 0 || profile.viewCount > 0) {
    await prisma.creatorMetricSnapshot.create({
      data: {
        creatorId,
        socialAccountId: account.id,
        followers: profile.subscriberCount,
        totalViews: BigInt(profile.viewCount),
        source: 'YOUTUBE_API_V3',
      },
    });
  }

  return {
    success: true,
    channel: profile,
    videos,
  };
}
