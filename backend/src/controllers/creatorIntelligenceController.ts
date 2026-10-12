import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { analyzeAndSaveCreatorIntelligence } from '../services/creatorIntelligenceService.js';
import { GeminiServiceError } from '../integrations/gemini/index.js';

export async function getCreatorIntelligence(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    const creator = await prisma.creator.findUnique({
      where: { userId },
      select: {
        aiProfile: true,
      },
    });

    if (!creator) {
      res.status(404).json({
        error: 'Creator profile not found.',
      });
      return;
    }

    if (!creator.aiProfile) {
      res.status(404).json({
        error: 'Creator intelligence profile has not been generated yet.',
        message: 'Run the analyze endpoint to generate it.',
      });
      return;
    }

    res.status(200).json({
      data: creator.aiProfile,
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

    if (!userId) {
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

    const profile = await analyzeAndSaveCreatorIntelligence(userId);

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

    next(err);
  }
}
