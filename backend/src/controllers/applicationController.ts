import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

function getParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

// Schema for creator applying to a campaign
export const applyCampaignSchema = z.object({
  pitch: z.string().max(3000, 'Pitch cannot exceed 3000 characters').optional().nullable(),
  proposedRate: z.union([z.number().positive('Proposed rate must be positive'), z.string()]).optional().nullable(),
  message: z.string().max(3000).optional().nullable(), // Alias for pitch supported in API spec
});

// Schema for brand updating application status
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'DECLINED', 'WITHDRAWN']),
  brandNote: z.string().max(2000, 'Note cannot exceed 2000 characters').optional().nullable(),
});

/**
 * POST /api/campaigns/:campaignId/applications
 * (and POST /api/campaigns/:campaignId/apply)
 * Creator submits an application/pitch to an active campaign.
 * Role required: CREATOR.
 */
export async function applyToCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      res.status(403).json({ error: 'Forbidden', message: 'Only creator accounts can submit campaign applications.' });
      return;
    }

    const campaignId = getParam(req.params.campaignId) || getParam(req.params.id);
    if (!campaignId) {
      res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
      return;
    }

    // Derive creator identity from verified server-side user session
    let creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      select: { id: true, displayName: true },
    });

    if (!creator && req.user.email) {
      creator = await prisma.creator.findFirst({
        where: { user: { email: req.user.email } },
        select: { id: true, displayName: true },
      });
    }

    if (!creator) {
      res.status(404).json({
        error: 'CreatorProfileNotFound',
        message: 'No creator profile found for authenticated user. Please complete onboarding first.',
      });
      return;
    }

    // Verify campaign existence and eligibility
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brand: {
          select: { id: true, name: true, userId: true },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'NotFound', message: 'Campaign not found.' });
      return;
    }

    // Campaign must be ACTIVE to accept applications
    if (campaign.status !== 'ACTIVE') {
      res.status(400).json({
        error: 'CampaignNotActive',
        message: `Campaign is currently ${campaign.status.toLowerCase()} and cannot accept new applications.`,
      });
      return;
    }

    // Prevent creator from applying to their own campaign if somehow a dual identity exists
    if (campaign.brand.userId === req.user.id) {
      res.status(400).json({ error: 'InvalidApplication', message: 'Cannot apply to a campaign owned by yourself.' });
      return;
    }

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        creatorId_campaignId: {
          creatorId: creator.id,
          campaignId: campaign.id,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'DuplicateApplication',
        message: 'You have already submitted an application to this campaign.',
        data: {
          applicationId: existing.id,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      });
      return;
    }

    // Validate body
    const parsed = applyCampaignSchema.parse(req.body);
    const pitchText = (parsed.pitch || parsed.message || '').trim() || null;
    const proposedRate = parsed.proposedRate !== undefined && parsed.proposedRate !== null
      ? Number(parsed.proposedRate)
      : null;

    const application = await prisma.application.create({
      data: {
        campaignId: campaign.id,
        creatorId: creator.id,
        pitch: pitchText,
        proposedRate: proposedRate !== null ? proposedRate : undefined,
        status: 'SUBMITTED',
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            brand: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      data: application,
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
 * GET /api/creators/me/applications
 * Returns all submitted applications for the authenticated creator.
 * Role required: CREATOR.
 */
export async function getMyCreatorApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      res.status(403).json({ error: 'Forbidden', message: 'Only creator accounts can access creator applications.' });
      return;
    }

    let creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!creator && req.user.email) {
      creator = await prisma.creator.findFirst({
        where: { user: { email: req.user.email } },
        select: { id: true },
      });
    }

    if (!creator) {
      res.status(404).json({ error: 'CreatorProfileNotFound', message: 'Creator profile not found.' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { creatorId: creator.id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            productOrService: true,
            budgetMin: true,
            budgetMax: true,
            platform: true,
            contentType: true,
            status: true,
            timeline: true,
            brand: {
              select: {
                id: true,
                name: true,
                category: true,
                website: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: applications,
      meta: { total: applications.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/campaigns/:campaignId/applications
 * Returns applications for a specific campaign.
 * Must be owned by the authenticated brand.
 * Role required: BRAND.
 */
export async function getCampaignApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can view campaign applications.' });
      return;
    }

    const campaignId = getParam(req.params.campaignId) || getParam(req.params.id);
    if (!campaignId) {
      res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
      return;
    }

    // Verify brand ownership
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!brand) {
      res.status(404).json({ error: 'BrandProfileNotFound', message: 'Brand profile not found.' });
      return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, brandId: true, title: true },
    });

    if (!campaign) {
      res.status(404).json({ error: 'NotFound', message: 'Campaign not found.' });
      return;
    }

    if (campaign.brandId !== brand.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to view applications for this campaign.' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { campaignId: campaign.id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            profileImageUrl: true,
            bio: true,
            location: true,
            socialAccounts: {
              select: {
                platform: true,
                username: true,
                status: true,
              },
            },
            metricSnapshots: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
              select: {
                followers: true,
                averageViews: true,
                engagementRate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: applications,
      meta: { total: applications.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/brands/me/applications
 * Returns all applications across all campaigns owned by the authenticated brand.
 * Role required: BRAND.
 */
export async function getMyBrandApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can view inbound applications.' });
      return;
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!brand) {
      res.status(404).json({ error: 'BrandProfileNotFound', message: 'Brand profile not found.' });
      return;
    }

    const statusQuery = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;

    const applications = await prisma.application.findMany({
      where: {
        campaign: { brandId: brand.id },
        ...(statusQuery && statusQuery !== 'ALL' ? { status: statusQuery as any } : {}),
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            platform: true,
            contentType: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            displayName: true,
            profileImageUrl: true,
            bio: true,
            location: true,
            socialAccounts: {
              select: {
                platform: true,
                username: true,
                status: true,
              },
            },
            metricSnapshots: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
              select: {
                followers: true,
                averageViews: true,
                engagementRate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      data: applications,
      meta: { total: applications.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/applications/:id
 * Retrieve details for a single application.
 * Creator can only view their own; Brand can only view applications for campaigns they own.
 */
export async function getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const id = getParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'BadRequest', message: 'Application ID is required.' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            brand: {
              select: { id: true, name: true, userId: true },
            },
          },
        },
        creator: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'NotFound', message: 'Application not found.' });
      return;
    }

    // Verify authorized party: either the creator or the campaign's owning brand
    const isOwnerCreator = application.creator.userId === req.user.id;
    const isOwnerBrand = application.campaign.brand.userId === req.user.id;

    if (!isOwnerCreator && !isOwnerBrand) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to view this application.' });
      return;
    }

    res.status(200).json({ data: application });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/applications/:id
 * (and PATCH /api/applications/:id/status)
 * Update application status (e.g. brand accepts or declines proposal).
 * Role required: BRAND (for review/accept/decline) or CREATOR (for withdraw).
 */
export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const id = getParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'BadRequest', message: 'Application ID is required.' });
      return;
    }

    const parsed = updateApplicationStatusSchema.parse(req.body);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            brand: {
              select: { id: true, userId: true, name: true },
            },
          },
        },
        creator: {
          select: { id: true, userId: true, displayName: true },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'NotFound', message: 'Application not found.' });
      return;
    }

    // Authorization checks based on requested status transition
    if (parsed.status === 'WITHDRAWN') {
      if (application.creator.userId !== req.user.id) {
        res.status(403).json({ error: 'Forbidden', message: 'Only the applicant creator can withdraw an application.' });
        return;
      }
    } else {
      // ACCEPTED, DECLINED, or UNDER_REVIEW require the brand owning the campaign
      if (application.campaign.brand.userId !== req.user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only the brand owning this campaign can review, accept, or decline applications.',
        });
        return;
      }
    }

    // Enforce valid status transitions
    if (application.status === 'ACCEPTED' && parsed.status !== 'ACCEPTED') {
      res.status(400).json({
        error: 'InvalidStatusTransition',
        message: 'Application has already been accepted and cannot be reverted.',
      });
      return;
    }

    if (application.status === 'DECLINED' && parsed.status === 'DECLINED') {
      res.status(400).json({
        error: 'InvalidStatusTransition',
        message: 'Application is already declined.',
      });
      return;
    }

    // Use transaction if acceptance requires creating or updating a collaboration record
    let updatedApplication;
    if (parsed.status === 'ACCEPTED') {
      updatedApplication = await prisma.$transaction(async (tx: any) => {
        const app = await (tx.application || tx.applications).update({
          where: { id },
          data: {
            status: 'ACCEPTED',
            brandNote: parsed.brandNote || application.brandNote,
          },
          include: {
            campaign: {
              select: { id: true, title: true, brandId: true },
            },
            creator: {
              select: { id: true, displayName: true },
            },
          },
        });

        // Ensure collaboration exists without duplicate creations
        const existingCollab = await tx.collaboration.findFirst({
          where: {
            creatorId: app.creatorId,
            campaignId: app.campaignId,
          },
        });

        if (!existingCollab) {
          await tx.collaboration.create({
            data: {
              creatorId: app.creatorId,
              brandId: application.campaign.brand.id,
              campaignId: app.campaignId,
              agreedAmount: app.proposedRate || undefined,
              status: 'PROPOSED',
            },
          });
        }

        return app;
      }, {
        maxWait: 15000,
        timeout: 30000,
      });
    } else {
      updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status: parsed.status,
          brandNote: parsed.brandNote !== undefined ? parsed.brandNote : application.brandNote,
        },
        include: {
          campaign: {
            select: { id: true, title: true, brandId: true },
          },
          creator: {
            select: { id: true, displayName: true },
          },
        },
      });
    }

    res.status(200).json({
      message: `Application marked as ${parsed.status.toLowerCase()}.`,
      data: updatedApplication,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'ValidationError', issues: err.issues });
      return;
    }
    next(err);
  }
}
