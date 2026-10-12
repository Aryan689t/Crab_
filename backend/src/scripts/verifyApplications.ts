/// <reference types="node" />
import * as http from 'http';
import { prisma } from '../lib/prisma.js';

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

async function runApplicationTests() {
  console.log('==================================================');
  console.log('🧪 CRAB Application & Brand Review Verification Suite');
  console.log('==================================================');

  // Connect to active backend or spawn ephemeral server
  let server: http.Server | null = null;
  let baseUrl = process.env.API_URL || 'http://127.0.0.1:5000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const healthCheck = await fetch(`${baseUrl}/health`, { signal: controller.signal }).finally(() => clearTimeout(timeout));
    if (!healthCheck.ok) throw new Error('Not running');
  } catch {
    const { default: expressApp } = await import('../index.js');
    server = http.createServer(expressApp as any);
    await new Promise<void>((resolve) => server!.listen(0, resolve));
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 5000;
    baseUrl = `http://127.0.0.1:${port}`;
  }

  let testApplicationId = '';
  let testCampaignId = '';
  let otherBrandCampaignId = '';

  try {
    // 0. Ensure setup: Look up seeded campaigns or create dedicated test campaigns
    const brand1 = await prisma.brand.findFirst({
      where: { user: { email: 'partnerships@aws.demo' } },
      include: { campaigns: true },
    });

    const brand2 = await prisma.brand.findFirst({
      where: { user: { email: 'growth@veloce.demo' } },
      include: { campaigns: true },
    });

    if (!brand1 || !brand2 || brand1.campaigns.length === 0 || brand2.campaigns.length === 0) {
      throw new Error('Seeded brands/campaigns not found. Run seed script first.');
    }

    testCampaignId = brand1.campaigns[0].id;
    otherBrandCampaignId = brand2.campaigns[0].id;

    // Clean up any lingering previous test applications for demo_creator_01 and testCampaignId
    const creator1 = await prisma.creator.findFirst({
      where: { user: { email: 'alex.chen@crab.demo' } },
    });
    const creator2 = await prisma.creator.findFirst({
      where: { user: { email: 'priya.sharma@crab.demo' } },
    });

    if (!creator1 || !creator2) {
      throw new Error('Seeded creators not found.');
    }

    await prisma.collaboration.deleteMany({
      where: { campaignId: testCampaignId, creatorId: creator1.id },
    });
    await prisma.application.deleteMany({
      where: { campaignId: testCampaignId, creatorId: creator1.id },
    });

    // 1. Authenticated creator can apply to an eligible campaign
    await logTest('1. Authenticated creator can apply to an eligible campaign', async () => {
      const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${creator1.userId}-creator`,
        },
        body: JSON.stringify({
          pitch: 'I am excited to demonstrate serverless workflows for cloud developers.',
          proposedRate: 35000,
        }),
      });

      const json: any = await res.json();
      if (res.status !== 201 || !json.data?.id || json.data.status !== 'SUBMITTED') {
        throw new Error(`Expected 201 created, got ${res.status}: ${JSON.stringify(json)}`);
      }
      testApplicationId = json.data.id;
    });

    // 2. Unauthenticated user cannot apply
    await logTest('2. Unauthenticated user cannot apply (returns 401)', async () => {
      const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: 'Pitch note' }),
      });

      if (res.status !== 401) {
        throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
      }
    });

    // 3. Brand account cannot apply as a creator
    await logTest('3. Brand account cannot apply as a creator (returns 403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${brand1.userId}-brand`,
        },
        body: JSON.stringify({ pitch: 'Brand trying to apply' }),
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 4. Duplicate applications are rejected
    await logTest('4. Duplicate application is rejected with 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${creator1.userId}-creator`,
        },
        body: JSON.stringify({ pitch: 'Second attempt should fail' }),
      });

      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict, got ${res.status}`);
      }
    });

    // 5. Creator cannot read another creator's private application
    await logTest("5. Creator cannot read another creator's private application (returns 403)", async () => {
      const res = await fetch(`${baseUrl}/api/applications/${testApplicationId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer mock-${creator2.userId}-creator`,
        },
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 6. Brand can review applications for its own campaign
    await logTest('6. Brand can review applications for its own campaign', async () => {
      const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer mock-${brand1.userId}-brand`,
        },
      });

      const json: any = await res.json();
      if (res.status !== 200 || !Array.isArray(json.data)) {
        throw new Error(`Expected 200 with data array, got ${res.status}: ${JSON.stringify(json)}`);
      }

      const found = json.data.some((a: any) => a.id === testApplicationId);
      if (!found) {
        throw new Error(`Created application ${testApplicationId} was not found in campaign applications list.`);
      }
    });

    // 7. Brand cannot review or modify another brand's applications
    await logTest("7. Brand cannot review or modify another brand's applications (returns 403)", async () => {
      // Brand 2 trying to read applications for Brand 1's campaign
      const getRes = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/applications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer mock-${brand2.userId}-brand`,
        },
      });
      if (getRes.status !== 403) {
        throw new Error(`Expected 403 on getCampaignApplications, got ${getRes.status}`);
      }

      // Brand 2 trying to update Brand 1's application status
      const patchRes = await fetch(`${baseUrl}/api/applications/${testApplicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${brand2.userId}-brand`,
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      });
      if (patchRes.status !== 403) {
        throw new Error(`Expected 403 on updateApplicationStatus, got ${patchRes.status}`);
      }
    });

    // 8. Invalid status transitions and input validations are rejected
    await logTest('8. Invalid status transitions and inputs are rejected (400 Bad Request)', async () => {
      // Invalid status value
      const res1 = await fetch(`${baseUrl}/api/applications/${testApplicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${brand1.userId}-brand`,
        },
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      });
      if (res1.status !== 400) {
        throw new Error(`Expected 400 for invalid status, got ${res1.status}`);
      }

      // Invalid negative proposed rate
      const res2 = await fetch(`${baseUrl}/api/campaigns/${otherBrandCampaignId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${creator2.userId}-creator`,
        },
        body: JSON.stringify({ proposedRate: -500 }),
      });
      if (res2.status !== 400) {
        throw new Error(`Expected 400 for negative proposed rate, got ${res2.status}`);
      }
    });

    // 9. Successful status changes persist in the database and create a Collaboration
    await logTest('9. Status change to ACCEPTED persists and creates Collaboration atomically', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${testApplicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-${brand1.userId}-brand`,
        },
        body: JSON.stringify({
          status: 'ACCEPTED',
          brandNote: 'Looking forward to working together!',
        }),
      });

      const json: any = await res.json();
      if (res.status !== 200 || json.data?.status !== 'ACCEPTED') {
        throw new Error(`Expected 200 ACCEPTED, got ${res.status}: ${JSON.stringify(json)}`);
      }

      // Verify in DB directly
      const dbApp = await prisma.application.findUnique({
        where: { id: testApplicationId },
      });
      if (!dbApp || dbApp.status !== 'ACCEPTED') {
        throw new Error('Application status was not persisted in PostgreSQL.');
      }

      // Verify Collaboration creation
      const collab = await prisma.collaboration.findFirst({
        where: { campaignId: testCampaignId, creatorId: creator1.id },
      });
      if (!collab) {
        throw new Error('Collaboration was not created upon application acceptance.');
      }
    });

    // 10. Creator can retrieve their submitted applications and see the updated ACCEPTED status
    await logTest('10. Creator retrieves submitted applications and sees updated status', async () => {
      const res = await fetch(`${baseUrl}/api/creators/me/applications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer mock-${creator1.userId}-creator`,
        },
      });

      const json: any = await res.json();
      if (res.status !== 200 || !Array.isArray(json.data)) {
        throw new Error(`Expected 200 with list, got ${res.status}: ${JSON.stringify(json)}`);
      }

      const myApp = json.data.find((a: any) => a.id === testApplicationId);
      if (!myApp) {
        throw new Error('Application not found in creator list.');
      }
      if (myApp.status !== 'ACCEPTED') {
        throw new Error(`Expected status to be ACCEPTED, got ${myApp.status}`);
      }
    });

  } finally {
    // Clean up test records
    if (testApplicationId) {
      await prisma.collaboration.deleteMany({ where: { campaignId: testCampaignId } });
      await prisma.application.deleteMany({ where: { id: testApplicationId } });
    }
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} tests passed.`);
  console.log('==================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runApplicationTests();
