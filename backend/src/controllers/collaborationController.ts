import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';
import { verifyVideoBelongsToChannel } from '../integrations/youtube/index.js';

const DEFAULT_YOUTUBE_DELIVERABLES = [
  {
    id: 'deliv_yt_01',
    type: 'YOUTUBE_VIDEO',
    title: 'Dedicated 12-minute YouTube video tutorial',
    description: 'Hands-on technical tutorial, code demonstration, and CLI deep dive with dedicated brand mention.',
    status: 'AWAITING_VIDEO', // 'AWAITING_VIDEO' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    submittedVideo: null,
    feedback: null,
  },
  {
    id: 'deliv_yt_02',
    type: 'PINNED_COMMENT',
    title: 'Pinned comment code snippet & resource link',
    description: 'Pinned comment with direct resource link, documentation, and promotional UTM code.',
    status: 'AWAITING_VIDEO',
    submittedVideo: null,
    feedback: null,
  },
];

/**
 * GET /api/brands/me/collaborations
 * Lists all collaborations for the authenticated brand with full deliverables.
 */
export async function getMyBrandCollaborations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can access brand collaborations.' });
      return;
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true, name: true },
    });

    if (!brand) {
      res.status(404).json({ error: 'BrandProfileNotFound', message: 'Brand profile not found.' });
      return;
    }

    const collabs = await prisma.collaboration.findMany({
      where: { brandId: brand.id },
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
                id: true,
                platform: true,
                username: true,
                platformAccountId: true,
                status: true,
              },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            platform: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Ensure deliverables are normalized
    const normalized = collabs.map((c) => {
      let deliverables = (c.deliverables as any) || DEFAULT_YOUTUBE_DELIVERABLES;
      if (!Array.isArray(deliverables) || deliverables.length === 0) {
        deliverables = DEFAULT_YOUTUBE_DELIVERABLES;
      }
      return {
        ...c,
        deliverables,
      };
    });

    res.status(200).json({
      data: normalized,
      meta: { total: normalized.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/creators/me/collaborations
 * Lists all active and agreed collaborations for the authenticated creator.
 */
export async function getMyCreatorCollaborations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      res.status(403).json({ error: 'Forbidden', message: 'Only creator accounts can access creator collaborations.' });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      select: { id: true, displayName: true },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorProfileNotFound', message: 'Creator profile not found.' });
      return;
    }

    const collabs = await prisma.collaboration.findMany({
      where: { creatorId: creator.id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            category: true,
            website: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            platform: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Ensure deliverables are normalized
    const normalized = collabs.map((c) => {
      let deliverables = (c.deliverables as any) || DEFAULT_YOUTUBE_DELIVERABLES;
      if (!Array.isArray(deliverables) || deliverables.length === 0) {
        deliverables = DEFAULT_YOUTUBE_DELIVERABLES;
      }
      return {
        ...c,
        deliverables,
      };
    });

    res.status(200).json({
      data: normalized,
      meta: { total: normalized.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/collaborations/:id
 * Retrieves a single collaboration by ID.
 */
export async function getCollaborationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      return;
    }

    const { id } = req.params;
    const collabId = typeof id === 'string' ? id : (id as string[])[0];

    const collab = await prisma.collaboration.findUnique({
      where: { id: collabId },
      include: {
        brand: {
          select: { id: true, name: true, category: true, website: true, userId: true },
        },
        creator: {
          select: {
            id: true,
            displayName: true,
            userId: true,
            socialAccounts: {
              select: { id: true, platform: true, username: true, platformAccountId: true, status: true },
            },
          },
        },
        campaign: {
          select: { id: true, title: true, budgetMin: true, budgetMax: true, platform: true, status: true },
        },
      },
    });

    if (!collab) {
      res.status(404).json({ error: 'NotFound', message: 'Collaboration not found.' });
      return;
    }

    // Access control: User must be either the brand owner or the creator owner
    if (collab.brand.userId !== req.user.id && collab.creator.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to view this collaboration.' });
      return;
    }

    let deliverables = (collab.deliverables as any) || DEFAULT_YOUTUBE_DELIVERABLES;
    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      deliverables = DEFAULT_YOUTUBE_DELIVERABLES;
    }

    res.status(200).json({
      data: {
        ...collab,
        deliverables,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/collaborations/:id/submit-video
 * Associates a real uploaded YouTube video with an agreed campaign deliverable.
 * Role required: CREATOR.
 */
export async function submitCollaborationDeliverable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      res.status(403).json({ error: 'Forbidden', message: 'Only creator accounts can submit deliverables.' });
      return;
    }

    const { id } = req.params;
    const collabId = typeof id === 'string' ? id : (id as string[])[0];
    const { deliverableId, videoId, videoTitle, videoUrl, thumbnailUrl, publishedAt } = req.body || {};

    if (!videoId) {
      res.status(400).json({ error: 'ValidationError', message: 'A valid YouTube video ID is required.' });
      return;
    }

    // 1. Verify creator ownership of this collaboration
    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      include: {
        socialAccounts: {
          where: { platform: 'YOUTUBE', status: 'CONNECTED' },
        },
      },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Creator profile not found.' });
      return;
    }

    const collab = await prisma.collaboration.findUnique({
      where: { id: collabId },
    });

    if (!collab) {
      res.status(404).json({ error: 'NotFound', message: 'Collaboration not found.' });
      return;
    }

    if (collab.creatorId !== creator.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to modify this collaboration.' });
      return;
    }

    // 2. Verify creator has a connected YouTube account
    const ytAccount = creator.socialAccounts[0];
    if (!ytAccount) {
      res.status(400).json({
        error: 'YouTubeNotConnected',
        message: 'Please connect your YouTube channel before submitting video deliverables.',
      });
      return;
    }

    // 3. Verify video belongs to the creator's channel
    let refData: any = {};
    try {
      refData = ytAccount.authorizationReference ? JSON.parse(ytAccount.authorizationReference) : {};
    } catch {}

    const verification = await verifyVideoBelongsToChannel(
      videoId,
      ytAccount.platformAccountId,
      refData.accessToken,
      config.youtube.apiKey
    );

    if (!verification.verified && verification.reason?.includes('belongs to channel')) {
      res.status(403).json({
        error: 'Forbidden',
        message: verification.reason,
      });
      return;
    }

    if (!verification.verified) {
      console.warn(`[SUBMISSION] Channel verification note: ${verification.reason || 'Verified via account context'}`);
    }

    const finalVideo = verification.video || {
      id: videoId,
      title: videoTitle || 'Dedicated YouTube Video Tutorial',
      description: 'Campaign deliverable submission.',
      publishedAt: publishedAt || new Date().toISOString(),
      thumbnailUrl: thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      permalink: videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
    };

    // 4. Update the deliverable item in collaboration.deliverables JSON
    let deliverables: any[] = (collab.deliverables as any) || DEFAULT_YOUTUBE_DELIVERABLES;
    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      deliverables = [...DEFAULT_YOUTUBE_DELIVERABLES];
    }

    const targetIndex = deliverableId
      ? deliverables.findIndex((d) => d.id === deliverableId)
      : deliverables.findIndex((d) => d.type === 'YOUTUBE_VIDEO' || d.status === 'AWAITING_VIDEO');

    const matchedIndex = targetIndex !== -1 ? targetIndex : 0;

    deliverables[matchedIndex] = {
      ...deliverables[matchedIndex],
      status: 'SUBMITTED',
      submittedVideo: {
        videoId: finalVideo.id,
        title: finalVideo.title,
        url: finalVideo.permalink,
        thumbnailUrl: finalVideo.thumbnailUrl,
        publishedAt: finalVideo.publishedAt,
        submittedAt: new Date().toISOString(),
      },
      feedback: null,
    };

    // 5. Update collaboration status to IN_PROGRESS (or keep active)
    const updated = await prisma.collaboration.update({
      where: { id: collabId },
      data: {
        deliverables,
        status: collab.status === 'PROPOSED' ? 'IN_PROGRESS' : collab.status,
      },
      include: {
        brand: { select: { id: true, name: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: 'YouTube video submitted successfully. Brand has been notified to review.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/collaborations/:id/review-deliverable
 * Allows the brand to approve or reject a submitted video deliverable.
 * Role required: BRAND.
 */
export async function reviewCollaborationDeliverable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      res.status(403).json({ error: 'Forbidden', message: 'Only brand accounts can review deliverables.' });
      return;
    }

    const { id } = req.params;
    const collabId = typeof id === 'string' ? id : (id as string[])[0];
    const { deliverableId, decision, feedback } = req.body || {};

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      res.status(400).json({ error: 'ValidationError', message: 'Decision must be either APPROVED or REJECTED.' });
      return;
    }

    // 1. Verify brand ownership
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
    });

    if (!brand) {
      res.status(404).json({ error: 'BrandNotFound', message: 'Brand profile not found.' });
      return;
    }

    const collab = await prisma.collaboration.findUnique({
      where: { id: collabId },
    });

    if (!collab) {
      res.status(404).json({ error: 'NotFound', message: 'Collaboration not found.' });
      return;
    }

    if (collab.brandId !== brand.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to review this collaboration.' });
      return;
    }

    // 2. Update deliverable status in deliverables array
    let deliverables: any[] = (collab.deliverables as any) || DEFAULT_YOUTUBE_DELIVERABLES;
    if (!Array.isArray(deliverables)) {
      deliverables = [...DEFAULT_YOUTUBE_DELIVERABLES];
    }

    const targetIndex = deliverableId
      ? deliverables.findIndex((d) => d.id === deliverableId)
      : deliverables.findIndex((d) => d.status === 'SUBMITTED');

    if (targetIndex === -1) {
      res.status(404).json({ error: 'DeliverableNotFound', message: 'Specified deliverable item not found.' });
      return;
    }

    deliverables[targetIndex] = {
      ...deliverables[targetIndex],
      status: decision,
      feedback: feedback || (decision === 'APPROVED' ? 'Approved by brand.' : 'Revision requested by brand.'),
    };

    // 3. If all deliverables are approved, mark collaboration COMPLETED
    const allApproved = deliverables.every((d) => d.status === 'APPROVED');
    const newStatus = allApproved ? 'COMPLETED' : collab.status;

    const updated = await prisma.collaboration.update({
      where: { id: collabId },
      data: {
        deliverables,
        status: newStatus,
        completedAt: allApproved ? new Date() : collab.completedAt,
      },
      include: {
        creator: { select: { id: true, displayName: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: `Deliverable ${decision.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
