import { prisma } from '../lib/prisma.js';
import {
    generateCreatorIntelligence,
    type CreatorIntelligenceInput,
} from '../integrations/gemini/index.js';

const MODEL_VERSION = 'gemini-3.8-flash';

export async function analyzeAndSaveCreatorIntelligence(userId: string) {
    // Load the authenticated user's creator profile and real database content.
    const creator = await prisma.creator.findUnique({
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

    if (!creator) {
        throw new Error('CREATOR_PROFILE_NOT_FOUND');
    }

    if (
        !creator.bio?.trim() &&
        creator.contents.every(
            (item) =>
                !item.title?.trim() &&
                !item.description?.trim() &&
                !item.caption?.trim(),
        )
    ) {
        throw new Error('INSUFFICIENT_CREATOR_DATA');
    }

    // Convert database values into JSON-safe inputs for Gemini.
    const input: CreatorIntelligenceInput = {
        displayName: creator.displayName,
        bio: creator.bio,
        location: creator.location,
        content: creator.contents.map((item) => ({
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

    const analysis = await generateCreatorIntelligence(input);

    // Persist the real analysis. Do not overwrite the unsupported vector field.
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
}
