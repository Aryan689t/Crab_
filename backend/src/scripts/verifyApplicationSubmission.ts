import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- VERIFYING APPLICATION SUBMISSION & VALIDATION ---');

  const creator = await prisma.creator.findFirst({
    include: { user: true },
  });

  if (!creator || !creator.user) {
    console.error('Creator not found in DB');
    process.exit(1);
  }

  const creatorUser = creator.user;

  const activeCampaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true, budgetMin: true, brand: { select: { name: true } } },
  });

  if (!activeCampaign) {
    console.error('No active campaign found in DB');
    process.exit(1);
  }

  console.log(`Creator: ${creator.displayName} (${creatorUser.id})`);
  console.log(`Campaign: "${activeCampaign.title}" by ${activeCampaign.brand.name} (${activeCampaign.id})`);

  const baseUrl = 'http://127.0.0.1:5000';
  const authToken = `token-${creatorUser.id}-CREATOR`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  // Clean up any existing test application for this creator on this campaign
  await prisma.application.deleteMany({
    where: {
      creatorId: creator.id,
      campaignId: activeCampaign.id,
    },
  });

  // 1. Test valid application submission
  const validPitch = 'Hello! My YouTube channel focuses on developer tools and cloud infrastructure. I would love to create a dedicated 7-minute deep dive tutorial demoing your features with code examples.';
  const applyRes = await fetch(`${baseUrl}/api/campaigns/${activeCampaign.id}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pitch: validPitch,
      proposedRate: Number(activeCampaign.budgetMin) || 30000,
    }),
  });
  const applyData = await applyRes.json();
  console.log(`[TEST 1] Valid application submission status: ${applyRes.status}`);
  console.log(`   - Application ID: ${applyData.data?.id}`);
  console.log(`   - Status: ${applyData.data?.status}`);

  if (applyRes.status !== 201) {
    console.error('Failed to submit valid application:', applyData);
    process.exit(1);
  }

  // 2. Test duplicate application rejection (HTTP 409)
  const dupRes = await fetch(`${baseUrl}/api/campaigns/${activeCampaign.id}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pitch: validPitch,
      proposedRate: Number(activeCampaign.budgetMin) || 30000,
    }),
  });
  const dupData = await dupRes.json();
  console.log(`[TEST 2] Duplicate application rejection status: ${dupRes.status} (expected 409)`);
  console.log(`   - Error: ${dupData.error}`);
  console.log(`   - Message: ${dupData.message}`);

  if (dupRes.status === 409) {
    console.log('✅ Duplicate applications are strictly prevented and rejected with HTTP 409!');
  } else {
    console.error('❌ Expected 409 DuplicateApplication, got:', dupRes.status);
    process.exit(1);
  }

  // 3. Test GET /api/creators/me/applications
  const myAppsRes = await fetch(`${baseUrl}/api/creators/me/applications`, { headers });
  const myAppsData = await myAppsRes.json();
  console.log(`[TEST 3] GET /api/creators/me/applications status: ${myAppsRes.status}`);
  const hasApp = myAppsData.data?.some((a: any) => a.campaignId === activeCampaign.id || a.campaign?.id === activeCampaign.id);
  if (hasApp) {
    console.log('✅ Newly created application appears in GET /api/creators/me/applications!');
  } else {
    console.error('❌ Application not found in creator applications list');
  }

  console.log('--- ALL APPLICATION TESTS PASSED ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
