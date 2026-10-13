import crypto from 'crypto';
import { config } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

export interface InstagramProfile {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  profilePictureUrl?: string;
  followersCount: number | null;
  followsCount: number | null;
  mediaCount: number | null;
  accountType?: string;
  ownershipVerified: boolean;
  connectionState: 'OWNER_AUTHORIZED' | 'PUBLIC_DATA_AVAILABLE' | 'PUBLIC_PROFILE_ADDED' | 'SYNC_FAILED';
  rawResponse?: any;
}

export interface InstagramMediaItem {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
  likeCount: number | null;
  commentsCount: number | null;
  viewCount?: number | null;
}

// In-memory single-use CSRF state cache with 15-minute expiration
const oauthStateCache = new Map<string, { creatorId: string; expiresAt: number }>();

/**
 * Parses and normalizes any Instagram handle or profile URL input.
 */
export function parseInstagramInput(input: string): {
  username: string;
  normalizedUrl: string;
} {
  const cleaned = input.trim();
  let username = cleaned;

  if (cleaned.startsWith('@')) {
    username = cleaned.substring(1);
  } else if (cleaned.includes('instagram.com/')) {
    try {
      const parsed = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        // Strip out common non-profile routes
        if (!['p', 'reel', 'stories', 'explore', 'direct'].includes(segments[0])) {
          username = segments[0];
        }
      }
    } catch {
      username = cleaned.replace(/.*instagram\.com\//, '').split('/')[0];
    }
  }

  // Sanitize username (alphanumeric, dots, underscores)
  username = username.replace(/[^a-zA-Z0-9._]/g, '');

  return {
    username,
    normalizedUrl: `https://www.instagram.com/${username}`,
  };
}

/**
 * Generates secure Meta Instagram OAuth 2.0 authorization URL.
 * Uses official Instagram Login for Business / Creators.
 * Scope: instagram_business_basic
 */
export function generateInstagramAuthUrl(creatorId: string): { authUrl: string; state: string } {
  const appId = config.instagram.appId || config.social.instagramAppId;
  if (!appId) {
    throw new Error(
      'INSTAGRAM_APP_ID is not configured. Please add INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET to backend/.env.'
    );
  }

  const nonce = crypto.randomBytes(24).toString('hex');
  const state = `${creatorId}__ig__${nonce}`;
  oauthStateCache.set(state, {
    creatorId,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  });

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: config.instagram.redirectUri,
    response_type: 'code',
    scope: 'instagram_business_basic',
    state,
    enable_fb_login: '0',
    force_authentication: '1',
  });

  // Official Instagram OAuth authorize endpoint
  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

  return { authUrl, state };
}

/**
 * Validates the single-use OAuth state parameter to prevent CSRF attacks.
 */
export function validateInstagramOAuthState(state: string): { valid: boolean; creatorId?: string } {
  const entry = oauthStateCache.get(state);
  if (!entry) return { valid: false };

  // Remove immediately (single-use guarantee)
  oauthStateCache.delete(state);

  if (Date.now() > entry.expiresAt) {
    return { valid: false };
  }

  return { valid: true, creatorId: entry.creatorId };
}

/**
 * Exchanges authorization code for an Instagram access token,
 * then exchanges the short-lived token for a 60-day long-lived token.
 */
export async function exchangeInstagramCodeForTokens(
  code: string
): Promise<{ accessToken: string; userId: string; expiresIn?: number }> {
  const appId = config.instagram.appId || config.social.instagramAppId;
  const appSecret = config.instagram.appSecret || config.social.instagramAppSecret;

  if (!appId || !appSecret) {
    throw new Error('INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET is not configured.');
  }

  // 1. Exchange authorization code for short-lived token
  const tokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: config.instagram.redirectUri,
    code,
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMsg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      parsedMsg = parsed.error_message || parsed.error?.message || errorBody;
    } catch {}
    throw new Error(`Failed to exchange Instagram authorization code: ${parsedMsg}`);
  }

  const tokenData = await response.json();
  const shortLivedToken = tokenData.access_token;
  const userId = String(tokenData.user_id || '');

  // 2. Exchange short-lived token for 60-day long-lived token via graph.instagram.com
  let longLivedToken = shortLivedToken;
  let expiresIn = 60 * 24 * 3600; // 60 days default

  try {
    const exchangeUrl = new URL('https://graph.instagram.com/access_token');
    exchangeUrl.searchParams.set('grant_type', 'ig_exchange_token');
    exchangeUrl.searchParams.set('client_secret', appSecret);
    exchangeUrl.searchParams.set('access_token', shortLivedToken);

    const exchangeRes = await fetch(exchangeUrl.toString());
    if (exchangeRes.ok) {
      const exchangeData = await exchangeRes.json();
      if (exchangeData.access_token) {
        longLivedToken = exchangeData.access_token;
        expiresIn = exchangeData.expires_in || expiresIn;
      }
    }
  } catch (exchangeErr: any) {
    console.warn('[INSTAGRAM_TOKEN_EXCHANGE] Long-lived exchange notice:', exchangeErr.message);
  }

  return {
    accessToken: longLivedToken,
    userId,
    expiresIn,
  };
}

/**
 * Fetches authorized Instagram account profile details via official Graph API.
 */
export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  const fields = 'id,user_id,username,name,account_type,profile_picture_url,followers_count,media_count';
  const url = `https://graph.instagram.com/v21.0/me?fields=${fields}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    let msg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      msg = parsed.error?.message || errorBody;
    } catch {}
    throw new Error(`Failed to fetch Instagram profile: ${msg}`);
  }

  const data = await response.json();

  return {
    id: data.id || data.user_id,
    username: data.username || 'instagram_creator',
    name: data.name || data.username,
    biography: data.biography || '',
    profilePictureUrl: data.profile_picture_url || '',
    followersCount: typeof data.followers_count === 'number' ? data.followers_count : null,
    followsCount: null,
    mediaCount: typeof data.media_count === 'number' ? data.media_count : null,
    accountType: data.account_type || 'BUSINESS',
    ownershipVerified: true,
    connectionState: 'OWNER_AUTHORIZED',
    rawResponse: data,
  };
}

/**
 * Fetches recent media items published by the authorized Instagram account.
 */
export async function fetchInstagramMedia(
  accessToken: string,
  limit = 25
): Promise<InstagramMediaItem[]> {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
  const url = `https://graph.instagram.com/v21.0/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    let msg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      msg = parsed.error?.message || errorBody;
    } catch {}
    throw new Error(`Failed to fetch Instagram media: ${msg}`);
  }

  const data = await response.json();
  const rawItems: any[] = Array.isArray(data.data) ? data.data : [];

  return rawItems.map((item) => {
    let mType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' = 'IMAGE';
    const rawType = (item.media_type || '').toUpperCase();
    if (rawType.includes('REEL') || rawType === 'REELS') {
      mType = 'REEL';
    } else if (rawType.includes('VIDEO')) {
      mType = 'VIDEO';
    } else if (rawType.includes('CAROUSEL') || rawType.includes('ALBUM')) {
      mType = 'CAROUSEL_ALBUM';
    }

    return {
      id: item.id,
      caption: item.caption || '',
      mediaType: mType,
      mediaUrl: item.media_url || item.thumbnail_url || '',
      thumbnailUrl: item.thumbnail_url || item.media_url || '',
      permalink: item.permalink || `https://www.instagram.com/p/${item.id}/`,
      timestamp: item.timestamp || new Date().toISOString(),
      likeCount: typeof item.like_count === 'number' ? item.like_count : null,
      commentsCount: typeof item.comments_count === 'number' ? item.comments_count : null,
      viewCount: null,
    };
  });
}

/**
 * Resolves a public Instagram handle without fabricating metrics.
 */
export async function resolveInstagramProfile(input: string): Promise<InstagramProfile> {
  const parsed = parseInstagramInput(input);
  if (!parsed.username) {
    throw new Error('Please enter a valid Instagram handle or profile URL.');
  }

  return {
    id: `ig_${parsed.username}`,
    username: parsed.username,
    name: parsed.username,
    biography: '',
    profilePictureUrl: '',
    followersCount: null,
    followsCount: null,
    mediaCount: null,
    ownershipVerified: false,
    connectionState: 'PUBLIC_PROFILE_ADDED',
  };
}

/**
 * End-to-end synchronization for a creator's Instagram account.
 * Persists SocialAccount, Content, and CreatorMetricSnapshot in PostgreSQL.
 */
export async function syncCreatorInstagram(
  creatorId: string,
  accountInput?: string,
  directAccessToken?: string
): Promise<{
  success: boolean;
  profile: InstagramProfile;
  media: InstagramMediaItem[];
}> {
  // 1. Locate existing SocialAccount record
  let account = await prisma.socialAccount.findFirst({
    where: {
      creatorId,
      platform: 'INSTAGRAM',
      status: 'CONNECTED',
    },
  });

  let refData: any = {};
  if (account?.authorizationReference) {
    try {
      refData = JSON.parse(account.authorizationReference);
    } catch {
      refData = { profileUrl: account.authorizationReference };
    }
  }

  const accessToken = directAccessToken || refData.accessToken || null;

  // 2. Fetch or resolve profile
  let profile: InstagramProfile;
  let media: InstagramMediaItem[] = [];

  if (accessToken) {
    try {
      profile = await fetchInstagramProfile(accessToken);
      media = await fetchInstagramMedia(accessToken, 25);
    } catch (apiErr: any) {
      console.warn('[INSTAGRAM_SYNC] Graph API fetch notice:', apiErr.message);
      // Fallback to existing metadata if token expired or API failed
      if (refData.username) {
        profile = {
          id: account?.platformAccountId || `ig_${refData.username}`,
          username: refData.username,
          name: refData.name || refData.username,
          profilePictureUrl: refData.profilePictureUrl || '',
          followersCount: refData.followersCount ?? null,
          followsCount: null,
          mediaCount: refData.mediaCount ?? null,
          ownershipVerified: false,
          connectionState: 'SYNC_FAILED',
        };
      } else {
        throw apiErr;
      }
    }
  } else {
    // Public profile linking mode (when creator connects via profile URL / handle without OAuth)
    const targetInput = accountInput || refData.profileUrl || account?.username || '';
    if (!targetInput) {
      throw new Error('No Instagram handle, URL, or access token available to synchronize.');
    }
    profile = await resolveInstagramProfile(targetInput);
  }

  // 3. Compute real, defensible metrics from retrieved data
  const mediaWithLikes = media.filter((m) => typeof m.likeCount === 'number');
  const mediaWithComments = media.filter((m) => typeof m.commentsCount === 'number');

  let avgInteractions: number | null = null;
  if (media.length > 0) {
    const totalInteractions = media.reduce((acc, m) => {
      const l = m.likeCount || 0;
      const c = m.commentsCount || 0;
      return acc + (l + c);
    }, 0);
    avgInteractions = Math.round(totalInteractions / media.length);
  }

  let avgEngRate: number | null = null;
  if (profile.followersCount && profile.followersCount > 0 && avgInteractions !== null) {
    // Standard industry formula: Average interactions per post divided by total followers
    avgEngRate = Number(((avgInteractions / profile.followersCount) * 100).toFixed(1));
  } else if (mediaWithLikes.length > 0) {
    // Per-post interaction rate sample
    const sample = media.slice(0, 10);
    const sumLikes = sample.reduce((acc, m) => acc + (m.likeCount || 0), 0);
    avgEngRate = sample.length > 0 ? Number((sumLikes / sample.length).toFixed(1)) : null;
  }

  let postingCadence: number | null = null;
  if (media.length >= 2) {
    const dates = media
      .map((m) => new Date(m.timestamp).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a);

    if (dates.length >= 2) {
      const spanWeeks = Math.max(1, (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24 * 7));
      postingCadence = Number((dates.length / spanWeeks).toFixed(1));
    }
  }

  // 4. Update or create SocialAccount in PostgreSQL
  const updatedRefData = {
    ...refData,
    instagramId: profile.id,
    username: profile.username,
    name: profile.name,
    biography: profile.biography,
    profilePictureUrl: profile.profilePictureUrl,
    followersCount: profile.followersCount,
    subscriberCount: profile.followersCount, // cross-platform uniform alias
    mediaCount: profile.mediaCount,
    accountType: profile.accountType,
    ownershipVerified: Boolean(accessToken),
    connectionState: accessToken ? 'OWNER_AUTHORIZED' : 'PUBLIC_PROFILE_ADDED',
    averageInteractions: avgInteractions,
    averageViews: avgInteractions,
    engagementRate: avgEngRate,
    postingCadence,
    ...(directAccessToken ? { accessToken: directAccessToken } : {}),
    lastSyncedAt: new Date().toISOString(),
  };

  if (account) {
    account = await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        platformAccountId: profile.id,
        username: profile.username,
        authorizationReference: JSON.stringify(updatedRefData),
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    });
  } else {
    account = await prisma.socialAccount.create({
      data: {
        creatorId,
        platform: 'INSTAGRAM',
        platformAccountId: profile.id,
        username: profile.username,
        authorizationReference: JSON.stringify(updatedRefData),
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    });
  }

  // 5. Upsert media items into Content table
  for (const item of media) {
    try {
      const titlePreview = item.caption
        ? item.caption.split('\n')[0].slice(0, 60)
        : item.mediaType === 'REEL'
        ? 'Instagram Reel'
        : 'Instagram Post';

      await prisma.content.upsert({
        where: {
          platform_platformContentId: {
            platform: 'INSTAGRAM',
            platformContentId: item.id,
          },
        },
        update: {
          title: titlePreview,
          description: item.caption,
          caption: item.caption,
          permalink: item.permalink,
          contentType: item.mediaType,
          publishedAt: new Date(item.timestamp),
          likes: item.likeCount ?? undefined,
          comments: item.commentsCount ?? undefined,
          socialAccountId: account.id,
        },
        create: {
          creatorId,
          socialAccountId: account.id,
          platform: 'INSTAGRAM',
          platformContentId: item.id,
          title: titlePreview,
          description: item.caption,
          caption: item.caption,
          permalink: item.permalink,
          contentType: item.mediaType,
          publishedAt: new Date(item.timestamp),
          likes: item.likeCount ?? null,
          comments: item.commentsCount ?? null,
        },
      });
    } catch (upsertErr: any) {
      console.warn(`[INSTAGRAM_CONTENT_UPSERT] Skipped media ${item.id}:`, upsertErr.message);
    }
  }

  // 6. Record timestamped historical CreatorMetricSnapshot
  await prisma.creatorMetricSnapshot.create({
    data: {
      creatorId,
      socialAccountId: account.id,
      followers: profile.followersCount,
      following: profile.followsCount,
      totalViews: null,
      averageViews: avgInteractions,
      engagementRate: avgEngRate,
      postingFrequency: postingCadence,
      source: accessToken ? 'INSTAGRAM_GRAPH_API' : 'INSTAGRAM_PUBLIC_DATA',
    },
  });

  return {
    success: true,
    profile,
    media,
  };
}
