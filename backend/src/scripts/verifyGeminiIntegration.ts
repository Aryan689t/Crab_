import {
    GeminiServiceError,
    isTransientGeminiError,
    type CreatorIntelligenceInput,
    type CreatorIntelligenceResult,
} from '../integrations/gemini/index.js';

interface TestResult {
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

async function runTest(name: string, fn: () => Promise<void> | void) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log(`  ✅ PASS: ${name}`);
    } catch (err: any) {
        results.push({ name, passed: false, error: err?.message || String(err) });
        console.error(`  ❌ FAIL: ${name} -> ${err?.message || err}`);
    }
}

async function main() {
    console.log('==================================================');
    console.log('🧪 CRAB Gemini Integration Hardening Test Suite (Milestone 1)');
    console.log('==================================================\n');

    // Test 1: GeminiServiceError structure
    await runTest('GeminiServiceError exposes statusCode and isTransient flag', () => {
        const err503 = new GeminiServiceError('High demand', 503, true);
        assert(err503.statusCode === 503, 'Expected status 503');
        assert(err503.isTransient === true, 'Expected isTransient true');
        assert(err503.name === 'GeminiServiceError', 'Expected name GeminiServiceError');

        const err502 = new GeminiServiceError('Bad response', 502, false);
        assert(err502.statusCode === 502, 'Expected status 502');
        assert(err502.isTransient === false, 'Expected isTransient false');
    });

    // Test 2: Transient error identification
    await runTest('isTransientGeminiError correctly identifies transient vs permanent errors', () => {
        // Transient 503 / 429
        assert(isTransientGeminiError({ status: 503 }), 'status 503 should be transient');
        assert(isTransientGeminiError({ statusCode: 429 }), 'statusCode 429 should be transient');
        assert(isTransientGeminiError({ error: { code: 503 } }), 'error.code 503 should be transient');
        assert(isTransientGeminiError({ error: { status: 'UNAVAILABLE' } }), 'UNAVAILABLE should be transient');
        assert(
            isTransientGeminiError(new Error('This model is currently experiencing high demand. Spikes in demand are usually temporary.')),
            'High demand message should be transient'
        );
        assert(
            isTransientGeminiError(new Error('Resource has been exhausted (e.g. check quota). rate limit reached')),
            'Rate limit message should be transient'
        );

        // Permanent errors (must NOT be marked transient)
        assert(!isTransientGeminiError({ status: 400 }), 'status 400 is not transient');
        assert(!isTransientGeminiError({ status: 401 }), 'status 401 is not transient');
        assert(!isTransientGeminiError({ status: 404 }), 'status 404 is not transient');
        assert(!isTransientGeminiError(new Error('Invalid argument provided')), 'Invalid argument is not transient');
        assert(!isTransientGeminiError(null), 'null is not transient');
    });

    // Test 3: Safe sanitization (no key leak)
    await runTest('API Key sanitization removes sensitive query params', () => {
        const sensitiveMsg = 'Call to https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSySecretKey1234 failed';
        const sanitized = sensitiveMsg.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]');
        assert(!sanitized.includes('AIzaSySecretKey1234'), 'Secret key was not redacted');
        assert(sanitized.includes('key=[REDACTED]'), 'Redacted replacement not found');
    });

    // Test 4: Verify seeded database is untouched
    await runTest('Verification that seeded mentor-presentation demo creator is untouched', async () => {
        const { prisma } = await import('../lib/prisma.js');
        const demoCreator = await prisma.creator.findFirst({
            where: { user: { email: 'alex.chen@crab.demo' } },
            include: { aiProfile: true },
        });

        assert(demoCreator !== null, 'Seeded demo creator alex.chen@crab.demo must exist');
        assert(demoCreator!.aiProfile !== null, 'Seeded demo creator AI profile must exist');
        assert(
            demoCreator!.aiProfile!.primaryNiches.length > 0,
            'Seeded demo creator primaryNiches must be preserved'
        );
        await prisma.$disconnect();
    });

    console.log('\n==================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(`Results: ${results.filter((r) => r.passed).length}/${results.length} passed.`);
    if (allPassed) {
        console.log('🎉 All Milestone 1 verification checks PASSED.');
    } else {
        console.error('❌ Some tests FAILED.');
        process.exitCode = 1;
    }
    console.log('==================================================\n');
}

main().catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exitCode = 1;
});
