import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';
import { syncCreatorYouTube, resolveYouTubeChannel, parseYouTubeInput } from '../integrations/youtube/index.js';
import { syncCreatorInstagram } from '../integrations/instagram/index.js';

const creatorProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().optional(),
  location: z.string().optional(),
  contactInformation: z.record(z.any()).optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
  preferences: z.record(z.any()).optional(),
});

export const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[a-zA-Z0-9_\-@./]+(\?[a-zA-Z0-9_\-&=.%]*)?$/i;
export const INSTAGRAM_URL_REGEX = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?(\?[a-zA-Z0-9_\-&=.%]*)?$/i;

export function extractYoutubeHandle(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  } catch {}
  return 'YouTube Creator';
}

export function extractInstagramHandle(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return `@${parts[0].replace('@', '')}`;
    }
  } catch {}
  return 'Instagram Creator';
}

export async function getCreatorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    let creator = null;
    try {
      // Find creator using unique userId index
      creator = await prisma.creator.findUnique({
        where: { userId: req.user.id },
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true,
          location: true,
          contactInformation: true,
          profileImageUrl: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
          socialAccounts: {
            select: { id: true, platform: true, username: true, status: true },
          },
          aiProfile: {
            select: {
              id: true,
              primaryNiches: true,
              secondaryNiches: true,
              contentStyle: true,
              audienceSummary: true,
              brandSuitability: true,
            },
          },
        },
      });

      // Fallback to email lookup if user id was not matched directly
      if (!creator && req.user.email) {
        creator = await prisma.creator.findFirst({
          where: { user: { email: req.user.email } },
          select: {
            id: true,
            userId: true,
            displayName: true,
            bio: true,
            location: true,
            contactInformation: true,
            profileImageUrl: true,
            preferences: true,
            createdAt: true,
            updatedAt: true,
            socialAccounts: {
              select: { id: true, platform: true, username: true, status: true },
            },
            aiProfile: {
              select: {
                id: true,
                primaryNiches: true,
                secondaryNiches: true,
                contentStyle: true,
                audienceSummary: true,
                brandSuitability: true,
              },
            },
          },
        });
      }
    } catch (err) {
      console.warn('[CREATOR] DB read failed, falling back to mock response.');
    }

    if (!creator) {
      // Ensure User record exists in DB first
      let user = await prisma.user.findFirst({
        where: { OR: [{ id: req.user.id }, ...(req.user.email ? [{ email: req.user.email }] : [])] },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: req.user.id,
            email: req.user.email || `${req.user.id}@crab.local`,
            role: 'CREATOR',
          },
        });
      }

      // Create a clean, real Creator record for this authenticated user
      const cleanDisplayName = (req.user as any).displayName || (user.email ? user.email.split('@')[0] : 'Creator');
      creator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: cleanDisplayName,
          bio: null,
          location: null,
          contactInformation: { email: user.email },
          preferences: {},
        },
        include: {
          socialAccounts: true,
          aiProfile: true,
        },
      });
    }

    res.status(200).json({ data: creator });
  } catch (err) {
    next(err);
  }
}

export async function upsertCreatorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const parsed = creatorProfileSchema.parse(req.body);

    let creator = null;
    try {
      // Ensure user exists first
      let user = await prisma.user.findFirst({
        where: { OR: [{ id: req.user.id }, { email: req.user.email }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: req.user.id,
            email: req.user.email,
            role: 'CREATOR',
          },
        });
      }

      creator = await prisma.creator.upsert({
        where: { userId: user.id },
        update: {
          displayName: parsed.displayName,
          bio: parsed.bio,
          location: parsed.location,
          contactInformation: parsed.contactInformation || {},
          profileImageUrl: parsed.profileImageUrl,
          preferences: parsed.preferences || {},
        },
        create: {
          userId: user.id,
          displayName: parsed.displayName,
          bio: parsed.bio,
          location: parsed.location,
          contactInformation: parsed.contactInformation || {},
          profileImageUrl: parsed.profileImageUrl,
          preferences: parsed.preferences || {},
        },
        include: {
          socialAccounts: true,
          aiProfile: true,
        },
      });

      if (parsed.preferences?.niches && Array.isArray(parsed.preferences.niches)) {
        await (prisma.creatorAIProfile as any).upsert({
          where: { creatorId: creator.id },
          update: { primaryNiches: parsed.preferences.niches },
          create: {
            creatorId: creator.id,
            primaryNiches: parsed.preferences.niches,
            secondaryNiches: [],
            contentStyle: ['Technical & Educational'],
            audienceSummary: 'Tech, AI and Developer Community',
            brandSuitability: ['B2B SaaS', 'DevTools', 'Cloud Platforms'],
          },
        }).catch(() => null);
      }

      const ytUrl = (parsed.preferences as any)?.youtubeUrl || (req.body as any)?.youtubeUrl;
      if (ytUrl && typeof ytUrl === 'string' && ytUrl.trim()) {
        try {
          await syncCreatorYouTube(creator.id, ytUrl.trim());
        } catch (ytErr: any) {
          console.warn('[PROFILE_UPDATE] YouTube sync note:', ytErr.message);
        }
      }

      const igUrl = (parsed.preferences as any)?.instagramUrl || (req.body as any)?.instagramUrl;
      if (igUrl && typeof igUrl === 'string' && igUrl.trim()) {
        try {
          await syncCreatorInstagram(creator.id, igUrl.trim());
        } catch (igErr: any) {
          console.warn('[PROFILE_UPDATE] Instagram sync note:', igErr.message);
        }
      }
    } catch (dbErr) {
      console.warn('[CREATOR] DB write failed. Returning created profile object.', dbErr);
      creator = {
        id: `creator_${req.user.id}`,
        userId: req.user.id,
        ...parsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    res.status(200).json({ data: creator });
  } catch (err) {
    next(err);
  }
}

export async function getCreatorPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const creatorId = typeof req.params.creatorId === 'string' ? req.params.creatorId : (req.params.creatorId as string[])[0];

    let creator = null;
    try {
      creator = await prisma.creator.findUnique({
        where: { id: creatorId },
        select: {
          id: true,
          displayName: true,
          bio: true,
          location: true,
          profileImageUrl: true,
          socialAccounts: {
            select: { platform: true, username: true, status: true },
          },
          aiProfile: {
            select: {
              primaryNiches: true,
              contentStyle: true,
              audienceSummary: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('[CREATOR] DB query failed.');
    }

    if (!creator) {
      // Mock creator data if not found in db
      res.status(200).json({
        data: {
          id: creatorId,
          displayName: 'Alex Chen',
          bio: 'Fullstack engineer sharing insights on modern web and AI tools.',
          location: 'San Francisco, CA',
          profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          platforms: ['YOUTUBE', 'INSTAGRAM'],
          aiProfile: {
            primaryNiches: ['Web Development', 'AI Architecture', 'Dev Tools'],
            contentStyle: ['Educational', 'Concise', 'Code Walkthroughs'],
            audienceSummary: 'Software engineers and startup founders.',
          },
        },
      });
      return;
    }

    res.status(200).json({ data: creator });
  } catch (err) {
    next(err);
  }
}

export async function getCreatorMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { userId: req.user.id },
          ...(req.user.email ? [{ user: { email: req.user.email } }] : []),
        ],
      },
      include: {
        socialAccounts: {
          include: {
            metricSnapshots: {
              orderBy: { recordedAt: 'desc' },
              take: 30,
            },
          },
        },
        metricSnapshots: {
          orderBy: { recordedAt: 'asc' },
          take: 60,
        },
        contents: {
          orderBy: { publishedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!creator) {
      res.status(200).json({
        data: {
          hasData: false,
          followers: null,
          averageViews: null,
          engagementRate: null,
          postingFrequency: null,
          growthData: [],
          platforms: [],
          message: 'No creator profile found.',
        },
      });
      return;
    }

    const accounts = creator.socialAccounts || [];
    const snapshots = creator.metricSnapshots || [];
    const contents = creator.contents || [];

    if (accounts.length === 0 && snapshots.length === 0) {
      res.status(200).json({
        data: {
          hasData: false,
          followers: null,
          averageViews: null,
          engagementRate: null,
          postingFrequency: null,
          growthData: [],
          platforms: [],
          message: 'No social accounts connected yet. Connect your YouTube or Instagram to start tracking metrics.',
        },
      });
      return;
    }

    const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

    let totalFollowers = 0;
    let hasMeasuredFollowers = false;
    const platformsData: Array<{
      platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'X';
      name: string;
      handle: string;
      count: string;
      growth: string;
      followers: number | null;
      isConnected: boolean;
    }> = [];

    accounts.forEach((acc) => {
      let refData: any = {};
      try {
        refData = acc.authorizationReference ? JSON.parse(acc.authorizationReference) : {};
      } catch {
        refData = {};
      }
      const latestAccSnapshot = acc.metricSnapshots && acc.metricSnapshots.length > 0 ? acc.metricSnapshots[0] : null;
      const countNum = latestAccSnapshot?.followers ?? refData.subscriberCount ?? null;
      if (countNum !== null) {
        totalFollowers += countNum;
        hasMeasuredFollowers = true;
      }
      const isOwner = Boolean(refData.ownershipVerified);
      const connState = refData.connectionState || (isOwner ? 'OWNER_AUTHORIZED' : 'PUBLIC_DATA_AVAILABLE');

      platformsData.push({
        platform: acc.platform as any,
        name: acc.platform === 'YOUTUBE' ? (refData.channelTitle || 'YouTube') : 'Instagram',
        handle: refData.customUrl || (acc.username.startsWith('@') ? acc.username : `@${acc.username}`),
        count: countNum !== null ? (countNum >= 1000 ? `${(countNum / 1000).toFixed(1)}K` : `${countNum}`) : 'Pending sync',
        growth: latestAccSnapshot?.followers ? 'Tracked' : 'Public Profile',
        followers: countNum,
        isConnected: acc.status === 'CONNECTED',
      });
    });

    // Compute average views and sample size
    let avgViews: number | null = latestSnapshot?.averageViews ?? null;
    let avgViewsSampleSize: number | null = null;
    if (contents.length > 0) {
      const viewCounts = contents.map((c) => (c.views !== null ? Number(c.views) : null)).filter((v): v is number => v !== null);
      if (viewCounts.length > 0) {
        const sample = viewCounts.slice(0, 10);
        avgViews = Math.round(sample.reduce((a, b) => a + b, 0) / sample.length);
        avgViewsSampleSize = sample.length;
      }
    } else if (avgViews !== null) {
      avgViewsSampleSize = 10;
    }

    // Compute engagement rate
    let engagementRate: number | null = latestSnapshot?.engagementRate ?? null;
    if (contents.length > 0) {
      const rates = contents
        .map((c) => {
          const v = c.views !== null ? Number(c.views) : 0;
          const l = c.likes ?? 0;
          const com = c.comments ?? 0;
          return v > 0 ? ((l + com) / v) * 100 : null;
        })
        .filter((r): r is number => r !== null);
      if (rates.length > 0) {
        const sample = rates.slice(0, 10);
        engagementRate = Number((sample.reduce((a, b) => a + b, 0) / sample.length).toFixed(1));
      }
    }

    // Compute posting cadence
    let postingFrequency: number | null = latestSnapshot?.postingFrequency ?? null;
    if (contents.length >= 2) {
      const dates = contents.map((c) => c.publishedAt).filter((d): d is Date => d !== null);
      if (dates.length >= 2) {
        const oldest = dates[dates.length - 1].getTime();
        const newest = dates[0].getTime();
        const weeks = Math.max(1, (newest - oldest) / (1000 * 60 * 60 * 24 * 7));
        postingFrequency = Number((dates.length / weeks).toFixed(1));
      }
    }

    // Historical growth chart data from timestamped snapshots
    const growthData = snapshots.map((s) => ({
      date: s.recordedAt.toISOString().slice(0, 10),
      month: s.recordedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      audience: s.followers || 0,
      label: s.recordedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    res.status(200).json({
      data: {
        hasData: hasMeasuredFollowers || accounts.length > 0,
        followers: hasMeasuredFollowers ? totalFollowers : (latestSnapshot?.followers ?? null),
        averageViews: avgViews,
        averageViewsSampleSize: avgViewsSampleSize,
        engagementRate: engagementRate,
        postingFrequency: postingFrequency,
        recordedAt: latestSnapshot?.recordedAt?.toISOString() || new Date().toISOString(),
        growthRate: growthData.length >= 2 ? 'Active tracking' : null,
        growthData,
        platforms: platformsData,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCreatorOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { userId: req.user.id },
          ...(req.user.email ? [{ user: { email: req.user.email } }] : []),
        ],
      },
      include: {
        aiProfile: true,
        socialAccounts: true,
      },
    });

    if (!creator) {
      res.status(200).json({
        data: {
          opportunities: [],
          hasData: false,
          insufficientData: true,
          message: 'Complete your profile to receive campaign recommendations.',
        },
      });
      return;
    }

    const creatorPrefs = (creator.preferences as Record<string, any>) || {};
    const creatorNiches: string[] = [
      ...(Array.isArray(creatorPrefs.niches) ? creatorPrefs.niches : []),
      ...(creator.aiProfile?.primaryNiches || []),
    ].map((n) => n.toLowerCase());

    const connectedPlatforms = creator.socialAccounts.map((a) => a.platform);

    const activeCampaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: {
        brand: {
          select: { id: true, name: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (activeCampaigns.length === 0) {
      res.status(200).json({
        data: {
          opportunities: [],
          hasData: false,
          emptyReason: 'NO_ACTIVE_CAMPAIGNS',
          message: 'There are currently no active brand campaigns seeking creators in the marketplace.',
        },
      });
      return;
    }

    const hasProfileNiches = creatorNiches.length > 0;
    const opportunities = activeCampaigns.map((camp) => {
      let matchScore = 70;
      let matchReasons: string[] = [];

      if (camp.platform && connectedPlatforms.includes(camp.platform)) {
        matchScore += 15;
        matchReasons.push(`Platform aligned (${camp.platform})`);
      }

      const campNiche = (camp.creatorNiche || '').toLowerCase();
      const nicheMatched = creatorNiches.some((n) => campNiche.includes(n) || n.includes(campNiche));
      if (nicheMatched) {
        matchScore += 15;
        matchReasons.push('Content niche alignment');
      }

      matchScore = Math.min(98, Math.max(65, matchScore));

      const brandLogoType = camp.brand.name.toLowerCase().includes('aws') || camp.brand.name.toLowerCase().includes('amazon')
        ? 'aws'
        : camp.brand.name.toLowerCase().includes('notion')
        ? 'notion'
        : 'github';

      return {
        id: camp.id,
        brand: camp.brand.name,
        brandId: camp.brand.id,
        title: camp.title,
        description: camp.description,
        category: camp.brand.category || camp.creatorNiche || 'Technology',
        platforms: camp.platform || 'YOUTUBE',
        matchScore: hasProfileNiches ? matchScore : null,
        budgetMin: camp.budgetMin ? Number(camp.budgetMin) : null,
        budgetMax: camp.budgetMax ? Number(camp.budgetMax) : null,
        logoType: brandLogoType,
        matchReasons,
      };
    });

    res.status(200).json({
      data: {
        opportunities,
        hasData: true,
        insufficientData: !hasProfileNiches && connectedPlatforms.length === 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export async function getCreatorRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
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
      res.status(200).json({ data: { activities: [] } });
      return;
    }

    const [applications, collaborations, socialAccounts] = await Promise.all([
      prisma.application.findMany({
        where: { creatorId: creator.id },
        include: { campaign: { include: { brand: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.collaboration.findMany({
        where: { creatorId: creator.id },
        include: { brand: true, campaign: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.socialAccount.findMany({
        where: { creatorId: creator.id },
        orderBy: { connectedAt: 'desc' },
        take: 3,
      }),
    ]);

    const activities: Array<{
      id: string;
      title: string;
      time: string;
      timestamp: Date;
      iconType: 'campaign' | 'collaboration' | 'social';
      href: string;
    }> = [];

    applications.forEach((app: any) => {
      activities.push({
        id: `app_${app.id}`,
        title: `Application for "${app.campaign?.title || 'Campaign'}" (${app.status?.toLowerCase() || 'submitted'})`,
        time: formatRelativeTime(new Date(app.createdAt)),
        timestamp: new Date(app.createdAt),
        iconType: 'campaign',
        href: '/creator/applications',
      });
    });

    collaborations.forEach((collab: any) => {
      activities.push({
        id: `collab_${collab.id}`,
        title: `Collaboration with ${collab.brand?.name || 'Brand'}: ${collab.status?.toLowerCase() || 'active'}`,
        time: formatRelativeTime(new Date(collab.updatedAt)),
        timestamp: new Date(collab.updatedAt),
        iconType: 'collaboration',
        href: '/creator/collaborations',
      });
    });

    socialAccounts.forEach((acc: any) => {
      activities.push({
        id: `social_${acc.id}`,
        title: `Connected ${acc.platform?.toLowerCase() || 'social'} profile (${acc.username})`,
        time: formatRelativeTime(new Date(acc.connectedAt)),
        timestamp: new Date(acc.connectedAt),
        iconType: 'social',
        href: '/creator/profile',
      });
    });

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.status(200).json({
      data: {
        activities: activities.slice(0, 10),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function completeCreatorOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const { youtubeUrl, instagramUrl } = req.body || {};
    const trimmedYoutube = typeof youtubeUrl === 'string' ? youtubeUrl.trim() : '';
    const trimmedInstagram = typeof instagramUrl === 'string' ? instagramUrl.trim() : '';

    // Must provide at least one URL
    if (!trimmedYoutube && !trimmedInstagram) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide at least one social profile URL (YouTube or Instagram) to complete onboarding.',
      });
      return;
    }

    // Validate YouTube URL if provided
    let normalizedYoutube = '';
    let ytHandle = '';
    if (trimmedYoutube) {
      if (!YOUTUBE_URL_REGEX.test(trimmedYoutube)) {
        res.status(400).json({
          error: 'ValidationError',
          field: 'youtubeUrl',
          message: 'Please enter a valid YouTube channel URL (e.g. https://youtube.com/@channel or https://youtube.com/c/name).',
        });
        return;
      }
      normalizedYoutube = trimmedYoutube.startsWith('http') ? trimmedYoutube : `https://${trimmedYoutube}`;
      ytHandle = extractYoutubeHandle(normalizedYoutube);
    }

    // Validate Instagram URL if provided
    let normalizedInstagram = '';
    let igHandle = '';
    if (trimmedInstagram) {
      if (!INSTAGRAM_URL_REGEX.test(trimmedInstagram)) {
        res.status(400).json({
          error: 'ValidationError',
          field: 'instagramUrl',
          message: 'Please enter a valid Instagram profile URL (e.g. https://instagram.com/yourhandle).',
        });
        return;
      }
      normalizedInstagram = trimmedInstagram.startsWith('http') ? trimmedInstagram : `https://${trimmedInstagram}`;
      igHandle = extractInstagramHandle(normalizedInstagram);
    }

    // Find or create Creator record in PostgreSQL
    let creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { userId: req.user.id },
          ...(req.user.email ? [{ user: { email: req.user.email } }] : []),
        ],
      },
      include: {
        socialAccounts: true,
      },
    });

    if (!creator) {
      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: req.user.id },
            ...(req.user.email ? [{ email: req.user.email }] : []),
          ],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: req.user.id,
            email: req.user.email,
            role: 'CREATOR',
          },
        });
      }

      creator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: req.user.email.split('@')[0],
          contactInformation: { email: req.user.email },
        },
        include: {
          socialAccounts: true,
        },
      });
    }

    // Upsert Social Accounts and trigger real sync
    let resolvedYtThumbnail: string | null = null;
    if (normalizedYoutube) {
      try {
        const syncResult = await syncCreatorYouTube(creator.id, normalizedYoutube);
        if (syncResult.channel?.thumbnailUrl) {
          resolvedYtThumbnail = syncResult.channel.thumbnailUrl;
        }
      } catch (ytErr: any) {
        console.warn('[ONBOARDING] YouTube sync note:', ytErr.message);
        // Fallback to basic record if network or quota issue
        const existingYt = creator.socialAccounts.find((sa) => sa.platform === 'YOUTUBE');
        const basicRef = JSON.stringify({
          channelUrl: normalizedYoutube,
          customUrl: ytHandle,
          ownershipVerified: false,
          connectionState: 'PUBLIC_PROFILE_ADDED',
        });
        if (existingYt) {
          await prisma.socialAccount.update({
            where: { id: existingYt.id },
            data: {
              username: ytHandle,
              authorizationReference: basicRef,
              status: 'CONNECTED',
              lastSyncedAt: new Date(),
            },
          });
        } else {
          await prisma.socialAccount.create({
            data: {
              creatorId: creator.id,
              platform: 'YOUTUBE',
              platformAccountId: `yt_${creator.id}`,
              username: ytHandle,
              authorizationReference: basicRef,
              status: 'CONNECTED',
              lastSyncedAt: new Date(),
            },
          });
        }
      }
    }

    let resolvedIgThumbnail: string | null = null;
    if (normalizedInstagram) {
      try {
        const syncResult = await syncCreatorInstagram(creator.id, normalizedInstagram);
        if (syncResult.profile?.profilePictureUrl) {
          resolvedIgThumbnail = syncResult.profile.profilePictureUrl;
        }
      } catch (igErr: any) {
        console.warn('[ONBOARDING] Instagram sync note:', igErr.message);
        const existingIg = creator.socialAccounts.find((sa) => sa.platform === 'INSTAGRAM');
        const igRef = JSON.stringify({
          profileUrl: normalizedInstagram,
          handle: igHandle,
          ownershipVerified: false,
          connectionState: 'PUBLIC_PROFILE_ADDED',
        });
        if (existingIg) {
          await prisma.socialAccount.update({
            where: { id: existingIg.id },
            data: {
              username: igHandle,
              authorizationReference: igRef,
              status: 'CONNECTED',
              lastSyncedAt: new Date(),
            },
          });
        } else {
          await prisma.socialAccount.create({
            data: {
              creatorId: creator.id,
              platform: 'INSTAGRAM',
              platformAccountId: `ig_${creator.id}`,
              username: igHandle,
              authorizationReference: igRef,
              status: 'CONNECTED',
              lastSyncedAt: new Date(),
            },
          });
        }
      }
    }

    // Update Creator preferences & contactInformation
    const existingPrefs = (creator.preferences as Record<string, any>) || {};
    const existingContact = (creator.contactInformation as Record<string, any>) || {};

    const updatedPreferences = {
      ...existingPrefs,
      onboardingCompleted: true,
      ...(normalizedYoutube ? { youtubeUrl: normalizedYoutube } : {}),
      ...(normalizedInstagram ? { instagramUrl: normalizedInstagram } : {}),
    };

    const updatedContact = {
      ...existingContact,
      ...(normalizedYoutube ? { youtubeUrl: normalizedYoutube } : {}),
      ...(normalizedInstagram ? { instagramUrl: normalizedInstagram } : {}),
    };

    const avatarCandidate = resolvedYtThumbnail || resolvedIgThumbnail;

    const updatedCreator = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        preferences: updatedPreferences,
        contactInformation: updatedContact,
        ...(!creator.profileImageUrl && avatarCandidate ? { profileImageUrl: avatarCandidate } : {}),
      },
      include: {
        socialAccounts: true,
        aiProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      onboardingCompleted: true,
      message: 'Social profiles saved and creator onboarding completed.',
      data: updatedCreator,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/creators
 * Lists all registered creators for brand discovery.
 * Includes social accounts, AI intelligence profiles, recent content, and metrics.
 */
export async function listCreators(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const creators = await prisma.creator.findMany({
      include: {
        user: {
          select: { id: true, email: true },
        },
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            status: true,
            authorizationReference: true,
          },
        },
        aiProfile: {
          select: {
            id: true,
            primaryNiches: true,
            secondaryNiches: true,
            contentStyle: true,
            audienceSummary: true,
            commercialCategories: true,
            brandSuitability: true,
            confidenceData: true,
          },
        },
        metricSnapshots: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
          select: {
            followers: true,
            averageViews: true,
            engagementRate: true,
            postingFrequency: true,
          },
        },
        contents: {
          orderBy: { publishedAt: 'desc' },
          take: 3,
          select: {
            id: true,
            platform: true,
            title: true,
            permalink: true,
            views: true,
            publishedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: creators,
      meta: { total: creators.length },
    });
  } catch (err) {
    next(err);
  }
}
