import crypto from 'crypto';
import { config } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

export interface YouTubeChannelProfile {
  channelId: string;
  title: string;
  customUrl?: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount: number | null;
  viewCount: number | null;
  videoCount: number | null;
  uploadsPlaylistId?: string;
  ownershipVerified: boolean;
  connectionState: 'OWNER_AUTHORIZED' | 'PUBLIC_DATA_AVAILABLE' | 'PUBLIC_PROFILE_ADDED' | 'SYNC_FAILED';
  rawResponse?: any;
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
  duration?: string;
}

// In-memory CSRF state cache with 15-minute expiration
const oauthStateCache = new Map<string, { creatorId: string; expiresAt: number }>();

/**
 * Parses ISO 8601 duration string (e.g. "PT12M34S") into MM:SS or HH:MM:SS format.
 */
export function parseISO8601Duration(durationStr?: string): string | null {
  if (!durationStr) return null;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parses and normalizes any YouTube channel URL, handle, or channel ID input.
 */
export function parseYouTubeInput(input: string): {
  type: 'HANDLE' | 'CHANNEL_ID' | 'CUSTOM_URL' | 'USERNAME';
  value: string;
  normalizedUrl: string;
} {
  const cleaned = input.trim();
  let path = cleaned;
  try {
    const parsed = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    path = parsed.pathname;
  } catch {
    path = cleaned;
  }

  // 1. Channel ID (UC...)
  const channelMatch = path.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelMatch) {
    return {
      type: 'CHANNEL_ID',
      value: channelMatch[1],
      normalizedUrl: `https://www.youtube.com/channel/${channelMatch[1]}`,
    };
  }
  if (/^UC[a-zA-Z0-9_-]{22}$/i.test(cleaned)) {
    return {
      type: 'CHANNEL_ID',
      value: cleaned,
      normalizedUrl: `https://www.youtube.com/channel/${cleaned}`,
    };
  }

  // 2. Handle (@name)
  const handleMatch = path.match(/\/@([a-zA-Z0-9_.-]+)/i);
  if (handleMatch) {
    return {
      type: 'HANDLE',
      value: `@${handleMatch[1]}`,
      normalizedUrl: `https://www.youtube.com/@${handleMatch[1]}`,
    };
  }
  if (cleaned.startsWith('@')) {
    return {
      type: 'HANDLE',
      value: cleaned,
      normalizedUrl: `https://www.youtube.com/${cleaned}`,
    };
  }

  // 3. Custom URL (/c/name)
  const cMatch = path.match(/\/c\/([a-zA-Z0-9_.-]+)/i);
  if (cMatch) {
    return {
      type: 'CUSTOM_URL',
      value: cMatch[1],
      normalizedUrl: `https://www.youtube.com/c/${cMatch[1]}`,
    };
  }

  // 4. User URL (/user/name)
  const userMatch = path.match(/\/user\/([a-zA-Z0-9_.-]+)/i);
  if (userMatch) {
    return {
      type: 'USERNAME',
      value: userMatch[1],
      normalizedUrl: `https://www.youtube.com/user/${userMatch[1]}`,
    };
  }

  // Default fallback: treat as handle
  const fallback = cleaned
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, '')
    .split('/')[0]
    .split('?')[0];
  const finalHandle = fallback.startsWith('@') ? fallback : `@${fallback}`;
  return {
    type: 'HANDLE',
    value: finalHandle,
    normalizedUrl: `https://www.youtube.com/${finalHandle}`,
  };
}

/**
 * Resolves canonical YouTube channel profile from handle, URL, or channel ID.
 * Respects YouTube Data API v3 and falls back gracefully to public oEmbed.
 */
export async function resolveYouTubeChannel(
  input: string,
  apiKey?: string
): Promise<YouTubeChannelProfile> {
  const parsed = parseYouTubeInput(input);
  const key = apiKey || config.youtube.apiKey || config.social.youtubeApiKey;

  // 1. If API key is available, query official YouTube Data API v3
  if (key) {
    let url = '';
    if (parsed.type === 'CHANNEL_ID') {
      url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${parsed.value}&key=${key}`;
    } else if (parsed.type === 'HANDLE') {
      const handleParam = parsed.value.startsWith('@') ? parsed.value : `@${parsed.value}`;
      url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(handleParam)}&key=${key}`;
    } else if (parsed.type === 'USERNAME') {
      url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forUsername=${encodeURIComponent(parsed.value)}&key=${key}`;
    } else {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(parsed.value)}&maxResults=1&key=${key}`;
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        let item = data.items?.[0];

        // If forHandle with @ returned nothing, try without the leading @
        if (!item && parsed.type === 'HANDLE') {
          const fallbackUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(parsed.value.replace(/^@/, ''))}&key=${key}`;
          const fallbackRes = await fetch(fallbackUrl);
          if (fallbackRes.ok) {
            const fallbackData: any = await fallbackRes.json();
            item = fallbackData.items?.[0];
          }
        }

        if (item) {
          let channelId = item.id;
          if (typeof channelId === 'object' && channelId.channelId) {
            channelId = channelId.channelId;
            const detailRes = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${key}`
            );
            if (detailRes.ok) {
              const detailData: any = await detailRes.json();
              if (detailData.items?.[0]) item = detailData.items[0];
            }
          }

          const uploadsPlaylistId =
            item.contentDetails?.relatedPlaylists?.uploads || `UU${channelId.substring(2)}`;
          const subCount = item.statistics?.hiddenSubscriberCount
            ? null
            : parseInt(item.statistics?.subscriberCount || '0', 10);

          return {
            channelId,
            title: item.snippet?.title || parsed.value,
            customUrl: item.snippet?.customUrl || parsed.value,
            description: item.snippet?.description || '',
            thumbnailUrl:
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.medium?.url ||
              item.snippet?.thumbnails?.default?.url ||
              '',
            subscriberCount: subCount,
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            videoCount: parseInt(item.statistics?.videoCount || '0', 10),
            uploadsPlaylistId,
            ownershipVerified: false,
            connectionState: 'PUBLIC_DATA_AVAILABLE',
          };
        }
      }
    } catch (err: any) {
      console.warn('[YOUTUBE_RESOLVE] API query failed:', err.message);
    }
  }

  // 2. Public Fallback via YouTube oEmbed (safe, no API key required for canonical author title)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.normalizedUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data: any = await res.json();
      return {
        channelId: `yt_${parsed.value.replace(/[^a-zA-Z0-9_-]/g, '')}`,
        title: data.author_name || data.title || parsed.value,
        customUrl: parsed.value,
        description: '',
        thumbnailUrl: data.thumbnail_url || '',
        subscriberCount: null,
        viewCount: null,
        videoCount: null,
        ownershipVerified: false,
        connectionState: 'PUBLIC_PROFILE_ADDED',
      };
    }
  } catch (err: any) {
    console.warn('[YOUTUBE_RESOLVE] oEmbed fallback note:', err.message);
  }

  // 3. Fallback to normalized metadata with explicit status
  return {
    channelId: parsed.type === 'CHANNEL_ID' ? parsed.value : `yt_${parsed.value.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    title: parsed.value,
    customUrl: parsed.value,
    description: '',
    thumbnailUrl: '',
    subscriberCount: null,
    viewCount: null,
    videoCount: null,
    ownershipVerified: false,
    connectionState: 'PUBLIC_PROFILE_ADDED',
  };
}

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
  const subCount = item.statistics?.hiddenSubscriberCount
    ? null
    : parseInt(item.statistics?.subscriberCount || '0', 10);

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
    subscriberCount: subCount,
    viewCount: parseInt(item.statistics?.viewCount || '0', 10),
    videoCount: parseInt(item.statistics?.videoCount || '0', 10),
    uploadsPlaylistId: uploadsPlaylistId || `UU${item.id.substring(2)}`,
    ownershipVerified: true,
    connectionState: 'OWNER_AUTHORIZED',
  };
}

/**
 * Retrieves uploaded videos along with actual per-video statistics (views, likes, comments, duration).
 */
export async function fetchChannelUploads(
  uploadsPlaylistId: string,
  accessToken?: string,
  apiKey?: string,
  maxResults = 20
): Promise<YouTubeVideoItem[]> {
  const key = apiKey || config.youtube.apiKey || config.social.youtubeApiKey;
  const keyParam = key ? `&key=${key}` : '';
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
  if (!data.items || data.items.length === 0) return [];

  const rawVideos: YouTubeVideoItem[] = data.items
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

  // Fetch per-video statistics and duration in batch
  const videoIds = rawVideos.map((v) => v.id);
  if (videoIds.length > 0 && (key || accessToken)) {
    try {
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}${keyParam}`;
      const statsRes = await fetch(statsUrl, { headers });
      if (statsRes.ok) {
        const statsData: any = await statsRes.json();
        const statsMap = new Map<string, any>();
        (statsData.items || []).forEach((item: any) => {
          statsMap.set(item.id, item);
        });

        return rawVideos.map((vid) => {
          const detail = statsMap.get(vid.id);
          if (!detail) return vid;
          return {
            ...vid,
            viewCount: detail.statistics?.viewCount ? parseInt(detail.statistics.viewCount, 10) : undefined,
            likeCount: detail.statistics?.likeCount ? parseInt(detail.statistics.likeCount, 10) : undefined,
            commentCount: detail.statistics?.commentCount ? parseInt(detail.statistics.commentCount, 10) : undefined,
            duration: parseISO8601Duration(detail.contentDetails?.duration) || undefined,
          };
        });
      }
    } catch (err: any) {
      console.warn('[YOUTUBE_UPLOADS] Video statistics batch fetch note:', err.message);
    }
  }

  return rawVideos;
}

/**
 * Verifies whether a given video ID belongs to the creator's connected channel.
 */
export async function verifyVideoBelongsToChannel(
  videoId: string,
  expectedChannelId: string,
  accessToken?: string,
  apiKey?: string
): Promise<{ verified: boolean; video?: YouTubeVideoItem; reason?: string }> {
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

  const key = apiKey || config.youtube.apiKey || config.social.youtubeApiKey;
  const keyParam = key ? `&key=${key}` : '';
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
 * Resolves channels automatically and calculates genuine performance metrics.
 */
export async function syncCreatorYouTube(
  creatorId: string,
  channelInput?: string
): Promise<{
  success: boolean;
  channel: YouTubeChannelProfile;
  videos: YouTubeVideoItem[];
}> {
  // Find account in CONNECTED or LINKED status
  let account = await prisma.socialAccount.findFirst({
    where: {
      creatorId,
      platform: 'YOUTUBE',
      status: 'CONNECTED',
    },
  });

  let refData: any = {};
  if (account?.authorizationReference) {
    try {
      refData = JSON.parse(account.authorizationReference);
    } catch {
      // If authorizationReference was saved as raw URL string
      refData = { profileUrl: account.authorizationReference };
    }
  }

  const inputToResolve =
    channelInput ||
    account?.username ||
    refData?.customUrl ||
    refData?.profileUrl ||
    account?.authorizationReference ||
    '';

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

  const key = config.youtube.apiKey || config.social.youtubeApiKey;

  if (accessToken) {
    // 1. Authorized Owner OAuth flow
    profile = await fetchAuthenticatedChannel(accessToken);
    if (profile.uploadsPlaylistId) {
      videos = await fetchChannelUploads(profile.uploadsPlaylistId, accessToken);
    }
  } else if (key) {
    // 2. Public API Data flow using canonical resolution
    profile = await resolveYouTubeChannel(
      account?.platformAccountId && !account.platformAccountId.startsWith('yt_')
        ? account.platformAccountId
        : inputToResolve,
      key
    );

    if (profile.uploadsPlaylistId) {
      try {
        videos = await fetchChannelUploads(profile.uploadsPlaylistId, undefined, key);
      } catch (err: any) {
        console.warn('[YOUTUBE_SYNC] Uploads fetch notice:', err.message);
      }
    }
  } else {
    // 3. Fallback to existing stored records or oEmbed metadata
    profile = await resolveYouTubeChannel(inputToResolve);

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
      viewCount: c.views !== null ? Number(c.views) : undefined,
      likeCount: c.likes !== null ? c.likes : undefined,
      comments: c.comments !== null ? c.comments : undefined,
    }));
  }

  // Calculate genuine metrics
  const videosWithViews = videos.filter((v) => typeof v.viewCount === 'number');
  const avgViews =
    videosWithViews.length > 0
      ? Math.round(
          videosWithViews.slice(0, 10).reduce((acc, v) => acc + (v.viewCount || 0), 0) /
            Math.min(10, videosWithViews.length)
        )
      : profile.viewCount && profile.videoCount && profile.videoCount > 0
      ? Math.round(profile.viewCount / profile.videoCount)
      : null;

  const videosWithEng = videos.filter((v) => typeof v.viewCount === 'number' && (v.viewCount || 0) > 0);
  let avgEngRate: number | null = null;
  if (videosWithEng.length > 0) {
    const totalEng = videosWithEng.slice(0, 10).reduce((acc, v) => {
      const likes = v.likeCount || 0;
      const comments = v.commentCount || 0;
      const views = v.viewCount || 1;
      return acc + ((likes + comments) / views) * 100;
    }, 0);
    avgEngRate = Number((totalEng / Math.min(10, videosWithEng.length)).toFixed(1));
  }

  let postingCadence: number | null = null;
  if (videos.length >= 2) {
    const dates = videos
      .map((v) => new Date(v.publishedAt).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a);
    if (dates.length >= 2) {
      const spanWeeks = Math.max(1, (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24 * 7));
      postingCadence = Number((dates.length / spanWeeks).toFixed(1));
    }
  }

  // Update or create SocialAccount record
  const updatedRefData = {
    ...refData,
    channelId: profile.channelId,
    channelTitle: profile.title,
    customUrl: profile.customUrl,
    thumbnailUrl: profile.thumbnailUrl,
    subscriberCount: profile.subscriberCount,
    viewCount: profile.viewCount,
    videoCount: profile.videoCount,
    uploadsPlaylistId: profile.uploadsPlaylistId,
    ownershipVerified: Boolean(accessToken),
    connectionState: accessToken
      ? 'OWNER_AUTHORIZED'
      : profile.viewCount !== null
      ? 'PUBLIC_DATA_AVAILABLE'
      : 'PUBLIC_PROFILE_ADDED',
    averageViews: avgViews,
    engagementRate: avgEngRate,
    lastSyncedAt: new Date().toISOString(),
  };

  const accountUsername = profile.customUrl || profile.title || account?.username || 'YouTube Channel';

  if (account) {
    account = await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        platformAccountId: profile.channelId,
        username: accountUsername,
        authorizationReference: JSON.stringify(updatedRefData),
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    });
  } else {
    account = await prisma.socialAccount.create({
      data: {
        creatorId,
        platform: 'YOUTUBE',
        platformAccountId: profile.channelId,
        username: accountUsername,
        authorizationReference: JSON.stringify(updatedRefData),
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    });
  }

  // Upsert videos into Content table with real statistics
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
          views: video.viewCount !== undefined ? BigInt(video.viewCount) : undefined,
          likes: video.likeCount !== undefined ? video.likeCount : undefined,
          comments: video.commentCount !== undefined ? video.commentCount : undefined,
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
          views: video.viewCount !== undefined ? BigInt(video.viewCount) : null,
          likes: video.likeCount !== undefined ? video.likeCount : null,
          comments: video.commentCount !== undefined ? video.commentCount : null,
        },
      });
    } catch (err: any) {
      console.warn(`[CONTENT_UPSERT] Skipped video ${video.id}:`, err.message);
    }
  }

  // Record a verified metric snapshot
  await prisma.creatorMetricSnapshot.create({
    data: {
      creatorId,
      socialAccountId: account.id,
      followers: profile.subscriberCount,
      totalViews: profile.viewCount !== null ? BigInt(profile.viewCount) : null,
      averageViews: avgViews,
      engagementRate: avgEngRate,
      postingFrequency: postingCadence,
      source: accessToken ? 'YOUTUBE_OAUTH' : 'YOUTUBE_PUBLIC_DATA',
    },
  });

  return {
    success: true,
    channel: profile,
    videos,
  };
}
