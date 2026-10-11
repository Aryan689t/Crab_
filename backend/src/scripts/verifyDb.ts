import { prisma } from '../lib/prisma.js';

async function verifyDatabaseIntegration() {
  console.log('==================================================');
  console.log('🧪 CRAB Database Integration Verification');
  console.log('==================================================');

  const startTime = Date.now();
  try {
    // 1. Basic raw query
    const rawResult: any = await prisma.$queryRaw`SELECT 1 as connected, NOW() as current_time`;
    console.log('✅ 1. Raw query executed successfully:');
    console.log(`   - Connected status: ${rawResult[0]?.connected}`);
    console.log(`   - Supabase Server Time: ${rawResult[0]?.current_time}`);

    // 2. pgvector extension check
    const vectorResult: any = await prisma.$queryRaw`SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'`;
    if (vectorResult.length > 0) {
      console.log(`✅ 2. pgvector extension verified: v${vectorResult[0].extversion}`);
    } else {
      console.log('⚠️ 2. pgvector extension not found in pg_extension');
    }

    // 3. Model read operations (zero writes, zero fake records)
    const [userCount, creatorCount, brandCount, campaignCount, matchCount] = await Promise.all([
      prisma.user.count(),
      prisma.creator.count(),
      prisma.brand.count(),
      prisma.campaign.count(),
      prisma.match.count(),
    ]);

    console.log('✅ 3. Table read operations (count queries) succeeded:');
    console.log(`   - users: ${userCount}`);
    console.log(`   - creators: ${creatorCount}`);
    console.log(`   - brands: ${brandCount}`);
    console.log(`   - campaigns: ${campaignCount}`);
    console.log(`   - matches: ${matchCount}`);

    const duration = Date.now() - startTime;
    console.log(`\n🎉 Verification SUCCESSFUL in ${duration}ms. All tables accessible.`);
  } catch (err: any) {
    console.error('❌ Verification FAILED:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Prisma client disconnected cleanly.');
    console.log('==================================================');
  }
}

verifyDatabaseIntegration();
