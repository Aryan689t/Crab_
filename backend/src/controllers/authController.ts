import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';

const registerSchema = z.object({
  email: z.string().email(),
  role: z.enum(['CREATOR', 'BRAND']),
  userId: z.string().optional(), // Supabase auth user UUID
});

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User is not authenticated.' });
      return;
    }

    // Attempt to find or load existing user from DB if DB is connected
    let dbUser = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: req.user.id }, { email: req.user.email }],
        },
        include: {
          creator: true,
          brand: true,
        },
      });
    } catch (err) {
      // If DB is offline/unconfigured, fall back to token identity
      console.warn('[AUTH] Database lookup bypassed or failed, using token payload.');
    }

    if (dbUser) {
      res.status(200).json({
        data: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          creatorId: dbUser.creator?.id || null,
          brandId: dbUser.brand?.id || null,
          creator: dbUser.creator || null,
          brand: dbUser.brand || null,
        },
      });
      return;
    }

    // Default response for authenticated user with no profile record yet
    res.status(200).json({
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || null,
        creatorId: null,
        brandId: null,
        creator: null,
        brand: null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function registerOrSyncUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body);
    const userId = req.user?.id || parsed.userId || `usr_${Date.now()}`;
    const email = req.user?.email || parsed.email;

    let user = null;
    try {
      user = await prisma.user.upsert({
        where: { email },
        update: {
          role: parsed.role,
        },
        create: {
          id: userId,
          email,
          role: parsed.role,
        },
        include: {
          creator: true,
          brand: true,
        },
      });
    } catch (dbErr) {
      console.warn('[AUTH] DB upsert failed or DB not connected. Returning simulated user payload.');
      user = {
        id: userId,
        email,
        role: parsed.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: null,
        brand: null,
      };
    }

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        creatorId: user.creator?.id || null,
        brandId: user.brand?.id || null,
      },
    });
  } catch (err) {
    next(err);
  }
}
