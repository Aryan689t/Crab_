import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  analyzeAndSaveCreatorIntelligence,
  DatabasePersistenceError,
} from '../services/creatorIntelligenceService.js';
import { GeminiServiceError } from '../integrations/gemini/index.js';

export async function getCreatorIntelligence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    let creator = userId
      ? await prisma.creator.findUnique({
          where: { userId },
          select: {
            preferences: true,
            aiProfile: true,
          },
        })
      : null;

    if (!creator && userEmail) {
      creator = await prisma.creator.findFirst({
        where: { user: { email: userEmail } },
        select: {
          preferences: true,
          aiProfile: true,
        },
      });
    }

    if (!creator) {
      res.status(404).json({
        error: 'Creator profile not found.',
      });
      return;
    }

    if (!creator.aiProfile) {
      const creatorPrefs = (creator.preferences as Record<string, any>) || {};
      const primaryNiches = Array.isArray(creatorPrefs.niches) ? creatorPrefs.niches : [];
      res.status(200).json({
        data: {
          hasIntelligence: false,
          insightTitle: primaryNiches.length > 0
            ? `Your ${primaryNiches[0]} focus is ready for audience vectors`
            : 'Build your initial audience footprint',
          insightBody: 'Publish content and connect your channel so CRAB Gemini AI can analyze your topics and calculate explainable brand match scores.',
          primaryNiches,
          secondaryNiches: [],
          contentStyle: [],
          audienceSummary: 'Audience analysis will appear once content snapshots are recorded.',
          opportunityCategories: [],
        },
      });
      return;
    }

    const primaryNiches = creator.aiProfile.primaryNiches || [];
    res.status(200).json({
      data: {
        ...creator.aiProfile,
        hasIntelligence: true,
        insightTitle: primaryNiches.length > 0
          ? `Your ${primaryNiches[0]} content is gaining traction`
          : 'Audience intelligence snapshot active',
        insightBody: creator.aiProfile.audienceSummary || 'Your creator vectors are indexed for brand discovery.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function analyzeCreatorIntelligence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      res.status(503).json({
        error: 'Gemini is not configured on the server.',
      });
      return;
    }

    // Strictly scope analysis to the authenticated user identity (never an untrusted client ID).
    const profile = await analyzeAndSaveCreatorIntelligence(userId || '', userEmail);

    res.status(200).json({
      data: {
        status: 'COMPLETED',
        message: 'Creator intelligence generated and saved successfully.',
        profile,
      },
    });
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      res.status(err.statusCode).json({
        error: err.name,
        message: err.message,
      });
      return;
    }

    if (err instanceof Error && err.message === 'CREATOR_PROFILE_NOT_FOUND') {
      res.status(404).json({
        error: 'Creator profile not found.',
      });
      return;
    }

    if (err instanceof Error && err.message === 'INSUFFICIENT_CREATOR_DATA') {
      res.status(422).json({
        error: 'Insufficient creator data for analysis.',
        message: 'Add a creator bio or content before generating intelligence.',
      });
      return;
    }

    if (err instanceof DatabasePersistenceError) {
      res.status(500).json({
        error: 'DatabaseError',
        message: 'Failed to persist creator intelligence profile.',
      });
      return;
    }

    // Log diagnostic error without sensitive secrets or full payload
    console.error('[CREATOR_INTELLIGENCE_CONTROLLER] Unexpected failure during analysis:', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });

    next(err);
  }
}

