import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  productOrService: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  targetAudience: z.any().optional().nullable(),
  budgetMin: z.union([z.number(), z.string()]).optional().nullable(),
  budgetMax: z.union([z.number(), z.string()]).optional().nullable(),
  requiredReach: z.union([z.number(), z.string()]).optional().nullable(),
  platform: z.enum(['YOUTUBE', 'INSTAGRAM']).optional().nullable(),
  contentType: z.string().optional().nullable(),
  contentStyle: z.string().optional().nullable(),
  creatorNiche: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timeline: z.any().optional().nullable(),
  exclusivity: z.string().optional().nullable(),
  usageRights: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional().default('ACTIVE'),
});

/**
 * GET /api/campaigns
 * Returns published/active campaigns for creator discovery.
 * Public to authenticated users (creators and brands).
 */
export async function getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const statusQuery = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ACTIVE';
    const platformQuery = typeof req.query.platform === 'string' ? req.query.platform.toUpperCase() : undefined;
    const nicheQuery = typeof req.query.niche === 'string' ? req.query.niche : undefined;

    const whereClause: any = {
      status: statusQuery === 'ALL' ? undefined : (statusQuery as any),
    };

    if (platformQuery && (platformQuery === 'YOUTUBE' || platformQuery === 'INSTAGRAM')) {
      whereClause.platform = platformQuery;
    }

    if (nicheQuery) {
      whereClause.creatorNiche = {
        contains: nicheQuery,
        mode: 'insensitive',
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            category: true,
            website: true,
            description: true,
          },
        },
        aiProfile: {
          select: {
            inferredNiches: true,
            semanticSummary: true,
            commercialCategories: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: campaigns,
      meta: {
        total: campaigns.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/campaigns/:id
 * Retrieves campaign details by ID.
 */
export async function getCampaignById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])[0];
    if (!id) {
      res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
      return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            category: true,
            website: true,
            description: true,
            targetMarkets: true,
          },
        },
        aiProfile: true,
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'NotFound', message: 'Campaign not found.' });
      return;
    }

    res.status(200).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/campaigns
 * Creates a campaign for the authenticated brand.
 * Requires BRAND role.
 */
export async function createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can create campaigns.' });
      return;
    }

    // Resolve brand identity owned by the authenticated user
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true, name: true },
    });

    if (!brand) {
      res.status(404).json({
        error: 'BrandProfileNotFound',
        message: 'No brand profile associated with authenticated user. Please complete onboarding first.',
      });
      return;
    }

    const parsed = createCampaignSchema.parse(req.body);

    const budgetMin = parsed.budgetMin !== undefined && parsed.budgetMin !== null ? Number(parsed.budgetMin) : null;
    const budgetMax = parsed.budgetMax !== undefined && parsed.budgetMax !== null ? Number(parsed.budgetMax) : null;
    const requiredReach = parsed.requiredReach !== undefined && parsed.requiredReach !== null ? Number(parsed.requiredReach) : null;

    if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Minimum budget cannot exceed maximum budget.',
      });
      return;
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        brandId: brand.id,
        title: parsed.title,
        description: parsed.description,
        productOrService: parsed.productOrService || null,
        objective: parsed.objective || null,
        targetAudience: parsed.targetAudience || {},
        budgetMin: budgetMin !== null ? budgetMin : undefined,
        budgetMax: budgetMax !== null ? budgetMax : undefined,
        requiredReach: requiredReach !== null ? requiredReach : undefined,
        platform: parsed.platform || 'YOUTUBE',
        contentType: parsed.contentType || null,
        contentStyle: parsed.contentStyle || null,
        creatorNiche: parsed.creatorNiche || null,
        location: parsed.location || null,
        timeline: parsed.timeline || {},
        exclusivity: parsed.exclusivity || null,
        usageRights: parsed.usageRights || null,
        coverImage: parsed.coverImage || parsed.posterUrl || (parsed.timeline as any)?.posterUrl || (parsed.timeline as any)?.coverImage || null,
        status: parsed.status,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            category: true,
            website: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Campaign created successfully.',
      data: newCampaign,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'ValidationError', issues: err.issues });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/brands/me/campaigns
 * Lists campaigns owned by the authenticated brand.
 * Requires BRAND role.
 */
export async function getMyBrandCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can access brand campaigns.' });
      return;
    }

    // Resolve brand identity from authenticated user
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true, name: true },
    });

    if (!brand) {
      res.status(404).json({
        error: 'BrandProfileNotFound',
        message: 'No brand profile associated with authenticated user.',
      });
      return;
    }

    const campaigns = await prisma.campaign.findMany({
      where: { brandId: brand.id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            category: true,
            website: true,
          },
        },
        aiProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: campaigns,
      meta: {
        total: campaigns.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/campaigns/:id
 * Removes/deletes a campaign event and its dependent records.
 */
export async function deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])[0];
    if (!id) {
      res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
      return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      res.status(404).json({ error: 'NotFound', message: 'Campaign event not found.' });
      return;
    }

    // Safely remove any dependent records
    await prisma.application.deleteMany({ where: { campaignId: id } });
    await prisma.match.deleteMany({ where: { campaignId: id } });
    await prisma.campaignShortlist.deleteMany({ where: { campaignId: id } });
    await prisma.campaignAIProfile.deleteMany({ where: { campaignId: id } });
    await prisma.conversation.deleteMany({ where: { campaignId: id } });
    await prisma.collaboration.deleteMany({ where: { campaignId: id } });

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Campaign event removed successfully.',
      data: { id },
    });
  } catch (err) {
    next(err);
  }
}

