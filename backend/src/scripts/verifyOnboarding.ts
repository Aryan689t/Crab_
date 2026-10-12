import { prisma } from '../lib/prisma.js';
import { getSupabaseClient } from '../lib/supabase.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function logTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message || String(err) });
    console.error(`❌ FAIL: ${name}:`, err.message || err);
  }
}

async function runOnboardingTests() {
  console.log('==================================================');
  console.log('🦀 CRAB Creator Onboarding Test Suite');
  console.log('==================================================');

  const timestamp = Date.now();
  const testCreatorEmail = `test.creator.${timestamp}@gmail.com`;
  const testBrandEmail = `test.brand.${timestamp}@gmail.com`;

  let creatorUserId = `creator-user-${timestamp}`;
  let brandUserId = `brand-user-${timestamp}`;

  try {
    // 1. Create a fresh Creator user with no social accounts & no onboardingCompleted
    let createdCreator: any = null;
    await logTest('1. Provision fresh Creator user in PostgreSQL', async () => {
      const user = await prisma.user.create({
        data: {
          id: creatorUserId,
          email: testCreatorEmail,
          role: 'CREATOR',
        },
      });

      createdCreator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: 'New Test Creator',
          contactInformation: { email: testCreatorEmail },
          preferences: {},
        },
      });

      if (!createdCreator) throw new Error('Failed to create creator record');
    });

    // 2. Test incomplete onboarding (both empty) via mock controller call logic
    await logTest('2. Incomplete onboarding validation (both empty strings rejected)', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          youtubeUrl: '',
          instagramUrl: '',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request, got status ${res.status}`);
      }
      const data = await res.json();
      if (!data.message.includes('at least one')) {
        throw new Error(`Expected error message about at least one URL, got: ${data.message}`);
      }
    });

    // 3. Test invalid YouTube URL
    await logTest('3. Invalid YouTube URL rejected with 400', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          youtubeUrl: 'https://vimeo.com/123456',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request for invalid YouTube URL, got status ${res.status}`);
      }
      const data = await res.json();
      if (data.field !== 'youtubeUrl') {
        throw new Error(`Expected field to be youtubeUrl, got ${data.field}`);
      }
    });

    // 4. Test invalid Instagram URL
    await logTest('4. Invalid Instagram URL rejected with 400', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          instagramUrl: 'https://twitter.com/invaliduser',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request for invalid Instagram URL, got status ${res.status}`);
      }
      const data = await res.json();
      if (data.field !== 'instagramUrl') {
        throw new Error(`Expected field to be instagramUrl, got ${data.field}`);
      }
    });

    // 5. Test valid YouTube-only submission
    await logTest('5. Valid YouTube-only submission persists to DB and returns onboardingCompleted: true', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          youtubeUrl: 'https://youtube.com/@mkbhd',
        }),
      });

      if (res.status !== 200) {
        const errText = await res.text();
        throw new Error(`Expected 200 OK, got ${res.status}: ${errText}`);
      }

      const body = await res.json();
      if (!body.onboardingCompleted) {
        throw new Error('Expected onboardingCompleted to be true in response');
      }

      // Check real DB persistence
      const updatedCreator = await prisma.creator.findUnique({
        where: { id: createdCreator.id },
        include: { socialAccounts: true },
      });

      const prefs = updatedCreator?.preferences as any;
      if (!prefs?.onboardingCompleted) {
        throw new Error('Expected preferences.onboardingCompleted to be true in PostgreSQL');
      }

      const ytAccount = updatedCreator?.socialAccounts.find(sa => sa.platform === 'YOUTUBE');
      if (!ytAccount || !ytAccount.authorizationReference?.includes('youtube.com/@mkbhd')) {
        throw new Error('Expected SocialAccount record for YOUTUBE in PostgreSQL');
      }
    });

    // 6. Test GET /api/auth/me reflects onboardingCompleted: true for creator
    await logTest('6. GET /api/auth/me returns onboardingCompleted: true', async () => {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
      });

      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got ${res.status}`);
      }

      const body = await res.json();
      if (body.data.onboardingCompleted !== true) {
        throw new Error(`Expected body.data.onboardingCompleted to be true, got ${body.data.onboardingCompleted}`);
      }
    });

    // 7. Test Instagram-only submission updates DB
    await logTest('7. Valid Instagram-only submission persists to DB', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          instagramUrl: 'https://instagram.com/mkbhd',
        }),
      });

      if (res.status !== 200) {
        const errText = await res.text();
        throw new Error(`Expected 200 OK, got ${res.status}: ${errText}`);
      }

      const updatedCreator = await prisma.creator.findUnique({
        where: { id: createdCreator.id },
        include: { socialAccounts: true },
      });

      const igAccount = updatedCreator?.socialAccounts.find(sa => sa.platform === 'INSTAGRAM');
      if (!igAccount || !igAccount.authorizationReference?.includes('instagram.com/mkbhd')) {
        throw new Error('Expected SocialAccount record for INSTAGRAM in PostgreSQL');
      }
    });

    // 8. Test Both YouTube and Instagram submission simultaneously
    await logTest('8. Both YouTube and Instagram submission succeeds and upserts', async () => {
      const res = await fetch('http://localhost:5000/api/creators/me/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-${creatorUserId}-creator`,
        },
        body: JSON.stringify({
          youtubeUrl: 'https://youtube.com/@veritasium',
          instagramUrl: 'https://instagram.com/veritasium',
        }),
      });

      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got ${res.status}`);
      }

      const updatedCreator = await prisma.creator.findUnique({
        where: { id: createdCreator.id },
        include: { socialAccounts: true },
      });

      if (updatedCreator?.socialAccounts.length! < 2) {
        throw new Error(`Expected at least 2 connected social accounts, found ${updatedCreator?.socialAccounts.length}`);
      }
    });

    // 9. Test Brand user is unaffected
    await logTest('9. Brand users have onboardingCompleted: true and are unaffected', async () => {
      const brandUser = await prisma.user.create({
        data: {
          id: brandUserId,
          email: testBrandEmail,
          role: 'BRAND',
        },
      });

      await prisma.brand.create({
        data: {
          userId: brandUser.id,
          name: 'Test Brand Inc',
          contactInformation: { email: testBrandEmail },
        },
      });

      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer mock-${brandUserId}-brand`,
        },
      });

      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got ${res.status}`);
      }

      const body = await res.json();
      if (body.data.onboardingCompleted !== true) {
        throw new Error(`Expected brand onboardingCompleted to be true, got ${body.data.onboardingCompleted}`);
      }
    });

    // 10. Clean up test users
    await logTest('10. Clean up test records', async () => {
      await prisma.socialAccount.deleteMany({
        where: { creatorId: createdCreator.id },
      });
      await prisma.creator.deleteMany({
        where: { userId: creatorUserId },
      });
      await prisma.brand.deleteMany({
        where: { userId: brandUserId },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [creatorUserId, brandUserId] } },
      });
    });

  } finally {
    console.log('==================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`📊 Onboarding Test Results: ${passedCount}/${results.length} PASSED`);
    console.log('==================================================');
    await prisma.$disconnect();
  }
}

runOnboardingTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
