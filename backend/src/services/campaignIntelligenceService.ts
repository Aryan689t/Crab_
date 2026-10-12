import { prisma } from '../lib/prisma.js';
import {
    generateCampaignIntelligence,
    type CampaignIntelligenceInput,
} from '../integrations/gemini/index.js';
import { DatabasePersistenceError } from './creatorIntelligenceService.js';

export { DatabasePersistenceError };

const MODEL_VERSION = 'gemini-3.8-flash';

export async function analyzeAndSaveCampaignIntelligence(
    campaignId: string,
    brandId: string,
    intelligenceGenerator = generateCampaignIntelligence
) {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            brand: {
                select: {
                    id: true,
                    name: true,
                    category: true,
                },
            },
        },
    });

    if (!campaign) {
        throw new Error('CAMPAIGN_NOT_FOUND');
    }

    if (campaign.brandId !== brandId) {
        throw new Error('CAMPAIGN_FORBIDDEN');
    }

    const hasTitle = Boolean(campaign.title?.trim());
    const hasDescription = Boolean(campaign.description?.trim());
    if (!hasTitle && !hasDescription) {
        throw new Error('INSUFFICIENT_CAMPAIGN_DATA');
    }

    const input: CampaignIntelligenceInput = {
        title: campaign.title,
        description: campaign.description,
        productOrService: campaign.productOrService,
        objective: campaign.objective,
        targetAudience: campaign.targetAudience,
        budgetMin: campaign.budgetMin ? Number(campaign.budgetMin) : null,
        budgetMax: campaign.budgetMax ? Number(campaign.budgetMax) : null,
        requiredReach: campaign.requiredReach,
        platform: campaign.platform,
        contentType: campaign.contentType,
        contentStyle: campaign.contentStyle,
        creatorNiche: campaign.creatorNiche,
        location: campaign.location,
        timeline: campaign.timeline,
        exclusivity: campaign.exclusivity,
        usageRights: campaign.usageRights,
        brandName: campaign.brand?.name || null,
        brandCategory: campaign.brand?.category || null,
    };

    // If Gemini fails, this throws GeminiServiceError and no DB write is attempted.
    // An existing profile is completely preserved.
    const analysis = await intelligenceGenerator(input);

    try {
        const aiProfile = await prisma.campaignAIProfile.upsert({
            where: { campaignId: campaign.id },
            update: {
                normalizedObjective: analysis.normalizedObjective,
                targetAudienceProfile: analysis.targetAudienceProfile as any,
                inferredNiches: analysis.inferredNiches,
                contentRequirements: analysis.contentRequirements as any,
                commercialCategories: analysis.commercialCategories,
                semanticSummary: analysis.semanticSummary,
                confidenceData: analysis.confidenceData as any,
                modelVersion: MODEL_VERSION,
                generatedAt: new Date(),
            },
            create: {
                campaignId: campaign.id,
                normalizedObjective: analysis.normalizedObjective,
                targetAudienceProfile: analysis.targetAudienceProfile as any,
                inferredNiches: analysis.inferredNiches,
                contentRequirements: analysis.contentRequirements as any,
                commercialCategories: analysis.commercialCategories,
                semanticSummary: analysis.semanticSummary,
                confidenceData: analysis.confidenceData as any,
                modelVersion: MODEL_VERSION,
            },
        });

        return aiProfile;
    } catch (dbErr: unknown) {
        console.error('[CAMPAIGN_INTELLIGENCE] Database persistence error:', {
            campaignId: campaign.id,
            error: dbErr instanceof Error ? dbErr.message : 'Unknown database error',
        });
        throw new DatabasePersistenceError('Failed to save campaign intelligence profile to the database.', dbErr);
    }
}

export async function getCampaignIntelligence(
    campaignId: string,
    brandId: string
) {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            aiProfile: true,
        },
    });

    if (!campaign) {
        throw new Error('CAMPAIGN_NOT_FOUND');
    }

    if (campaign.brandId !== brandId) {
        throw new Error('CAMPAIGN_FORBIDDEN');
    }

    if (!campaign.aiProfile) {
        throw new Error('CAMPAIGN_INTELLIGENCE_NOT_FOUND');
    }

    return campaign.aiProfile;
}
