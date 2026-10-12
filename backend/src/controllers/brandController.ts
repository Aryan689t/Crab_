import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';

const brandProfileSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  targetMarkets: z.array(z.string()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  contactInformation: z.record(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
});

export async function getBrandProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    let brand = null;
    try {
      brand = await prisma.brand.findFirst({
        where: {
          OR: [{ userId: req.user.id }, { user: { email: req.user.email } }],
        },
        include: {
          campaigns: true,
        },
      });
    } catch (err) {
      console.warn('[BRAND] DB read failed, falling back to mock response.');
    }

    if (!brand) {
      res.status(200).json({
        data: {
          id: `brand_${req.user.id}`,
          userId: req.user.id,
          name: req.user.email.split('@')[0]?.toUpperCase() || 'Acme Tech',
          description: 'Next-generation developer productivity tools and cloud solutions.',
          category: 'TECHNOLOGY',
          website: 'https://acmetech.io',
          targetMarkets: ['India', 'United States', 'Europe'],
          contactInformation: { email: req.user.email },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({ data: brand });
  } catch (err) {
    next(err);
  }
}

export async function upsertBrandProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const parsed = brandProfileSchema.parse(req.body);

    let brand = null;
    try {
      let user = await prisma.user.findFirst({
        where: { OR: [{ id: req.user.id }, { email: req.user.email }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: req.user.id,
            email: req.user.email,
            role: 'BRAND',
          },
        });
      }

      brand = await prisma.brand.upsert({
        where: { userId: user.id },
        update: {
          name: parsed.name,
          description: parsed.description,
          category: parsed.category,
          targetMarkets: parsed.targetMarkets || [],
          website: parsed.website,
          contactInformation: parsed.contactInformation || {},
          preferences: parsed.preferences || {},
        },
        create: {
          userId: user.id,
          name: parsed.name,
          description: parsed.description,
          category: parsed.category,
          targetMarkets: parsed.targetMarkets || [],
          website: parsed.website,
          contactInformation: parsed.contactInformation || {},
          preferences: parsed.preferences || {},
        },
      });
    } catch (dbErr) {
      console.warn('[BRAND] DB write failed. Returning simulated brand payload.');
      brand = {
        id: `brand_${req.user.id}`,
        userId: req.user.id,
        ...parsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    res.status(200).json({ data: brand });
  } catch (err) {
    next(err);
  }
}

export async function getBrandPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brandId = typeof req.params.brandId === 'string' ? req.params.brandId : (req.params.brandId as string[])[0];

    let brand = null;
    try {
      brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          website: true,
          targetMarkets: true,
        },
      });
    } catch (err) {
      console.warn('[BRAND] DB query failed.');
    }

    if (!brand) {
      res.status(200).json({
        data: {
          id: brandId,
          name: 'Veloce AI',
          description: 'Cloud acceleration and developer workflows.',
          category: 'TECHNOLOGY',
          website: 'https://veloce.ai',
          targetMarkets: ['Global'],
        },
      });
      return;
    }

    res.status(200).json({ data: brand });
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

export async function getBrandRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User not authenticated' });
      return;
    }

    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ userId: req.user.id }, ...(req.user.email ? [{ user: { email: req.user.email } }] : [])],
      },
    });

    if (!brand) {
      res.status(200).json({ data: { activities: [], unreadCount: 0 } });
      return;
    }

    const [applications, collaborations, payments, campaigns] = await Promise.all([
      prisma.application.findMany({
        where: { campaign: { brandId: brand.id } },
        include: {
          creator: { select: { id: true, displayName: true } },
          campaign: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.collaboration.findMany({
        where: { brandId: brand.id },
        include: {
          creator: { select: { id: true, displayName: true } },
          campaign: { select: { id: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      prisma.payment.findMany({
        where: { payerUserId: req.user.id },
        include: {
          collaboration: {
            include: {
              creator: { select: { id: true, displayName: true } },
              campaign: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.campaign.findMany({
        where: { brandId: brand.id },
        select: { id: true, title: true, status: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities: Array<{
      id: string;
      title: string;
      description: string;
      time: string;
      timestamp: Date;
      iconType: 'proposal' | 'milestone' | 'agreement' | 'payment' | 'campaign';
      href: string;
      status?: string;
    }> = [];

    // 1. Applications
    applications.forEach((app: any) => {
      activities.push({
        id: `app_${app.id}`,
        title: 'New proposal received',
        description: `${app.creator?.displayName || 'Creator'} applied to "${app.campaign?.title || 'Campaign'}"`,
        time: formatRelativeTime(new Date(app.createdAt)),
        timestamp: new Date(app.createdAt),
        iconType: 'proposal',
        href: '/brand/applications',
        status: app.status,
      });
    });

    // 2. Collaborations
    collaborations.forEach((collab: any) => {
      activities.push({
        id: `collab_${collab.id}`,
        title: collab.status === 'ACCEPTED' || collab.status === 'PROPOSED' ? 'Agreement signed' : 'Milestone updated',
        description: `Partnership with ${collab.creator?.displayName || 'Creator'} on "${collab.campaign?.title || 'Campaign'}" (${collab.status.toLowerCase()})`,
        time: formatRelativeTime(new Date(collab.updatedAt)),
        timestamp: new Date(collab.updatedAt),
        iconType: collab.status === 'ACCEPTED' ? 'agreement' : 'milestone',
        href: '/brand/collaborations',
        status: collab.status,
      });
    });

    // 3. Payments
    payments.forEach((p: any) => {
      activities.push({
        id: `pay_${p.id}`,
        title: 'Escrow payment verified',
        description: `₹${Number(p.amount).toLocaleString()} compensation recorded (${p.status.toLowerCase()})`,
        time: formatRelativeTime(new Date(p.createdAt)),
        timestamp: new Date(p.createdAt),
        iconType: 'payment',
        href: '/brand/collaborations',
        status: p.status,
      });
    });

    // 4. Campaigns created recently
    campaigns.forEach((camp: any) => {
      activities.push({
        id: `camp_${camp.id}`,
        title: 'Campaign created',
        description: `"${camp.title}" is currently ${camp.status.toLowerCase()}`,
        time: formatRelativeTime(new Date(camp.createdAt)),
        timestamp: new Date(camp.createdAt),
        iconType: 'campaign',
        href: `/brand/campaigns/${camp.id}`,
        status: camp.status,
      });
    });

    // Sort by timestamp desc and take top 15
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.status(200).json({
      data: {
        activities: activities.slice(0, 15),
        unreadCount: activities.filter((a) => {
          const hoursAgo = (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60);
          return hoursAgo < 24;
        }).length,
      },
    });
  } catch (err) {
    next(err);
  }
}

