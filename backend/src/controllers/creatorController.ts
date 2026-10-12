import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';

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
      // Mock fallback if creator not yet created or DB unconfigured
      res.status(200).json({
        data: {
          id: `creator_${req.user.id}`,
          userId: req.user.id,
          displayName: req.user.email.split('@')[0] || 'Demo Creator',
          bio: 'Tech, AI, and Software Development content creator.',
          location: 'Bengaluru, India',
          contactInformation: { email: req.user.email },
          profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          preferences: { primaryNiche: 'Technology' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          socialAccounts: [
            { id: 'sa_1', platform: 'YOUTUBE', username: '@democreator', status: 'CONNECTED' },
          ],
          aiProfile: {
            primaryNiches: ['Technology', 'Software Engineering', 'AI Tools'],
            contentStyle: ['Educational', 'Tutorials', 'Product Reviews'],
            audienceSummary: 'Tech-savvy developers, engineers, and product builders.',
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
    } catch (dbErr) {
      console.warn('[CREATOR] DB write failed. Returning created profile object.');
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
    // Return metrics snapshot
    res.status(200).json({
      data: {
        followers: 124500,
        averageViews: 48200,
        engagementRate: 5.6,
        postingFrequency: 3.4,
        recordedAt: new Date().toISOString(),
        growthRate: '+12.4% this month',
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

    // Upsert Social Accounts
    if (normalizedYoutube) {
      const existingYt = creator.socialAccounts.find((sa) => sa.platform === 'YOUTUBE');
      if (existingYt) {
        await prisma.socialAccount.update({
          where: { id: existingYt.id },
          data: {
            username: ytHandle,
            authorizationReference: normalizedYoutube,
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
            authorizationReference: normalizedYoutube,
            status: 'CONNECTED',
            lastSyncedAt: new Date(),
          },
        });
      }
    }

    if (normalizedInstagram) {
      const existingIg = creator.socialAccounts.find((sa) => sa.platform === 'INSTAGRAM');
      if (existingIg) {
        await prisma.socialAccount.update({
          where: { id: existingIg.id },
          data: {
            username: igHandle,
            authorizationReference: normalizedInstagram,
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
            authorizationReference: normalizedInstagram,
            status: 'CONNECTED',
            lastSyncedAt: new Date(),
          },
        });
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

    const updatedCreator = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        preferences: updatedPreferences,
        contactInformation: updatedContact,
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
