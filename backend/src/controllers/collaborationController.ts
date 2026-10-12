import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/brands/me/collaborations
 * Lists all active and agreed collaborations for the authenticated brand.
 * Role required: BRAND.
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
                platform: true,
                username: true,
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

    res.status(200).json({
      data: collabs,
      meta: { total: collabs.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/creators/me/collaborations
 * Lists all active and agreed collaborations for the authenticated creator.
 * Role required: CREATOR.
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

    res.status(200).json({
      data: collabs,
      meta: { total: collabs.length },
    });
  } catch (err) {
    next(err);
  }
}
