import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  analyzeAndSaveCreatorIntelligence,
  DatabasePersistenceError,
} from '../services/creatorIntelligenceService.js';
import { getComprehensiveCreatorIntelligence } from '../services/intelligenceWorkspaceService.js';
import { GeminiServiceError } from '../integrations/gemini/index.js';
import { syncCreatorYouTube } from '../integrations/youtube/index.js';

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

    try {
      const snapshot = await getComprehensiveCreatorIntelligence(userId || '', userEmail);
      res.status(200).json({
        data: snapshot,
      });
    } catch (err: any) {
      if (err.message === 'CREATOR_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Creator profile not found.' });
        return;
      }
      throw err;
    }
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

    const creator = await prisma.creator.findFirst({
      where: {
        OR: [
          { userId },
          ...(userEmail ? [{ user: { email: userEmail } }] : []),
        ],
      },
      include: {
        socialAccounts: true,
      },
    });

    if (!creator) {
      res.status(404).json({
        error: 'Creator profile not found.',
      });
      return;
    }

    // 1. If a YouTube channel exists, synchronize latest videos and metrics
    const ytAccount = creator.socialAccounts.find((a) => a.platform === 'YOUTUBE');
    const prefs = (creator.preferences as Record<string, any>) || {};
    const channelInput = ytAccount?.platformAccountId?.startsWith('UC')
      ? ytAccount.platformAccountId
      : prefs.youtubeUrl || ytAccount?.username;

    if (channelInput) {
      try {
        await syncCreatorYouTube(creator.id, channelInput);
      } catch (syncErr: any) {
        console.warn('[CREATOR_INTELLIGENCE] YouTube sync note during refresh:', syncErr.message);
      }
    }

    // 2. Run Gemini AI analysis if configured and data is available
    let aiStatus = 'SKIPPED';
    let aiMessage = 'AI analysis skipped (no Gemini API key configured).';
    if (process.env.GEMINI_API_KEY?.trim()) {
      try {
        await analyzeAndSaveCreatorIntelligence(userId || '', userEmail);
        aiStatus = 'COMPLETED';
        aiMessage = 'Creator intelligence generated and saved successfully.';
      } catch (err) {
        if (err instanceof Error && err.message === 'INSUFFICIENT_CREATOR_DATA') {
          aiStatus = 'INSUFFICIENT_DATA';
          aiMessage = 'Connect a channel or add a bio to unlock deeper AI Content DNA analysis.';
        } else if (err instanceof GeminiServiceError) {
          aiStatus = 'AI_UNAVAILABLE';
          aiMessage = err.message;
        } else {
          console.warn('[CREATOR_INTELLIGENCE] Gemini analysis notice:', err);
          aiStatus = 'ERROR';
          aiMessage = 'AI analysis could not complete. Synced data is preserved.';
        }
      }
    }

    // 3. Return the fresh comprehensive snapshot
    const snapshot = await getComprehensiveCreatorIntelligence(userId || '', userEmail);

    res.status(200).json({
      data: snapshot,
      meta: {
        status: aiStatus,
        message: aiMessage,
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

