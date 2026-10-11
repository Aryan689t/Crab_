import { prisma } from '../lib/prisma.js';

interface SeedCreator {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  bio: string;
  location: string;
  profileImageUrl: string;
  preferences: any;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  handle: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  postingFrequency: number;
  primaryNiches: string[];
  secondaryNiches: string[];
  contentStyle: string[];
  audienceSummary: string;
}

const SEED_CREATORS: SeedCreator[] = [
  {
    id: 'demo_creator_01',
    userId: 'demo_user_creator_01',
    email: 'alex.chen@crab.demo',
    displayName: 'Alex Chen',
    bio: 'Fullstack software engineer breaking down cloud architecture, Next.js, and generative AI tooling.',
    location: 'Bengaluru, India',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    preferences: { primaryNiche: 'Technology', rateEstimate: 35000 },
    platform: 'YOUTUBE',
    handle: '@alextechlabs',
    followers: 142000,
    avgViews: 48200,
    engagementRate: 5.6,
    postingFrequency: 3.4,
    primaryNiches: ['Technology', 'Software Engineering', 'AI Tools'],
    secondaryNiches: ['Cloud Architecture', 'DevOps'],
    contentStyle: ['In-Depth Tutorials', 'Code Walkthroughs'],
    audienceSummary: '68% software engineers, fullstack developers, and technical founders in India & US.',
  },
  {
    id: 'demo_creator_02',
    userId: 'demo_user_creator_02',
    email: 'priya.sharma@crab.demo',
    displayName: 'Priya Sharma',
    bio: 'Frontend architect and UI designer specializing in Tailwind, React, and modern web UX.',
    location: 'Mumbai, India',
    profileImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    preferences: { primaryNiche: 'Web Design', rateEstimate: 22000 },
    platform: 'YOUTUBE',
    handle: '@priyacodes',
    followers: 88500,
    avgViews: 32400,
    engagementRate: 6.2,
    postingFrequency: 2.0,
    primaryNiches: ['Web Design', 'Frontend Development', 'SaaS Tools'],
    secondaryNiches: ['UI/UX', 'Design Systems'],
    contentStyle: ['Design Breakdowns', 'Live UI Builds'],
    audienceSummary: 'Early-stage tech builders, UI designers, and frontend web developers.',
  },
  {
    id: 'demo_creator_03',
    userId: 'demo_user_creator_03',
    email: 'rohan.varma@crab.demo',
    displayName: 'Rohan Varma',
    bio: 'Kubernetes, AWS cloud cost optimization, and infrastructure as code.',
    location: 'Hyderabad, India',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    preferences: { primaryNiche: 'DevOps', rateEstimate: 45000 },
    platform: 'YOUTUBE',
    handle: '@rohandevops',
    followers: 210000,
    avgViews: 62000,
    engagementRate: 4.8,
    postingFrequency: 4.0,
    primaryNiches: ['DevOps', 'Cloud Infrastructure', 'Cybersecurity'],
    secondaryNiches: ['Kubernetes', 'Linux Systems'],
    contentStyle: ['Hands-on Benchmarks', 'Architecture Deep-dives'],
    audienceSummary: 'Enterprise devops engineers, sysadmins, and senior cloud architects.',
  },
  {
    id: 'demo_creator_04',
    userId: 'demo_user_creator_04',
    email: 'sarah.miller@crab.demo',
    displayName: 'Sarah Miller',
    bio: 'Indie hacking, micro-SaaS case studies, and bootstrapping tech startups.',
    location: 'London, UK',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    preferences: { primaryNiche: 'Indie Hacking', rateEstimate: 18000 },
    platform: 'INSTAGRAM',
    handle: '@sarah.builds',
    followers: 64000,
    avgViews: 28500,
    engagementRate: 7.1,
    postingFrequency: 5.0,
    primaryNiches: ['Indie Hacking', 'Productivity & SaaS', 'AI Tools'],
    secondaryNiches: ['Bootstrapping', 'Digital Marketing'],
    contentStyle: ['Short-form Reels', 'Founder Stories'],
    audienceSummary: 'Solo-entrepreneurs, indie hackers, and product designers.',
  },
  {
    id: 'demo_creator_05',
    userId: 'demo_user_creator_05',
    email: 'marcus.vance@crab.demo',
    displayName: 'Marcus Vance',
    bio: 'Visual design systems, Framer prototyping, and 3D web experiences.',
    location: 'Berlin, Germany',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    preferences: { primaryNiche: 'Design Systems', rateEstimate: 28000 },
    platform: 'YOUTUBE',
    handle: '@marcusdesign',
    followers: 95000,
    avgViews: 39000,
    engagementRate: 5.9,
    postingFrequency: 2.5,
    primaryNiches: ['Design Systems', 'UI/UX', 'Framer'],
    secondaryNiches: ['Web Animation', 'Typography'],
    contentStyle: ['Framer Tutorials', 'Design Reviews'],
    audienceSummary: 'Product designers, agency owners, and design engineers.',
  },
  {
    id: 'demo_creator_06',
    userId: 'demo_user_creator_06',
    email: 'elena.rostova@crab.demo',
    displayName: 'Elena Rostova',
    bio: 'AI agents, prompt engineering, and automated developer productivity workflows.',
    location: 'Toronto, Canada',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    preferences: { primaryNiche: 'AI Automation', rateEstimate: 32000 },
    platform: 'YOUTUBE',
    handle: '@elena_ai',
    followers: 128000,
    avgViews: 45000,
    engagementRate: 6.4,
    postingFrequency: 3.0,
    primaryNiches: ['AI Automation', 'Developer Productivity', 'TypeScript'],
    secondaryNiches: ['LLM Workflows', 'Python'],
    contentStyle: ['Workflow Breakdowns', 'Live AI Agent Demos'],
    audienceSummary: 'AI builders, automation consultants, and junior/senior developers.',
  },
];

interface SeedBrand {
  id: string;
  userId: string;
  email: string;
  name: string;
  description: string;
  category: string;
  website: string;
  targetMarkets: string[];
  campaigns: Array<{
    id: string;
    title: string;
    description: string;
    productOrService: string;
    objective: string;
    budgetMin: number;
    budgetMax: number;
    requiredReach: number;
    platform: 'YOUTUBE' | 'INSTAGRAM';
    contentType: string;
    contentStyle: string;
    creatorNiche: string;
    timeline: any;
    exclusivity: string;
    usageRights: string;
    status: 'ACTIVE' | 'DRAFT';
  }>;
}

const SEED_BRANDS: SeedBrand[] = [
  {
    id: 'demo_brand_01',
    userId: 'demo_user_brand_01',
    email: 'partnerships@aws.demo',
    name: 'Amazon Web Services',
    description: 'Cloud infrastructure, serverless application platforms, and AI foundations.',
    category: 'TECHNOLOGY',
    website: 'https://aws.amazon.com',
    targetMarkets: ['India', 'United States', 'Europe'],
    campaigns: [
      {
        id: 'demo_cmp_aws_01',
        title: 'AWS Developer Cloud Acceleration Sprint',
        description: 'Drive developer adoption and hands-on tutorials for serverless AI deployments and Bedrock SDKs.',
        productOrService: 'AWS App Runner & Bedrock AI SDKs',
        objective: 'Drive developer adoption and hands-on tutorials for serverless AI deployments.',
        budgetMin: 30000,
        budgetMax: 75000,
        requiredReach: 40000,
        platform: 'YOUTUBE',
        contentType: 'Dedicated Video',
        contentStyle: 'In-Depth Technical Walkthrough',
        creatorNiche: 'Technology, Software Engineering, AI Tools',
        timeline: { start: '2026-11-01', end: '2026-11-20' },
        exclusivity: '30 days cloud provider category exclusivity',
        usageRights: '12 months digital social distribution',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'demo_brand_02',
    userId: 'demo_user_brand_02',
    email: 'growth@veloce.demo',
    name: 'Veloce AI',
    description: 'Next-generation autonomous code editor and AI agent workspace for engineering teams.',
    category: 'TECHNOLOGY',
    website: 'https://veloce.ai',
    targetMarkets: ['Global', 'India', 'North America'],
    campaigns: [
      {
        id: 'demo_cmp_veloce_02',
        title: 'Veloce AI Fullstack IDE Launch',
        description: 'Generate developer buzz, workflow demos, and beta registrations for autonomous editor features.',
        productOrService: 'Veloce Autonomous Code Editor',
        objective: 'Generate developer buzz, workflow demos, and beta registrations.',
        budgetMin: 20000,
        budgetMax: 45000,
        requiredReach: 25000,
        platform: 'YOUTUBE',
        contentType: 'Integration / Mid-Roll',
        contentStyle: 'Fast-paced Developer Workflow Demo',
        creatorNiche: 'Software Development, Productivity & SaaS, Web Design',
        timeline: { start: '2026-11-10', end: '2026-12-05' },
        exclusivity: 'No exclusivity required',
        usageRights: '6 months organic repost rights',
        status: 'ACTIVE',
      },
    ],
  },
];

export async function seedDemoData() {
  console.log('==================================================');
  console.log('🌱 CRAB Idempotent Demo Seed Script');
  console.log('==================================================');

  try {
    // 1. Seed Creators
    console.log(`\n📦 Seeding ${SEED_CREATORS.length} Demo Creators...`);
    for (const c of SEED_CREATORS) {
      // Upsert User
      const user = await prisma.user.upsert({
        where: { email: c.email },
        update: { role: 'CREATOR' },
        create: {
          id: c.userId,
          email: c.email,
          role: 'CREATOR',
        },
      });

      // Upsert Creator Profile
      const creator = await prisma.creator.upsert({
        where: { userId: user.id },
        update: {
          displayName: c.displayName,
          bio: c.bio,
          location: c.location,
          profileImageUrl: c.profileImageUrl,
          preferences: c.preferences,
          contactInformation: { email: c.email },
        },
        create: {
          id: c.id,
          userId: user.id,
          displayName: c.displayName,
          bio: c.bio,
          location: c.location,
          profileImageUrl: c.profileImageUrl,
          preferences: c.preferences,
          contactInformation: { email: c.email },
        },
      });

      // Upsert Social Account
      const social = await prisma.socialAccount.upsert({
        where: {
          platform_platformAccountId: {
            platform: c.platform,
            platformAccountId: `${c.platform.toLowerCase()}_${c.handle.replace('@', '')}`,
          },
        },
        update: {
          username: c.handle,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
        },
        create: {
          creatorId: creator.id,
          platform: c.platform,
          platformAccountId: `${c.platform.toLowerCase()}_${c.handle.replace('@', '')}`,
          username: c.handle,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
        },
      });

      // Upsert Creator Metric Snapshot
      const existingSnapshot = await prisma.creatorMetricSnapshot.findFirst({
        where: { creatorId: creator.id },
      });
      if (!existingSnapshot) {
        await prisma.creatorMetricSnapshot.create({
          data: {
            creatorId: creator.id,
            socialAccountId: social.id,
            followers: c.followers,
            averageViews: c.avgViews,
            engagementRate: c.engagementRate,
            postingFrequency: c.postingFrequency,
            source: 'API_SYNC',
          },
        });
      }

      // Upsert Creator AI Profile
      await prisma.creatorAIProfile.upsert({
        where: { creatorId: creator.id },
        update: {
          primaryNiches: c.primaryNiches,
          secondaryNiches: c.secondaryNiches,
          contentStyle: c.contentStyle,
          audienceSummary: c.audienceSummary,
          audienceInterests: c.primaryNiches,
          commercialCategories: ['Developer Tools', 'B2B SaaS', 'Cloud Platforms'],
          brandSuitability: {
            recommended: ['Developer Platforms', 'Cloud & Hosting', 'AI Software'],
            avoid: ['Gambling', 'Unverified Crypto'],
          },
        },
        create: {
          creatorId: creator.id,
          primaryNiches: c.primaryNiches,
          secondaryNiches: c.secondaryNiches,
          contentStyle: c.contentStyle,
          audienceSummary: c.audienceSummary,
          audienceInterests: c.primaryNiches,
          commercialCategories: ['Developer Tools', 'B2B SaaS', 'Cloud Platforms'],
          brandSuitability: {
            recommended: ['Developer Platforms', 'Cloud & Hosting', 'AI Software'],
            avoid: ['Gambling', 'Unverified Crypto'],
          },
        },
      });

      console.log(`   ✓ Creator: ${c.displayName} (${c.handle})`);
    }

    // 2. Seed Brands and Campaigns
    console.log(`\n🏢 Seeding ${SEED_BRANDS.length} Demo Brands & Campaigns...`);
    for (const b of SEED_BRANDS) {
      const user = await prisma.user.upsert({
        where: { email: b.email },
        update: { role: 'BRAND' },
        create: {
          id: b.userId,
          email: b.email,
          role: 'BRAND',
        },
      });

      const brand = await prisma.brand.upsert({
        where: { userId: user.id },
        update: {
          name: b.name,
          description: b.description,
          category: b.category,
          website: b.website,
          targetMarkets: b.targetMarkets,
          contactInformation: { email: b.email },
        },
        create: {
          id: b.id,
          userId: user.id,
          name: b.name,
          description: b.description,
          category: b.category,
          website: b.website,
          targetMarkets: b.targetMarkets,
          contactInformation: { email: b.email },
        },
      });

      for (const cmp of b.campaigns) {
        const campaign = await prisma.campaign.upsert({
          where: { id: cmp.id },
          update: {
            title: cmp.title,
            description: cmp.description,
            productOrService: cmp.productOrService,
            objective: cmp.objective,
            budgetMin: cmp.budgetMin,
            budgetMax: cmp.budgetMax,
            requiredReach: cmp.requiredReach,
            platform: cmp.platform,
            contentType: cmp.contentType,
            contentStyle: cmp.contentStyle,
            creatorNiche: cmp.creatorNiche,
            timeline: cmp.timeline,
            exclusivity: cmp.exclusivity,
            usageRights: cmp.usageRights,
            status: cmp.status,
          },
          create: {
            id: cmp.id,
            brandId: brand.id,
            title: cmp.title,
            description: cmp.description,
            productOrService: cmp.productOrService,
            objective: cmp.objective,
            budgetMin: cmp.budgetMin,
            budgetMax: cmp.budgetMax,
            requiredReach: cmp.requiredReach,
            platform: cmp.platform,
            contentType: cmp.contentType,
            contentStyle: cmp.contentStyle,
            creatorNiche: cmp.creatorNiche,
            timeline: cmp.timeline,
            exclusivity: cmp.exclusivity,
            usageRights: cmp.usageRights,
            status: cmp.status,
          },
        });

        // Add Campaign AI Profile
        await prisma.campaignAIProfile.upsert({
          where: { campaignId: campaign.id },
          update: {
            normalizedObjective: cmp.objective,
            inferredNiches: cmp.creatorNiche.split(',').map((s) => s.trim()),
            semanticSummary: `${cmp.title} targeting ${cmp.creatorNiche}`,
          },
          create: {
            campaignId: campaign.id,
            normalizedObjective: cmp.objective,
            inferredNiches: cmp.creatorNiche.split(',').map((s) => s.trim()),
            semanticSummary: `${cmp.title} targeting ${cmp.creatorNiche}`,
          },
        });

        console.log(`   ✓ Brand: ${b.name} -> Campaign: "${cmp.title}"`);
      }
    }

    console.log('\n==================================================');
    console.log('🎉 Demo Seeding Completed Successfully (Idempotent).');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('❌ Seeding Failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
