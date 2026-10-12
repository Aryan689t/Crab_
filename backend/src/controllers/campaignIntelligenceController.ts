import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import {
    getCampaignIntelligence,
    analyzeAndSaveCampaignIntelligence,
    DatabasePersistenceError,
} from '../services/campaignIntelligenceService.js';
import { GeminiServiceError } from '../integrations/gemini/index.js';

export async function getCampaignIntelligenceHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
            return;
        }

        if (req.user.role && req.user.role !== 'BRAND') {
            res.status(403).json({ error: 'Forbidden', message: 'Forbidden. This resource requires BRAND role.' });
            return;
        }

        const brand = await prisma.brand.findFirst({
            where: {
                OR: [{ userId: req.user.id }, { user: { email: req.user.email } }],
            },
            select: { id: true },
        });

        if (!brand) {
            res.status(404).json({
                error: 'BrandProfileNotFound',
                message: 'No brand profile associated with authenticated user.',
            });
            return;
        }

        const campaignId = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])?.[0];
        if (!campaignId) {
            res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
            return;
        }

        const profile = await getCampaignIntelligence(campaignId, brand.id);

        res.status(200).json({
            data: profile,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === 'CAMPAIGN_NOT_FOUND') {
                res.status(404).json({ error: 'NotFound', message: 'Campaign not found.' });
                return;
            }
            if (err.message === 'CAMPAIGN_FORBIDDEN') {
                res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to access campaign intelligence for this campaign.' });
                return;
            }
            if (err.message === 'CAMPAIGN_INTELLIGENCE_NOT_FOUND') {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Campaign intelligence profile has not been generated yet. Run the analyze endpoint to generate it.',
                });
                return;
            }
        }
        next(err);
    }
}

export async function analyzeCampaignIntelligenceHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
            return;
        }

        if (req.user.role && req.user.role !== 'BRAND') {
            res.status(403).json({ error: 'Forbidden', message: 'Forbidden. This resource requires BRAND role.' });
            return;
        }

        if (!process.env.GEMINI_API_KEY?.trim()) {
            res.status(503).json({
                error: 'GeminiUnavailable',
                message: 'Gemini is not configured on the server.',
            });
            return;
        }

        const brand = await prisma.brand.findFirst({
            where: {
                OR: [{ userId: req.user.id }, { user: { email: req.user.email } }],
            },
            select: { id: true },
        });

        if (!brand) {
            res.status(404).json({
                error: 'BrandProfileNotFound',
                message: 'No brand profile associated with authenticated user.',
            });
            return;
        }

        const campaignId = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])?.[0];
        if (!campaignId) {
            res.status(400).json({ error: 'BadRequest', message: 'Campaign ID is required.' });
            return;
        }

        const profile = await analyzeAndSaveCampaignIntelligence(campaignId, brand.id);

        res.status(200).json({
            data: {
                status: 'COMPLETED',
                message: 'Campaign intelligence generated and saved successfully.',
                profile,
            },
        });
    } catch (err: unknown) {
        if (err instanceof GeminiServiceError) {
            res.status(err.statusCode).json({
                error: err.name,
                message: err.message,
            });
            return;
        }

        if (err instanceof DatabasePersistenceError) {
            res.status(500).json({
                error: 'DatabaseError',
                message: 'Failed to persist campaign intelligence profile.',
            });
            return;
        }

        if (err instanceof Error) {
            if (err.message === 'CAMPAIGN_NOT_FOUND') {
                res.status(404).json({ error: 'NotFound', message: 'Campaign not found.' });
                return;
            }
            if (err.message === 'CAMPAIGN_FORBIDDEN') {
                res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to analyze this campaign.' });
                return;
            }
            if (err.message === 'INSUFFICIENT_CAMPAIGN_DATA') {
                res.status(422).json({
                    error: 'InsufficientCampaignData',
                    message: 'Campaign must have a title and description before generating intelligence.',
                });
                return;
            }
        }

        console.error('[CAMPAIGN_INTELLIGENCE_CONTROLLER] Unexpected failure during analysis:', {
            error: err instanceof Error ? err.message : 'Unknown error',
        });

        next(err);
    }
}
