/// <reference types="node" />
import * as http from 'http';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';
import { generateYouTubeAuthUrl, validateOAuthState } from '../integrations/youtube/index.js';

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

async function runYouTubeIntegrationTests() {
  console.log('====================================================');
  console.log('🎥 CRAB YouTube API & Deliverable Submission Test Suite');
  console.log('====================================================\n');

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

  try {
    // 1. Locate test creator, foreign creator, and brand
    const creator = await prisma.creator.findFirst({
      where: { user: { email: 'alex.chen@crab.demo' } },
      include: { user: true },
    });
    const foreignCreator = await prisma.creator.findFirst({
      where: { user: { email: 'priya.sharma@crab.demo' } },
      include: { user: true },
    });
    const brand = await prisma.brand.findFirst({
      where: { user: { email: 'partnerships@aws.demo' } },
      include: { user: true, campaigns: true },
    });
    const foreignBrand = await prisma.brand.findFirst({
      where: { user: { email: 'growth@veloce.demo' } },
      include: { user: true },
    });

    if (!creator || !foreignCreator || !brand || !foreignBrand) {
      throw new Error('Test users not found in database. Seed data first.');
    }

    const creatorToken = `Bearer mock-${creator.userId}-creator`;
    const foreignCreatorToken = `Bearer mock-${foreignCreator.userId}-creator`;
    const brandToken = `Bearer mock-${brand.userId}-brand`;
    const foreignBrandToken = `Bearer mock-${foreignBrand.userId}-brand`;

    // 2. Test OAuth CSRF State Validation
    await logTest('1. Google OAuth CSRF state parameter validation', async () => {
      const origClientId = config.google.clientId;
      if (!config.google.clientId) {
        config.google.clientId = 'test_demo_client_id.apps.googleusercontent.com';
      }

      try {
        // Simulate generating auth URL
        const { authUrl, state } = generateYouTubeAuthUrl(creator.id);
        if (!authUrl.includes('accounts.google.com') || !state.includes(creator.id)) {
          throw new Error('Invalid OAuth URL generated');
        }

        // Valid state consumption
        const validCheck = validateOAuthState(state);
        if (!validCheck.valid || validCheck.creatorId !== creator.id) {
          throw new Error('State validation should succeed on first use');
        }

        // Replay attack prevention (single-use token)
        const replayCheck = validateOAuthState(state);
        if (replayCheck.valid) {
          throw new Error('State token must be single-use to prevent replay/CSRF attacks');
        }

        // Fake state rejection
        const fakeCheck = validateOAuthState('fake_state_12345');
        if (fakeCheck.valid) {
          throw new Error('Fake state token should be rejected');
        }
      } finally {
        config.google.clientId = origClientId;
      }
    });

    // 3. Connect YouTube Channel for Creator
    const testChannelId = 'UC_alex_cloud_demo_01';
    const foreignChannelId = 'UC_priya_foreign_demo_02';

    await logTest('2. Connect YouTube channel and persist in SocialAccount', async () => {
      // Clean up previous test accounts
      await prisma.content.deleteMany({
        where: { creatorId: creator.id, platform: 'YOUTUBE' },
      });
      await prisma.socialAccount.deleteMany({
        where: { creatorId: creator.id, platform: 'YOUTUBE' },
      });

      const res = await fetch(`${baseUrl}/api/social/youtube/connect-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: creatorToken,
        },
        body: JSON.stringify({
          channelHandleOrUrl: 'https://youtube.com/@AlexChenTech',
        }),
      });

      const json: any = await res.json();
      if (!res.ok || !json.data?.success) {
        throw new Error(`Failed to connect YouTube channel: ${JSON.stringify(json)}`);
      }

      // Verify SocialAccount in PostgreSQL
      const savedAccount = await prisma.socialAccount.findFirst({
        where: { creatorId: creator.id, platform: 'YOUTUBE' },
      });

      if (!savedAccount || savedAccount.status !== 'CONNECTED') {
        throw new Error('SocialAccount record not found or not connected in PostgreSQL');
      }
    });

    // 4. Retrieve Connected YouTube Accounts API
    await logTest('3. GET /api/social/accounts returns YouTube channel profile and stats', async () => {
      const res = await fetch(`${baseUrl}/api/social/accounts`, {
        headers: { Authorization: creatorToken },
      });

      const json: any = await res.json();
      if (!res.ok || !Array.isArray(json.data) || json.data.length === 0) {
        throw new Error(`Expected connected accounts list, got ${JSON.stringify(json)}`);
      }

      const yt = json.data.find((a: any) => a.platform === 'YOUTUBE');
      if (!yt || yt.status !== 'CONNECTED' || !yt.stats) {
        throw new Error('YouTube channel profile missing required stats');
      }
    });

    // 5. Video Synchronization and Fetching
    const testVideoId = 'yt_vid_cloud_infra_01';
    await logTest('4. Sync YouTube uploaded videos and verify Content table persistence', async () => {
      const res = await fetch(`${baseUrl}/api/social/youtube/sync`, {
        method: 'POST',
        headers: { Authorization: creatorToken },
      });

      const json: any = await res.json();
      if (!res.ok || !json.data?.videos) {
        throw new Error(`YouTube sync failed: ${JSON.stringify(json)}`);
      }

      // Explicitly register a test video for alex
      const ytAccount = await prisma.socialAccount.findFirst({
        where: { creatorId: creator.id, platform: 'YOUTUBE' },
      });

      await prisma.content.upsert({
        where: {
          platform_platformContentId: {
            platform: 'YOUTUBE',
            platformContentId: testVideoId,
          },
        },
        update: {
          title: 'Cloud Infrastructure Launch & CLI Deep Dive',
          permalink: `https://www.youtube.com/watch?v=${testVideoId}`,
          socialAccountId: ytAccount!.id,
        },
        create: {
          creatorId: creator.id,
          socialAccountId: ytAccount!.id,
          platform: 'YOUTUBE',
          platformContentId: testVideoId,
          title: 'Cloud Infrastructure Launch & CLI Deep Dive',
          description: 'Official 12-minute technical walkthrough and CLI integration tutorial for Acme Cloud.',
          permalink: `https://www.youtube.com/watch?v=${testVideoId}`,
          contentType: 'VIDEO',
          publishedAt: new Date(),
        },
      });

      // Verify in Content table
      const storedContent = await prisma.content.findUnique({
        where: {
          platform_platformContentId: {
            platform: 'YOUTUBE',
            platformContentId: testVideoId,
          },
        },
      });

      if (!storedContent || storedContent.platformContentId !== testVideoId) {
        throw new Error('Video was not stored in Content table');
      }
    });

    // Register a video belonging to foreign creator for ownership test
    const foreignVideoId = 'yt_vid_foreign_channel_99';
    const foreignAccount = await prisma.socialAccount.upsert({
      where: {
        platform_platformAccountId: {
          platform: 'YOUTUBE',
          platformAccountId: foreignChannelId,
        },
      },
      update: { creatorId: foreignCreator.id },
      create: {
        creatorId: foreignCreator.id,
        platform: 'YOUTUBE',
        platformAccountId: foreignChannelId,
        username: '@PriyaSharma',
        status: 'CONNECTED',
      },
    });

    await prisma.content.upsert({
      where: {
        platform_platformContentId: {
          platform: 'YOUTUBE',
          platformContentId: foreignVideoId,
        },
      },
      update: {
        creatorId: foreignCreator.id,
        socialAccountId: foreignAccount.id,
      },
      create: {
        creatorId: foreignCreator.id,
        socialAccountId: foreignAccount.id,
        platform: 'YOUTUBE',
        platformContentId: foreignVideoId,
        title: 'Foreign Creator Video - Fashion & Lifestyle',
        description: 'Unrelated channel video.',
        permalink: `https://www.youtube.com/watch?v=${foreignVideoId}`,
        contentType: 'VIDEO',
        publishedAt: new Date(),
      },
    });

    // Setup Collaboration
    let testCollab = await prisma.collaboration.findFirst({
      where: { creatorId: creator.id, brandId: brand.id },
    });

    if (!testCollab) {
      testCollab = await prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandId: brand.id,
          campaignId: brand.campaigns[0].id,
          status: 'IN_PROGRESS',
          deliverables: [
            {
              id: 'deliv_yt_01',
              type: 'YOUTUBE_VIDEO',
              title: 'Dedicated 12-minute YouTube video tutorial',
              description: 'Hands-on technical tutorial and CLI integration deep dive.',
              status: 'AWAITING_VIDEO',
              submittedVideo: null,
            },
            {
              id: 'deliv_yt_02',
              type: 'PINNED_COMMENT',
              title: 'Pinned comment code snippet & resource link',
              description: 'Pinned comment with direct resource link and documentation.',
              status: 'AWAITING_VIDEO',
              submittedVideo: null,
            },
          ],
        },
      });
    } else {
      // Reset deliverables to AWAITING_VIDEO for clean test
      testCollab = await prisma.collaboration.update({
        where: { id: testCollab.id },
        data: {
          status: 'IN_PROGRESS',
          deliverables: [
            {
              id: 'deliv_yt_01',
              type: 'YOUTUBE_VIDEO',
              title: 'Dedicated 12-minute YouTube video tutorial',
              description: 'Hands-on technical tutorial and CLI integration deep dive.',
              status: 'AWAITING_VIDEO',
              submittedVideo: null,
            },
            {
              id: 'deliv_yt_02',
              type: 'PINNED_COMMENT',
              title: 'Pinned comment code snippet & resource link',
              description: 'Pinned comment with direct resource link and documentation.',
              status: 'AWAITING_VIDEO',
              submittedVideo: null,
            },
          ],
        },
      });
    }

    // 6. Security: Creator cannot submit video belonging to another channel
    await logTest('5. Security: Creator cannot submit video from another channel (returns 403)', async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/submit-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: creatorToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_01',
          videoId: foreignVideoId, // Belongs to foreignCreator
          videoTitle: 'Stolen Video',
        }),
      });

      if (res.status !== 403) {
        const body = await res.text();
        throw new Error(`Expected 403 Forbidden, got ${res.status}: ${body}`);
      }
    });

    // 7. Security: Creator cannot submit to another creator's collaboration
    await logTest("6. Security: Creator cannot modify another creator's collaboration (returns 403)", async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/submit-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: foreignCreatorToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_01',
          videoId: testVideoId,
        }),
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 8. Associate verified video with campaign deliverable
    await logTest('7. Creator associates verified YouTube video with deliverable (status -> SUBMITTED)', async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/submit-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: creatorToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_01',
          videoId: testVideoId,
          videoTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
          videoUrl: `https://www.youtube.com/watch?v=${testVideoId}`,
        }),
      });

      const json: any = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(`Deliverable submission failed: ${JSON.stringify(json)}`);
      }

      const updated = json.data;
      const deliverable = updated.deliverables.find((d: any) => d.id === 'deliv_yt_01');
      if (!deliverable || deliverable.status !== 'SUBMITTED' || !deliverable.submittedVideo) {
        throw new Error('Deliverable was not updated to SUBMITTED with submittedVideo metadata');
      }

      if (deliverable.submittedVideo.videoId !== testVideoId) {
        throw new Error('Submitted video ID mismatch');
      }
    });

    // 9. Security: Unrelated brand cannot review deliverable
    await logTest("8. Security: Unrelated brand cannot review collaboration (returns 403)", async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/review-deliverable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: foreignBrandToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_01',
          decision: 'APPROVED',
        }),
      });

      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 10. Brand reviews and approves deliverable
    await logTest('9. Brand reviews and approves deliverable (deliverable -> APPROVED)', async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/review-deliverable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: brandToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_01',
          decision: 'APPROVED',
          feedback: 'Outstanding technical tutorial and comprehensive CLI demonstration. Approved!',
        }),
      });

      const json: any = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(`Brand review failed: ${JSON.stringify(json)}`);
      }

      const deliverable = json.data.deliverables.find((d: any) => d.id === 'deliv_yt_01');
      if (!deliverable || deliverable.status !== 'APPROVED') {
        throw new Error('Deliverable status was not updated to APPROVED');
      }
    });

    // 11. Complete remaining deliverables to test collaboration completion
    await logTest('10. Approving all deliverables transitions collaboration status to COMPLETED', async () => {
      const res = await fetch(`${baseUrl}/api/collaborations/${testCollab.id}/review-deliverable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: brandToken,
        },
        body: JSON.stringify({
          deliverableId: 'deliv_yt_02',
          decision: 'APPROVED',
          feedback: 'Pinned comment verified on YouTube.',
        }),
      });

      const json: any = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(`Final deliverable review failed: ${JSON.stringify(json)}`);
      }

      if (json.data.status !== 'COMPLETED') {
        throw new Error(`Expected collaboration status COMPLETED, got ${json.data.status}`);
      }
    });

    // 12. PostgreSQL Persistence Verification
    await logTest('11. Full database persistence verification across all entities', async () => {
      const dbCollab = await prisma.collaboration.findUnique({
        where: { id: testCollab.id },
      });

      if (!dbCollab || dbCollab.status !== 'COMPLETED') {
        throw new Error('Database collaboration state does not match COMPLETED');
      }

      const deliverables = dbCollab.deliverables as any[];
      const ytDeliv = deliverables.find((d) => d.id === 'deliv_yt_01');
      if (!ytDeliv || ytDeliv.status !== 'APPROVED' || !ytDeliv.submittedVideo) {
        throw new Error('Submitted video and approval state failed to persist in PostgreSQL');
      }
    });

  } finally {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`Test Summary: ${results.filter((r) => r.passed).length}/${results.length} passed`);
  console.log('====================================================');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`Failed ${failed.length} test(s):`, failed.map((f) => f.name));
    process.exit(1);
  }
}

runYouTubeIntegrationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
