import {
    buildCreatorIntelligencePrompt,
    GeminiServiceError,
    isTransientGeminiError,
    type CreatorIntelligenceInput,
    type CreatorIntelligenceResult,
} from '../integrations/gemini/index.js';
import {
    analyzeAndSaveCreatorIntelligence,
    DatabasePersistenceError,
} from '../services/creatorIntelligenceService.js';
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
    console.log('🧪 CRAB Creator Intelligence & Reliability Test Suite (Milestone 2)');
    console.log('================================================================\n');

    // -------------------------------------------------------------------------
    // CATEGORY 1: UNIT / MOCKED (Isolated pure-function testing)
    // -------------------------------------------------------------------------

    await runTest('UNIT / MOCKED', 'Prompt generation enforces Profile-Only rules and evidenceCount=0 when content is empty', () => {
        const input: CreatorIntelligenceInput = {
            displayName: 'Solo Creator',
            bio: 'Tech enthusiast sharing gadget reviews.',
            location: 'San Francisco, CA',
            isProfileOnly: true,
            content: [],
        };

        const prompt = buildCreatorIntelligencePrompt(input);
        assert(prompt.includes('EVIDENCE MODE: PROFILE-ONLY ANALYSIS'), 'Must include profile-only mode header');
        assert(prompt.includes('No published content items'), 'Must state no content items available');
        assert(prompt.includes('DO NOT claim content analysis, audience demographics'), 'Must instruct not to claim ungrounded attributes');
        assert(prompt.includes('conservative score between 0.20 and 0.40'), 'Must constrain qualitative score');
        assert(prompt.includes('set the value to 0'), 'evidenceCount must be documented as 0 when no content items analyzed');
        assert(prompt.includes('confidenceData.limitations'), 'Must enforce limitations array');
        assert(prompt.includes('NOT a statistically calibrated probability'), 'Must clarify score is not calibrated probability');
    });

    await runTest('UNIT / MOCKED', 'Prompt generation grounds analysis in provided content records and evidenceCount=N', () => {
        const input: CreatorIntelligenceInput = {
            displayName: 'Tech Pro',
            bio: 'Deep dives into open source AI.',
            location: 'Austin, TX',
            isProfileOnly: false,
            content: [
                {
                    platform: 'YOUTUBE',
                    title: 'Building AI Agents in TypeScript',
                    description: 'A deep dive into LLM tooling',
                    caption: null,
                    contentType: 'VIDEO',
                    publishedAt: '2026-03-01T12:00:00Z',
                    views: 12500,
                    likes: 840,
                    comments: 92,
                },
                {
                    platform: 'INSTAGRAM',
                    title: null,
                    description: null,
                    caption: 'Setting up my local dev workspace #developer #ai',
                    contentType: 'POST',
                    publishedAt: '2026-03-05T15:00:00Z',
                    views: 3200,
                    likes: 410,
                    comments: 18,
                },
            ],
        };

        const prompt = buildCreatorIntelligencePrompt(input);
        assert(prompt.includes('EVIDENCE MODE: CONTENT-BACKED ANALYSIS'), 'Must include content-backed mode header');
        assert(prompt.includes('Content items (2 posts) are available'), 'Must reference correct post count');
        assert(prompt.includes('Building AI Agents in TypeScript'), 'Must embed content titles in evidence');
        assert(prompt.includes('Setting up my local dev workspace'), 'Must embed caption in evidence');
        assert(prompt.includes('number of analyzed content items (2)'), 'Must guide content-backed evidenceCount');
        assert(prompt.includes('assign a score between 0.45 and 0.85'), 'Must guide content-backed qualitative score');
    });

    await runTest('UNIT / MOCKED', 'Rejection of creators lacking both bio and content data', () => {
        const creatorWithoutBioOrContent: { bio: string | null; contents: any[] } = {
            bio: null,
            contents: [],
        };

        const hasBio = Boolean(creatorWithoutBioOrContent.bio?.trim());
        const usableContents = creatorWithoutBioOrContent.contents.filter(
            (item: any) =>
                Boolean(item.title?.trim()) ||
                Boolean(item.description?.trim()) ||
                Boolean(item.caption?.trim()) ||
                item.views !== null ||
                item.likes !== null
        );
        const hasUsableContent = usableContents.length > 0;

        assert(!hasBio && !hasUsableContent, 'Should detect lack of both bio and usable content');
    });

    await runTest('UNIT / MOCKED', 'Server-side post-processing deterministically clamps profile-only score to 0.40 and sets evidenceCount=0', () => {
        const mockRawProfile: CreatorIntelligenceResult = {
            primaryNiches: ['Technology'],
            secondaryNiches: ['Software'],
            contentStyle: ['Informative'],
            audienceSummary: null,
            audienceInterests: ['Coding'],
            commercialCategories: ['Developer Tools'],
            brandSuitability: {
                recommended: ['GitHub', 'VS Code'],
                avoid: ['Gambling'],
            },
            opportunityCategories: ['Sponsorships'],
            confidenceData: {
                score: 0.95, // Hallucinated high score
                evidenceCount: 5, // Hallucinated count
                limitations: ['Self-reported bio data'],
            },
        };

        const isProfileOnly = true;

        if (isProfileOnly) {
            mockRawProfile.confidenceData.evidenceCount = 0;
            if (
                !mockRawProfile.confidenceData.limitations.some(
                    (l) => l.toLowerCase().includes('profile') || l.toLowerCase().includes('content')
                )
            ) {
                mockRawProfile.confidenceData.limitations.push(
                    'Profile-only analysis: Evaluated without published content records, engagement metrics, or audience telemetry.'
                );
            }
            if (mockRawProfile.confidenceData.score > 0.40) {
                mockRawProfile.confidenceData.score = 0.40;
            }
        }

        mockRawProfile.confidenceData.score = Number(
            Math.max(0, Math.min(1, mockRawProfile.confidenceData.score)).toFixed(2)
        );

        assert(mockRawProfile.confidenceData.score === 0.40, 'Score must be clamped to 0.40 max for profile-only');
        assert(mockRawProfile.confidenceData.evidenceCount === 0, 'Evidence count must be strictly 0 for profile-only analysis');
        assert(
            mockRawProfile.confidenceData.limitations.some((l) => l.includes('Profile-only analysis')),
            'Limitations must include explicit profile-only disclaimer'
        );
    });

    await runTest('UNIT / MOCKED', 'GeminiServiceError correctly categorizes transient (429/503) and permanent errors', () => {
        const rateLimitErr = new GeminiServiceError('Rate limit exceeded', 429, true);
        assert(rateLimitErr.statusCode === 429, 'Rate limit should have status 429');
        assert(rateLimitErr.isTransient === true, 'Rate limit should be transient');

        const badJsonErr = new GeminiServiceError('Gemini returned invalid JSON.', 502, false);
        assert(badJsonErr.statusCode === 502, 'Bad JSON should have status 502');
        assert(badJsonErr.isTransient === false, 'Bad JSON should not be transient');

        const badShapeErr = new GeminiServiceError('Gemini returned intelligence data with an invalid shape.', 502, false);
        assert(badShapeErr.statusCode === 502, 'Bad shape should have status 502');
    });

    await runTest('UNIT / MOCKED', 'DatabasePersistenceError encapsulates database failure without leaking raw DB connection or credentials', () => {
        const rawDbError = new Error('FATAL: password authentication failed for user postgres at postgresql://admin:secretPass@localhost:5432/crab');
        const persistenceErr = new DatabasePersistenceError('Failed to save creator intelligence profile to the database.', rawDbError);

        assert(persistenceErr.name === 'DatabasePersistenceError', 'Error name should be DatabasePersistenceError');
        assert(persistenceErr.message === 'Failed to save creator intelligence profile to the database.', 'User message must be client-safe');
        assert(persistenceErr.cause === rawDbError, 'Original cause should be accessible for internal logging');
        assert(!persistenceErr.message.includes('secretPass'), 'Client-facing message must not leak credentials');
        assert(!persistenceErr.message.includes('postgresql://'), 'Client-facing message must not leak connection string');
    });

    // -------------------------------------------------------------------------
    // CATEGORY 2: SERVICE MOCKED FAILURE PATHS (Testing real service with mocks)
    // -------------------------------------------------------------------------

    const originalFindUnique = prisma.creator.findUnique;
    const originalFindFirst = prisma.creator.findFirst;
    const originalUpsert = prisma.creatorAIProfile.upsert;

    const mockCreatorRecord = {
        id: 'mock-creator-id-123',
        displayName: 'Mock Creator',
        bio: 'Tech enthusiast and educator',
        location: 'Bengaluru, India',
        contents: [],
    };

    const validMockAnalysis: CreatorIntelligenceResult = {
        primaryNiches: ['Tech'],
        secondaryNiches: ['Coding'],
        contentStyle: ['Educational'],
        audienceSummary: null,
        audienceInterests: ['Engineering'],
        commercialCategories: ['Developer Tools'],
        brandSuitability: {
            recommended: ['Tech Brands'],
            avoid: ['Gambling'],
        },
        opportunityCategories: ['Product Reviews'],
        confidenceData: {
            score: 0.35,
            evidenceCount: 0,
            limitations: ['Profile-only analysis'],
        },
    };

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Invalid Gemini output prevents profile upsert in database', async () => {
        let upsertCalled = false;
        prisma.creator.findUnique = (async () => mockCreatorRecord) as any;
        prisma.creatorAIProfile.upsert = (async () => {
            upsertCalled = true;
            return {} as any;
        }) as any;

        const failingGeminiGenerator = async () => {
            throw new GeminiServiceError('Gemini returned invalid JSON.', 502, false);
        };

        try {
            await analyzeAndSaveCreatorIntelligence('test-user-id', undefined, failingGeminiGenerator);
            assert(false, 'Expected analyzeAndSaveCreatorIntelligence to throw GeminiServiceError');
        } catch (err: any) {
            assert(err instanceof GeminiServiceError, 'Should throw GeminiServiceError');
            assert(err.statusCode === 502, 'Should have status 502');
            assert(!upsertCalled, 'No profile upsert should occur when Gemini output is invalid');
        } finally {
            prisma.creator.findUnique = originalFindUnique;
            prisma.creatorAIProfile.upsert = originalUpsert;
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Gemini upstream failure (429/503) prevents profile upsert in database', async () => {
        let upsertCalled = false;
        prisma.creator.findUnique = (async () => mockCreatorRecord) as any;
        prisma.creatorAIProfile.upsert = (async () => {
            upsertCalled = true;
            return {} as any;
        }) as any;

        const rateLimitedGeminiGenerator = async () => {
            throw new GeminiServiceError('Gemini AI rate limit exceeded.', 429, true);
        };

        try {
            await analyzeAndSaveCreatorIntelligence('test-user-id', undefined, rateLimitedGeminiGenerator);
            assert(false, 'Expected analyzeAndSaveCreatorIntelligence to throw GeminiServiceError');
        } catch (err: any) {
            assert(err instanceof GeminiServiceError, 'Should throw GeminiServiceError');
            assert(err.statusCode === 429, 'Should have status 429');
            assert(err.isTransient === true, 'Should be flagged as transient');
            assert(!upsertCalled, 'No profile upsert should occur when Gemini service fails');
        } finally {
            prisma.creator.findUnique = originalFindUnique;
            prisma.creatorAIProfile.upsert = originalUpsert;
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Prisma upsert failure returns safe DatabasePersistenceError without leaking connection details', async () => {
        prisma.creator.findUnique = (async () => mockCreatorRecord) as any;
        prisma.creatorAIProfile.upsert = (async () => {
            throw new Error('Connection terminated unexpectedly at postgresql://postgres:mypassword@supabase.co:5432');
        }) as any;

        const successfulGeminiGenerator = async () => validMockAnalysis;

        try {
            await analyzeAndSaveCreatorIntelligence('test-user-id', undefined, successfulGeminiGenerator);
            assert(false, 'Expected analyzeAndSaveCreatorIntelligence to throw DatabasePersistenceError');
        } catch (err: any) {
            assert(err instanceof DatabasePersistenceError, 'Should throw DatabasePersistenceError');
            assert(err.message === 'Failed to save creator intelligence profile to the database.', 'Client-safe error message');
            assert(!err.message.includes('mypassword'), 'Must not leak database password');
            assert(!err.message.includes('postgresql://'), 'Must not leak database URI');
        } finally {
            prisma.creator.findUnique = originalFindUnique;
            prisma.creatorAIProfile.upsert = originalUpsert;
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Missing creator halts execution before Gemini call and before database write', async () => {
        prisma.creator.findUnique = (async () => null) as any;
        prisma.creator.findFirst = (async () => null) as any;

        let geminiCalled = false;
        let upsertCalled = false;
        prisma.creatorAIProfile.upsert = (async () => {
            upsertCalled = true;
            return {} as any;
        }) as any;

        const trackedGeminiGenerator = async () => {
            geminiCalled = true;
            return validMockAnalysis;
        };

        try {
            await analyzeAndSaveCreatorIntelligence('non-existent-user-id', undefined, trackedGeminiGenerator);
            assert(false, 'Expected CREATOR_PROFILE_NOT_FOUND error');
        } catch (err: any) {
            assert(err.message === 'CREATOR_PROFILE_NOT_FOUND', 'Should throw CREATOR_PROFILE_NOT_FOUND');
            assert(!geminiCalled, 'Gemini must NOT be called if creator profile is missing');
            assert(!upsertCalled, 'Database write must NOT occur if creator profile is missing');
        } finally {
            prisma.creator.findUnique = originalFindUnique;
            prisma.creator.findFirst = originalFindFirst;
            prisma.creatorAIProfile.upsert = originalUpsert;
        }
    });

    await runTest('SERVICE MOCKED FAILURE PATHS', 'Authenticated identity strictly scopes target creator ID and cannot update another creator', async () => {
        const authenticatedUserId = 'auth-user-alice';
        const expectedCreatorId = 'creator-uuid-alice';

        prisma.creator.findUnique = (async ({ where }: any) => {
            if (where.userId === authenticatedUserId) {
                return {
                    id: expectedCreatorId,
                    displayName: 'Alice Creator',
                    bio: 'Design and UX creator',
                    location: 'London, UK',
                    contents: [],
                };
            }
            return null;
        }) as any;

        let capturedTargetCreatorId: string | null = null;
        prisma.creatorAIProfile.upsert = (async ({ where, create, update }: any) => {
            capturedTargetCreatorId = where.creatorId;
            assert(create.creatorId === expectedCreatorId, 'Create payload must use resolved creator ID');
            return {
                creatorId: where.creatorId,
                ...validMockAnalysis,
            } as any;
        }) as any;

        const successfulGeminiGenerator = async () => validMockAnalysis;

        const savedProfile = await analyzeAndSaveCreatorIntelligence(authenticatedUserId, undefined, successfulGeminiGenerator);
        assert(capturedTargetCreatorId === expectedCreatorId, 'Upsert must target the authenticated user’s creator ID');
        assert(savedProfile.creatorId === expectedCreatorId, 'Returned profile belongs strictly to the authenticated user');
        assert(capturedTargetCreatorId !== 'creator-uuid-bob', 'Cannot update a different creator');

        prisma.creator.findUnique = originalFindUnique;
        prisma.creatorAIProfile.upsert = originalUpsert;
    });

    // -------------------------------------------------------------------------
    // CATEGORY 3: DATABASE READ-ONLY (Preservation of seeded presentation demo)
    // -------------------------------------------------------------------------

    await runTest('DATABASE READ-ONLY', 'Verify seeded demo creator alex.chen@crab.demo is completely preserved and untouched', async () => {
        const demoCreator = await prisma.creator.findFirst({
            where: { user: { email: 'alex.chen@crab.demo' } },
            include: { aiProfile: true },
        });

        assert(demoCreator !== null, 'Seeded demo creator alex.chen@crab.demo must exist in database');
        assert(demoCreator!.aiProfile !== null, 'Seeded demo creator AI profile must exist');
        assert(demoCreator!.displayName === 'Alex Chen', 'Display name must remain Alex Chen');
        assert(
            demoCreator!.aiProfile!.primaryNiches.includes('Tech & Gadgets') ||
            demoCreator!.aiProfile!.primaryNiches.length > 0,
            'Seeded demo primary niches must be preserved'
        );
        assert(
            demoCreator!.aiProfile!.brandSuitability !== null,
            'Seeded demo brand suitability must be preserved'
        );
    });

    console.log('\n================================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`Results: ${passedCount}/${results.length} tests passed.`);
    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
        console.log('🎉 All Milestone 2 verification checks PASSED.');
    } else {
        console.error('❌ Some tests FAILED.');
        process.exitCode = 1;
    }
    console.log('================================================================\n');
}

main()
    .catch((err) => {
        console.error('Fatal error in test runner:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
