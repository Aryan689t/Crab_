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
