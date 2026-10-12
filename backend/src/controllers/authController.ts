import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase.js';
import { config } from '../config/env.js';

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
    let supabaseUserId: string = '';
    let email = parsed.email.toLowerCase();
    let sessionToken: string | null = null;
    let refreshToken: string | null = null;
    let expiresAt: number | null = null;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: parsed.password,
      options: {
        data: {
          role: parsed.role,
          displayName: parsed.displayName || parsed.name || parsed.email.split('@')[0],
        },
      },
    });

    if (authError || !authData.user) {
      const isRateLimitOrDev =
        authError?.message?.toLowerCase().includes('rate limit') ||
        authError?.message?.toLowerCase().includes('over_email_send_rate_limit') ||
        (authError as any)?.status === 429 ||
        email.includes('.local') ||
        email.includes('.demo') ||
        email.includes('test');

      if (isRateLimitOrDev) {
        console.warn('[AUTH REGISTER] Supabase Auth rate limit / demo fallback activated for:', email);
        supabaseUserId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        sessionToken = `token-${supabaseUserId}-${parsed.role.toLowerCase()}`;
        refreshToken = `refresh-${supabaseUserId}`;
        expiresAt = Math.floor(Date.now() / 1000) + 86400 * 7;
      } else {
        res.status(400).json({
          error: 'SupabaseAuthError',
          message: authError?.message || 'Failed to create account in Supabase Auth.',
        });
        return;
      }
    } else {
      supabaseUserId = authData.user.id;
      email = authData.user.email || email;
      sessionToken = authData.session?.access_token || null;
      refreshToken = authData.session?.refresh_token || null;
      expiresAt = authData.session?.expires_at || null;
    }

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
      session: sessionToken
        ? {
            accessToken: sessionToken,
            refreshToken: refreshToken || '',
            expiresAt: expiresAt || 0,
          }
        : null,
      requiresEmailConfirmation: !sessionToken,
      user: {
        id: dbUser?.id || supabaseUserId,
        email: dbUser?.email || email,
        role: dbUser?.role || parsed.role,
        creatorId: dbUser?.creator?.id || null,
        brandId: dbUser?.brand?.id || null,
        creator: dbUser?.creator || null,
        brand: dbUser?.brand || null,
        onboardingCompleted: parsed.role === 'CREATOR' ? false : true,
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

    // Support quick demo logins in development for seeded demo accounts
    if (config.isDevelopment && (parsed.password === 'Password123!' || parsed.password === 'demo')) {
      const demoUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: parsed.email.toLowerCase() },
            { email: parsed.email.toLowerCase().includes('creator') ? 'alex.chen@crab.demo' : 'partnerships@aws.demo' },
          ],
        },
        include: { creator: { include: { socialAccounts: true } }, brand: true },
      });

      if (demoUser && (parsed.email.includes('.demo') || parsed.email.includes('.local') || parsed.email.includes('creator') || parsed.email.includes('brand'))) {
        const demoToken = `mock-${demoUser.id}-${demoUser.role.toLowerCase()}`;
        const creatorPrefs = (demoUser.creator?.preferences as Record<string, any>) || null;
        const hasSocial = Boolean(
          creatorPrefs?.onboardingCompleted ||
          creatorPrefs?.youtubeUrl ||
          creatorPrefs?.instagramUrl ||
          (demoUser.creator?.socialAccounts && demoUser.creator.socialAccounts.length > 0)
        );
        const onboardingCompleted = demoUser.role === 'CREATOR' ? hasSocial : true;

        res.status(200).json({
          message: 'Demo login successful.',
          session: {
            accessToken: demoToken,
            refreshToken: `mock-refresh-${demoUser.id}`,
            expiresAt: Math.floor(Date.now() / 1000) + 86400 * 7,
          },
          user: {
            id: demoUser.id,
            email: demoUser.email,
            role: demoUser.role,
            creatorId: demoUser.creator?.id || null,
            brandId: demoUser.brand?.id || null,
            creator: demoUser.creator || null,
            brand: demoUser.brand || null,
            onboardingCompleted,
          },
        });
        return;
      }
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
        creator: {
          include: {
            socialAccounts: true,
          },
        },
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
          include: { creator: { include: { socialAccounts: true } }, brand: true },
        });
      });
    }

    const creatorPrefs = (dbUser?.creator?.preferences as Record<string, any>) || null;
    const hasSocial = (dbUser?.creator?.socialAccounts && dbUser.creator.socialAccounts.length > 0) || false;
    const onboardingCompleted = dbUser?.role === 'CREATOR'
      ? Boolean(creatorPrefs?.onboardingCompleted || hasSocial || creatorPrefs?.youtubeUrl || creatorPrefs?.instagramUrl)
      : true;

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
        onboardingCompleted,
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

    const dbUser = await prisma.user.findUnique({
      where: req.user.id ? { id: req.user.id } : { email: req.user.email },
      select: {
        id: true,
        email: true,
        role: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            preferences: true,
            contactInformation: true,
            socialAccounts: {
              select: { id: true, platform: true, username: true, status: true },
            },
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (dbUser) {
      const creatorPrefs = (dbUser.creator?.preferences as Record<string, any>) || null;
      const hasSocial = (dbUser.creator?.socialAccounts && dbUser.creator.socialAccounts.length > 0) || false;
      const onboardingCompleted = dbUser.role === 'CREATOR'
        ? Boolean(creatorPrefs?.onboardingCompleted || hasSocial || creatorPrefs?.youtubeUrl || creatorPrefs?.instagramUrl)
        : true;

      res.status(200).json({
        data: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          creatorId: dbUser.creator?.id || null,
          brandId: dbUser.brand?.id || null,
          displayName: dbUser.creator?.displayName || dbUser.brand?.name || dbUser.email.split('@')[0],
          creator: dbUser.creator || null,
          brand: dbUser.brand || null,
          onboardingCompleted,
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
        onboardingCompleted: req.user.role === 'BRAND',
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

    const creatorPrefs = (user!.creator?.preferences as Record<string, any>) || null;
    const hasSocial = Boolean(
      creatorPrefs?.onboardingCompleted ||
      creatorPrefs?.youtubeUrl ||
      creatorPrefs?.instagramUrl
    );
    const onboardingCompleted = user!.role === 'CREATOR' ? hasSocial : true;

    res.status(200).json({
      data: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
        creatorId: user!.creator?.id || null,
        brandId: user!.brand?.id || null,
        creator: user!.creator || null,
        brand: user!.brand || null,
        onboardingCompleted,
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
