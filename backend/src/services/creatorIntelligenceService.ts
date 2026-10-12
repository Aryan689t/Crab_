import { prisma } from '../lib/prisma.js';
import {
    generateCreatorIntelligence,
    type CreatorIntelligenceInput,
} from '../integrations/gemini/index.js';

import { config } from '../config/env.js';

const MODEL_VERSION = config.gemini.model || 'gemini-2.5-flash';

export class DatabasePersistenceError extends Error {
    readonly cause?: unknown;

    constructor(message = 'Failed to persist creator intelligence profile to the database.', cause?: unknown) {
        super(message);
        this.name = 'DatabasePersistenceError';
        this.cause = cause;
    }
}

export async function analyzeAndSaveCreatorIntelligence(
    userId: string,
    userEmail?: string,
    intelligenceGenerator = generateCreatorIntelligence
) {
    // Load the authenticated user's creator profile and real database content.
    let creator = await prisma.creator.findUnique({
        where: { userId },
        select: {
            id: true,
            displayName: true,
            bio: true,
            location: true,
            contents: {
                orderBy: { publishedAt: 'desc' },
                take: 30,
                select: {
                    platform: true,
                    title: true,
                    description: true,
                    caption: true,
                    contentType: true,
                    publishedAt: true,
                    views: true,
                    likes: true,
                    comments: true,
                },
            },
        },
    });

    if (!creator && userEmail) {
        creator = await prisma.creator.findFirst({
            where: { user: { email: userEmail } },
            select: {
                id: true,
                displayName: true,
                bio: true,
                location: true,
                contents: {
                    orderBy: { publishedAt: 'desc' },
                    take: 30,
                    select: {
                        platform: true,
                        title: true,
                        description: true,
                        caption: true,
                        contentType: true,
                        publishedAt: true,
                        views: true,
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
    }

    if (!creator) {
        throw new Error('CREATOR_PROFILE_NOT_FOUND');
    }

    const hasBio = Boolean(creator.bio?.trim());
    const usableContents = creator.contents.filter(
        (item) =>
            Boolean(item.title?.trim()) ||
            Boolean(item.description?.trim()) ||
            Boolean(item.caption?.trim()) ||
            item.views !== null ||
            item.likes !== null
    );
    const hasUsableContent = usableContents.length > 0;

    // If there is neither a bio nor any usable content, reject with insufficient data
    if (!hasBio && !hasUsableContent) {
        throw new Error('INSUFFICIENT_CREATOR_DATA');
    }

    const isProfileOnly = !hasUsableContent;

    // Convert database values into JSON-safe inputs for Gemini.
    const input: CreatorIntelligenceInput = {
        displayName: creator.displayName,
        bio: creator.bio,
        location: creator.location,
        isProfileOnly,
        content: usableContents.map((item) => ({
            platform: item.platform,
            title: item.title,
            description: item.description,
            caption: item.caption,
            contentType: item.contentType,
            publishedAt: item.publishedAt?.toISOString() ?? null,
            views: item.views === null ? null : Number(item.views),
            likes: item.likes,
            comments: item.comments,
        })),
    };

    // Generate intelligence via Gemini (or throw GeminiServiceError).
    // If Gemini fails, no profile is written to the database.
    const analysis = await intelligenceGenerator(input);

    // Persist the verified analysis scoped strictly to the authenticated creator.
    // Do not touch or overwrite unsupported vector embedding column.
    try {
        const aiProfile = await prisma.creatorAIProfile.upsert({
            where: { creatorId: creator.id },
            update: {
                primaryNiches: analysis.primaryNiches,
                secondaryNiches: analysis.secondaryNiches,
                contentStyle: analysis.contentStyle,
                audienceSummary: analysis.audienceSummary,
                audienceInterests: analysis.audienceInterests,
                commercialCategories: analysis.commercialCategories,
                brandSuitability: analysis.brandSuitability,
                opportunityCategories: analysis.opportunityCategories,
                confidenceData: analysis.confidenceData,
                modelVersion: MODEL_VERSION,
                generatedAt: new Date(),
            },
            create: {
                creatorId: creator.id,
                primaryNiches: analysis.primaryNiches,
                secondaryNiches: analysis.secondaryNiches,
                contentStyle: analysis.contentStyle,
                audienceSummary: analysis.audienceSummary,
                audienceInterests: analysis.audienceInterests,
                commercialCategories: analysis.commercialCategories,
                brandSuitability: analysis.brandSuitability,
                opportunityCategories: analysis.opportunityCategories,
                confidenceData: analysis.confidenceData,
                modelVersion: MODEL_VERSION,
            },
        });

        return aiProfile;
    } catch (dbErr: unknown) {
        console.error('[CREATOR_INTELLIGENCE] Database persistence error:', {
            creatorId: creator.id,
            error: dbErr instanceof Error ? dbErr.message : 'Unknown database error',
        });
        throw new DatabasePersistenceError('Failed to save creator intelligence profile to the database.', dbErr);
    }
}

