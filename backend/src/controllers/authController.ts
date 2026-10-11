import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase.js';

const registerSchema = z.object({
  email: z.string().email('Valid email address is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['CREATOR', 'BRAND']),
  displayName: z.string().optional(),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email address is required.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * POST /api/auth/register
 * Creates account in Supabase Auth, then provisions User and role-specific profile (Creator or Brand) in Prisma.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body);
    const supabase = getSupabaseClient();

    if (!supabase) {
      res.status(503).json({
        error: 'AuthServiceUnavailable',
        message: 'Supabase authentication service is not configured.',
      });
      return;
    }

    // Check if user already exists in Prisma DB
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'UserAlreadyExists',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // 1. Create account via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.email.toLowerCase(),
      password: parsed.password,
      options: {
        data: {
          role: parsed.role,
          displayName: parsed.displayName || parsed.name || parsed.email.split('@')[0],
        },
      },
    });

    if (authError || !authData.user) {
      res.status(400).json({
        error: 'SupabaseAuthError',
        message: authError?.message || 'Failed to create account in Supabase Auth.',
      });
      return;
    }

    const supabaseUserId = authData.user.id;
    const email = authData.user.email || parsed.email.toLowerCase();

    // 2. Persist application User and Profile inside a Prisma Transaction
    let dbUser;
    try {
      dbUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: supabaseUserId,
            email,
            role: parsed.role,
          },
        });

        if (parsed.role === 'CREATOR') {
          const displayName = parsed.displayName || email.split('@')[0];
          await tx.creator.create({
            data: {
              userId: user.id,
              displayName,
              contactInformation: { email },
            },
          });
        } else if (parsed.role === 'BRAND') {
          const brandName = parsed.name || parsed.displayName || email.split('@')[0];
          await tx.brand.create({
            data: {
              userId: user.id,
              name: brandName,
              contactInformation: { email },
            },
          });
        }

        return tx.user.findUnique({
          where: { id: user.id },
          include: {
            creator: true,
            brand: true,
          },
        });
      });
    } catch (dbErr: any) {
      console.error('[AUTH REGISTER] Prisma transaction failed:', dbErr);
      res.status(500).json({
        error: 'ProfileCreationError',
        message: 'Failed to create local database profile for registered user.',
      });
      return;
    }

    res.status(201).json({
      message: 'Account registered successfully.',
      session: authData.session
        ? {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresAt: authData.session.expires_at,
          }
        : null,
      requiresEmailConfirmation: !authData.session,
      user: {
        id: dbUser?.id || supabaseUserId,
        email: dbUser?.email || email,
        role: dbUser?.role || parsed.role,
        creatorId: dbUser?.creator?.id || null,
        brandId: dbUser?.brand?.id || null,
        creator: dbUser?.creator || null,
        brand: dbUser?.brand || null,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'ValidationError', issues: err.issues });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Verifies credentials via Supabase Auth and returns session and profile data.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.parse(req.body);
    const supabase = getSupabaseClient();

    if (!supabase) {
      res.status(503).json({
        error: 'AuthServiceUnavailable',
        message: 'Supabase authentication service is not configured.',
      });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.email.toLowerCase(),
      password: parsed.password,
    });

    if (authError || !authData.user || !authData.session) {
      res.status(401).json({
        error: 'InvalidCredentials',
        message: authError?.message || 'Invalid email or password.',
      });
      return;
    }

    // Retrieve database profile
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: authData.user.id }, { email: authData.user.email }],
      },
      include: {
        creator: true,
        brand: true,
      },
    });

    // If account was created in Supabase directly but DB profile is missing, auto-provision
    if (!dbUser) {
      const role = (authData.user.user_metadata?.role as 'CREATOR' | 'BRAND') || 'CREATOR';
      const email = authData.user.email || parsed.email.toLowerCase();
      dbUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: authData.user.id,
            email,
            role,
          },
        });

        if (role === 'CREATOR') {
          await tx.creator.create({
            data: {
              userId: user.id,
              displayName: email.split('@')[0],
              contactInformation: { email },
            },
          });
        } else {
          await tx.brand.create({
            data: {
              userId: user.id,
              name: email.split('@')[0],
              contactInformation: { email },
            },
          });
        }

        return tx.user.findUnique({
          where: { id: user.id },
          include: { creator: true, brand: true },
        });
      });
    }

    res.status(200).json({
      message: 'Login successful.',
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at,
      },
      user: {
        id: dbUser!.id,
        email: dbUser!.email,
        role: dbUser!.role,
        creatorId: dbUser!.creator?.id || null,
        brandId: dbUser!.brand?.id || null,
        creator: dbUser!.creator || null,
        brand: dbUser!.brand || null,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'ValidationError', issues: err.issues });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns profile of verified authenticated user.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'User is not authenticated.' });
      return;
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: req.user.id }, { email: req.user.email }],
      },
      include: {
        creator: true,
        brand: true,
      },
    });

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

/**
 * POST /api/auth/sync
 * For authenticated sessions (e.g. from frontend Supabase SDK) to ensure User & Profile records exist in PostgreSQL.
 */
export async function registerOrSyncUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const syncSchema = z.object({
      role: z.enum(['CREATOR', 'BRAND']).optional(),
      displayName: z.string().optional(),
    });
    const parsed = syncSchema.parse(req.body);

    const userId = req.user?.id || req.body.userId;
    const email = req.user?.email || req.body.email;
    const role = req.user?.role || parsed.role || 'CREATOR';

    if (!userId || !email) {
      res.status(400).json({ error: 'ValidationError', message: 'User ID and email are required.' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { creator: true, brand: true },
    });

    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: userId,
            email,
            role,
          },
        });

        if (role === 'CREATOR') {
          await tx.creator.create({
            data: {
              userId: newUser.id,
              displayName: parsed.displayName || email.split('@')[0],
              contactInformation: { email },
            },
          });
        } else {
          await tx.brand.create({
            data: {
              userId: newUser.id,
              name: parsed.displayName || email.split('@')[0],
              contactInformation: { email },
            },
          });
        }

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: { creator: true, brand: true },
        });
      });
    }

    res.status(200).json({
      data: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
        creatorId: user!.creator?.id || null,
        brandId: user!.brand?.id || null,
        creator: user!.creator || null,
        brand: user!.brand || null,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'ValidationError', issues: err.issues });
      return;
    }
    next(err);
  }
}
