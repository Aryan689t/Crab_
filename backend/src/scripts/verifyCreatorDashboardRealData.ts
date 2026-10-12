import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- VERIFYING REAL DATA CREATOR DASHBOARD ENDPOINTS ---');

  // 1. Check campaigns in DB
  const activeCampaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true, brand: { select: { name: true } } },
  });
  console.log(`[DB] Active campaigns in database: ${activeCampaigns.length}`);
  activeCampaigns.forEach((c) => console.log(`   - ${c.title} (${c.brand.name})`));

  // 2. Test user lookup & token auth
  const testUser = await prisma.user.findFirst({
    where: { role: 'CREATOR' },
    include: { creator: true },
  });

  if (!testUser) {
    console.error('No creator user found in database to test.');
    process.exit(1);
  }

  console.log(`[USER] Testing with creator user ID: ${testUser.id}, email: ${testUser.email}`);
  const authToken = `mock-test-token-${testUser.id}`;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  const baseUrl = 'http://127.0.0.1:5000';

  // 3. Test GET /api/creators/me
  const profileRes = await fetch(`${baseUrl}/api/creators/me`, { headers });
  const profileData = await profileRes.json();
  console.log(`[GET /api/creators/me] Status: ${profileRes.status}`);
  console.log(`   - Display Name: "${profileData.data?.displayName}"`);
  console.log(`   - Bio: "${profileData.data?.bio || '(none)'}"`);

  // 4. Test GET /api/creators/me/metrics
  const metricsRes = await fetch(`${baseUrl}/api/creators/me/metrics`, { headers });
  const metricsData = await metricsRes.json();
  console.log(`[GET /api/creators/me/metrics] Status: ${metricsRes.status}`);
  console.log(`   - hasData: ${metricsData.data?.hasData}`);
  console.log(`   - followers: ${metricsData.data?.followers}`);
  console.log(`   - avgViews: ${metricsData.data?.averageViews}`);
  console.log(`   - engagementRate: ${metricsData.data?.engagementRate}`);
  console.log(`   - growthData points: ${metricsData.data?.growthData?.length || 0}`);

  // 5. Test GET /api/creators/me/opportunities
  const oppsRes = await fetch(`${baseUrl}/api/creators/me/opportunities`, { headers });
  const oppsData = await oppsRes.json();
  const oppsList = Array.isArray(oppsData.data) ? oppsData.data : oppsData.data?.opportunities || [];
  console.log(`[GET /api/creators/me/opportunities] Status: ${oppsRes.status}`);
  console.log(`   - Matched count: ${oppsList.length}`);
  if (oppsList.length > 0) {
    oppsList.forEach((o: any) => {
      console.log(`   - "${o.title}" by ${o.brand} (${o.matchScore}% match)`);
    });
  }

  // 6. Test GET /api/creators/me/activity
  const actRes = await fetch(`${baseUrl}/api/creators/me/activity`, { headers });
  const actData = await actRes.json();
  const actList = Array.isArray(actData.data) ? actData.data : actData.data?.activities || [];
  console.log(`[GET /api/creators/me/activity] Status: ${actRes.status}`);
  console.log(`   - Activity events: ${actList.length}`);

  // 7. Test PATCH /api/creators/me (persistence test)
  const newName = `Verified Creator ${Date.now().toString().slice(-4)}`;
  const patchRes = await fetch(`${baseUrl}/api/creators/me`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      displayName: newName,
      bio: 'Testing profile persistence with verified updates',
      location: 'Bangalore, India',
      preferences: {
        niches: ['Technology', 'AI & Machine Learning'],
        rateEstimate: '65000',
      },
    }),
  });
  const patchData = await patchRes.json();
  console.log(`[PATCH /api/creators/me] Status: ${patchRes.status}`);
  console.log(`   - Saved displayName: "${patchData.data?.displayName}"`);

  // Verify persistence on subsequent GET
  const verifyRes = await fetch(`${baseUrl}/api/creators/me`, { headers });
  const verifyData = await verifyRes.json();
  if (verifyData.data?.displayName === newName) {
    console.log(`✅ [PERSISTENCE] Display name successfully persisted to PostgreSQL and verified on subsequent GET!`);
  } else {
    console.error(`❌ [PERSISTENCE] Mismatch! Expected "${newName}", got "${verifyData.data?.displayName}"`);
  }

  console.log('--- ALL REAL DATA CHECKS COMPLETED ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
