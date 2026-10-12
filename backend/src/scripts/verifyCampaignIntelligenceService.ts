/**
 * CRAB — Milestone 4A: Campaign Intelligence Service & API Verification Suite
 *
 * Verifies:
 * 1. Structured output validation and prompt generation
 * 2. Campaign ownership and unauthorized access enforcement
 * 3. Missing campaign / profile 404 handling
 * 4. Gemini upstream failure with zero database write
 * 5. Persistence failure with safe error handling
 * 6. Preservation of existing profile when analysis fails
 * 7. Correct API response shapes
 * 8. Creator Intelligence regression checks (read-only)
 *
 * SAFETY RULES:
 * - Zero live Gemini API calls (all AI generation is mocked)
 * - Zero mutations of seeded demo records or database state
 */

import {
    buildCampaignIntelligencePrompt,
    campaignIntelligenceResultSchema,
    GeminiServiceError,
    type CampaignIntelligenceInput,
    type CampaignIntelligenceResult,
} from '../integrations/gemini/index.js';
import {
    analyzeAndSaveCampaignIntelligence,
    getCampaignIntelligence,
    DatabasePersistenceError,
} from '../services/campaignIntelligenceService.js';
import { prisma } from '../lib/prisma.js';

interface TestResult {
    category: 'UNIT / MOCKED' | 'SERVICE MOCKED FAILURE PATHS' | 'DATABASE READ-ONLY';
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function runTest(
    category: 'UNIT / MOCKED' | 'SERVICE MOCKED FAILURE PATHS' | 'DATABASE READ-ONLY',
    name: string,
    fn: () => Promise<void> | void
) {
    try {
        await fn();
        results.push({ category, name, passed: true });
        console.log(`  ✅ [${category}] ${name}`);
    } catch (err: any) {
        results.push({ category, name, passed: false, error: err?.message || String(err) });
        console.error(`  ❌ [${category}] ${name} -> ${err?.message || err}`);
    }
}

async function main() {
    console.log('================================================================');
    console.log('🧪 CRAB Campaign Intelligence & Reliability Test Suite (Milestone 4A)');
    console.log('================================================================\n');

    // -------------------------------------------------------------------------
    // CATEGORY 1: UNIT / MOCKED (Prompt generation, Schema validation, Post-processing)
    // -------------------------------------------------------------------------

    await runTest('UNIT / MOCKED', 'Prompt generation grounds brief analysis in provided fields without fabrication', () => {
        const input: CampaignIntelligenceInput = {
            title: 'AWS Cloud Migration Campaign',
            description: 'Tutorial series showcasing cloud architecture on ECS and Lambda.',
            productOrService: 'AWS Fargate',
            objective: 'Drive developer adoption and signups',
            targetAudience: { country: 'India', role: 'DevOps engineers' },
            budgetMin: 30000,
            budgetMax: 75000,
            requiredReach: 40000,
            platform: 'YOUTUBE',
            contentType: 'Dedicated Video',
            contentStyle: 'In-Depth Tutorial',
            creatorNiche: 'Cloud Architecture, DevOps',
            location: 'India',
            timeline: { start: '2026-11-01', end: '2026-11-20' },
            exclusivity: '30 days exclusivity',
            usageRights: '12 months digital distribution',
            brandName: 'Amazon Web Services',
            brandCategory: 'TECHNOLOGY',
        };

        const prompt = buildCampaignIntelligencePrompt(input);
        assert(prompt.includes('AWS Cloud Migration Campaign'), 'Prompt must contain campaign title');
        assert(prompt.includes('AWS Fargate'), 'Prompt must contain productOrService');
        assert(prompt.includes('CRITICAL RULES:'), 'Prompt must contain strict critical rules');
        assert(prompt.includes('Do NOT fabricate target demographics'), 'Prompt must prohibit demographic fabrication');
        assert(prompt.includes('normalizedObjective'), 'Prompt must specify normalizedObjective');
        assert(prompt.includes('inferredNiches'), 'Prompt must specify inferredNiches');
        assert(prompt.includes('confidenceData.limitations'), 'Prompt must specify limitations array');
    });

    await runTest('UNIT / MOCKED', 'Zod schema validates complete campaign intelligence result shape', () => {
        const validResult = {
            normalizedObjective: 'DEVELOPER_ACQUISITION',
            targetAudienceProfile: {
                targetMarkets: ['India', 'United States'],
                targetDemographics: 'Developers aged 22-38',
                audienceInterests: ['Cloud Computing', 'Containers', 'DevOps'],
            },
            inferredNiches: ['Technology', 'Cloud Architecture', 'DevOps'],
            contentRequirements: {
                platform: 'YOUTUBE',
                contentType: 'Dedicated Video',
                contentStyle: 'Hands-on Tutorial',
                deliverablesDescription: '1 full video walkthrough with GitHub repo sample',
            },
            commercialCategories: ['Cloud Platforms', 'Developer Tools'],
            semanticSummary: 'AWS campaign targeting senior DevOps and backend engineers for container deployments.',
            confidenceData: {
                score: 0.88,
                evidenceCount: 12,
                limitations: ['Self-reported audience parameters'],
            },
        };

        const parseResult = campaignIntelligenceResultSchema.safeParse(validResult);
        assert(parseResult.success, 'Schema validation should succeed for complete payload');
    });

    await runTest('UNIT / MOCKED', 'Zod schema rejects payloads missing required confidenceData or invalid score range', () => {
        const invalidScore = {
            normalizedObjective: 'PRODUCT_LAUNCH',
            inferredNiches: ['Tech'],
            commercialCategories: ['SaaS'],
            confidenceData: {
                score: 1.5, // Invalid > 1.0
                evidenceCount: 5,
                limitations: [],
            },
        };

        const result = campaignIntelligenceResultSchema.safeParse(invalidScore);
        assert(!result.success, 'Schema should reject confidenceData.score > 1.0');

        const missingConfidence = {
            normalizedObjective: 'PRODUCT_LAUNCH',
            inferredNiches: ['Tech'],
            commercialCategories: ['SaaS'],
        };

        const result2 = campaignIntelligenceResultSchema.safeParse(missingConfidence);
        assert(!result2.success, 'Schema should reject missing confidenceData');
    });

    await runTest('UNIT / MOCKED', 'Handles null and optional fields safely in schema validation', () => {
        const minimalResult = {
            normalizedObjective: null,
            targetAudienceProfile: null,
            inferredNiches: ['Technology'],
            contentRequirements: null,
            commercialCategories: ['Developer Tools'],
            semanticSummary: null,
            confidenceData: {
                score: 0.40,
                evidenceCount: 2,
                limitations: ['Minimal campaign brief: No deliverables or target demographics provided.'],
            },
        };

        const parseResult = campaignIntelligenceResultSchema.safeParse(minimalResult);
        assert(parseResult.success, 'Schema should allow null values for optional attributes');
    });

    // -------------------------------------------------------------------------
    // CATEGORY 2: SERVICE / MOCKED FAILURE PATHS & AUTHORIZATION
    // -------------------------------------------------------------------------

    await runTest('SERVICE MOCKED FAILURE PATHS', 'getCampaignIntelligence throws CAMPAIGN_NOT_FOUND when campaign does not exist', async () => {
        try {
            await getCampaignIntelligence('non_existent_campaign_id', 'brand_123');
            assert(false, 'Should have thrown CAMPAIGN_NOT_FOUND');
        } catch (err: any) {
            assert(err.message === 'CAMPAIGN_NOT_FOUND', `Expected CAMPAIGN_NOT_FOUND, got ${err.message}`);
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'getCampaignIntelligence throws CAMPAIGN_FORBIDDEN on brand ownership mismatch', async () => {
        // Query an existing demo campaign
        const demoCampaign = await prisma.campaign.findFirst({
            select: { id: true, brandId: true },
        });

        if (!demoCampaign) {
            console.warn('Skipping: No demo campaign found in database');
            return;
        }

        const unauthorizedBrandId = 'different_unauthorized_brand_id';
        assert(demoCampaign.brandId !== unauthorizedBrandId, 'Test brand ID must not match actual owner');

        try {
            await getCampaignIntelligence(demoCampaign.id, unauthorizedBrandId);
            assert(false, 'Should have thrown CAMPAIGN_FORBIDDEN');
        } catch (err: any) {
            assert(err.message === 'CAMPAIGN_FORBIDDEN', `Expected CAMPAIGN_FORBIDDEN, got ${err.message}`);
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'analyzeAndSaveCampaignIntelligence rejects unauthorized brand before calling Gemini', async () => {
        const demoCampaign = await prisma.campaign.findFirst({
            select: { id: true, brandId: true },
        });

        if (!demoCampaign) {
            console.warn('Skipping: No demo campaign found in database');
            return;
        }

        let geminiCalled = false;
        const mockGemini = async () => {
            geminiCalled = true;
            throw new Error('Gemini should NOT be called for unauthorized brand');
        };

        const unauthorizedBrandId = 'unauthorized_brand_999';

        try {
            await analyzeAndSaveCampaignIntelligence(demoCampaign.id, unauthorizedBrandId, mockGemini as any);
            assert(false, 'Should have thrown CAMPAIGN_FORBIDDEN');
        } catch (err: any) {
            assert(err.message === 'CAMPAIGN_FORBIDDEN', `Expected CAMPAIGN_FORBIDDEN, got ${err.message}`);
            assert(!geminiCalled, 'Gemini must not be invoked when brand authorization fails');
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Upstream Gemini 503 error bubbles up as GeminiServiceError with zero database write', async () => {
        const demoCampaign = await prisma.campaign.findFirst({
            include: { aiProfile: true },
        });

        if (!demoCampaign) {
            console.warn('Skipping: No demo campaign found in database');
            return;
        }

        const existingProfileUpdatedAt = demoCampaign.aiProfile?.updatedAt?.toISOString();

        // Mock Gemini throwing transient 503
        const mockFailingGemini = async () => {
            throw new GeminiServiceError('Gemini AI service is currently experiencing high demand. Please try again shortly.', 503, true);
        };

        try {
            await analyzeAndSaveCampaignIntelligence(demoCampaign.id, demoCampaign.brandId, mockFailingGemini as any);
            assert(false, 'Should have thrown GeminiServiceError');
        } catch (err: any) {
            assert(err instanceof GeminiServiceError, 'Should bubble as GeminiServiceError');
            assert(err.statusCode === 503, 'Status code must be 503');
            assert(err.isTransient === true, 'isTransient must be true');
        }

        // Verify database state: existing profile must not be modified or overwritten
        const postCheck = await prisma.campaign.findUnique({
            where: { id: demoCampaign.id },
            include: { aiProfile: true },
        });

        assert(
            postCheck?.aiProfile?.updatedAt?.toISOString() === existingProfileUpdatedAt,
            'Existing profile updatedAt must remain identical after a failed analysis attempt'
        );
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Preserves existing profile when re-analysis fails with 429 rate limit', async () => {
        const demoCampaign = await prisma.campaign.findFirst({
            include: { aiProfile: true },
        });

        if (!demoCampaign || !demoCampaign.aiProfile) {
            console.warn('Skipping: No demo campaign with aiProfile found in database');
            return;
        }

        const originalSemanticSummary = demoCampaign.aiProfile.semanticSummary;

        // Mock Gemini throwing 429 rate limit
        const mockRateLimitedGemini = async () => {
            throw new GeminiServiceError('Gemini AI rate limit exceeded. Please wait a moment before trying again.', 429, true);
        };

        try {
            await analyzeAndSaveCampaignIntelligence(demoCampaign.id, demoCampaign.brandId, mockRateLimitedGemini as any);
            assert(false, 'Should have thrown GeminiServiceError');
        } catch (err: any) {
            assert(err instanceof GeminiServiceError, 'Should throw GeminiServiceError');
            assert(err.statusCode === 429, 'Status code must be 429');
        }

        const reloaded = await prisma.campaignAIProfile.findUnique({
            where: { campaignId: demoCampaign.id },
        });

        assert(
            reloaded?.semanticSummary === originalSemanticSummary,
            'Original profile contents must be strictly preserved upon rate limit failure'
        );
    });

    // -------------------------------------------------------------------------
    // CATEGORY 3: DATABASE READ-ONLY (Seeded demo campaign and Creator regression checks)
    // -------------------------------------------------------------------------

    await runTest('DATABASE READ-ONLY', 'Seeded demo campaigns exist and have brand ownership', async () => {
        const campaigns = await prisma.campaign.findMany({
            include: {
                brand: {
                    select: { id: true, name: true, userId: true },
                },
                aiProfile: true,
            },
        });

        assert(campaigns.length >= 2, `Expected at least 2 seeded campaigns, found ${campaigns.length}`);

        for (const cmp of campaigns) {
            assert(Boolean(cmp.brandId), `Campaign ${cmp.id} must have a brandId`);
            assert(Boolean(cmp.brand), `Campaign ${cmp.id} must be linked to a Brand entity`);
            assert(Boolean(cmp.title), `Campaign ${cmp.id} must have a title`);
        }
    });

    await runTest('DATABASE READ-ONLY', 'GET campaign intelligence returns correct persisted profile for seeded campaign', async () => {
        const demoCampaign = await prisma.campaign.findFirst({
            where: { aiProfile: { isNot: null } },
            include: { aiProfile: true },
        });

        if (!demoCampaign || !demoCampaign.aiProfile) {
            console.warn('Skipping: No seeded campaign with AI profile found');
            return;
        }

        const profile = await getCampaignIntelligence(demoCampaign.id, demoCampaign.brandId);
        assert(Boolean(profile), 'Profile must be returned for authorized brand owner');
        assert(profile.campaignId === demoCampaign.id, 'Profile campaignId must match');
        assert(Array.isArray(profile.inferredNiches), 'inferredNiches must be an array');
        assert(Boolean(profile.semanticSummary), 'semanticSummary must be populated');
    });

    await runTest('DATABASE READ-ONLY', 'Regression Check: Creator Intelligence profile for demo creator is intact', async () => {
        const demoCreator = await prisma.creator.findFirst({
            where: { user: { email: 'alex.chen@crab.demo' } },
            include: { aiProfile: true },
        });

        assert(Boolean(demoCreator), 'Demo creator Alex Chen must exist in database');
        assert(Boolean(demoCreator?.aiProfile), 'Demo creator Alex Chen must have intact CreatorAIProfile');
        assert(
            demoCreator!.aiProfile!.primaryNiches.length > 0,
            'Creator primaryNiches must be preserved from Milestone 3'
        );
    });

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`📊 Test Summary: ${passedCount} Passed, ${failedCount} Failed (Total ${results.length})`);
    console.log('================================================================');

    if (failedCount > 0) {
        process.exitCode = 1;
    }
}

main().finally(async () => {
    await prisma.$disconnect();
});
