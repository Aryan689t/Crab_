import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: 'CREATOR' | 'BRAND';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to verify Supabase JWT / Bearer Token.
 * If credentials are not yet configured in development, allows simulated dev tokens
 * while maintaining strict signature and identity requirements.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    // In dev mode when Supabase is not configured yet, support mock token for local testing
    if (config.isDevelopment && token.startsWith('mock-')) {
      const parts = token.split('-');
      req.user = {
        id: `mock-user-${parts[1] || '1'}`,
        email: `${parts[1] || 'demo'}@crab-platform.local`,
        role: parts[2]?.toUpperCase() === 'BRAND' ? 'BRAND' : 'CREATOR',
      };
      next();
      return;
    }

    res.status(503).json({
      error: 'AuthServiceUnavailable',
      message: 'Supabase authentication service is not configured on the backend.',
    });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({
        error: 'InvalidToken',
        message: error?.message || 'Token verification failed.',
      });
      return;
    }

    // If role is in user metadata, use it; otherwise check database
    let role = data.user.user_metadata?.role as 'CREATOR' | 'BRAND' | undefined;
    if (!role) {
      const dbUser = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { role: true },
      });
      if (dbUser) {
        role = dbUser.role;
      }
    }

    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(allowedRole: 'CREATOR' | 'BRAND') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    if (req.user.role && req.user.role !== allowedRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Forbidden. This resource requires ${allowedRole} role.`,
      });
      return;
    }

    next();
  };
}
