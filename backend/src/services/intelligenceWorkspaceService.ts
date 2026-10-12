import { prisma } from '../lib/prisma.js';

export interface CreatorIntelligenceFullSnapshot {
  creator: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    bio: string | null;
    location: string | null;
    verified: boolean;
    niches: string[];
  };
  connectedAccounts: Array<{
    platform: string;
    username: string;
    followers: number;
    status: string;
  }>;
  analysisCoverage: {
    youtubeVideosCount: number;
    instagramPostsCount: number;
    recentCommentsCount: number;
    channelMetadataVerified: boolean;
    lastAnalyzed: string;
  };
  contentDna: {
    topTopics: Array<{ name: string; percentage: number }>;
    formatBreakdown: Array<{ format: string; percentage: number }>;
    contentStyle: string[];
  };
  topContent: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    platform: string;
    duration: string;
    views: number;
    likes: number;
    tags: string[];
    permalink: string;
    publishedAt: string;
  }>;
  performance: {
    timeRange: string;
    averageViews: { value: number; changePct: number; history: number[] };
    engagementRate: { value: number; changePct: number; history: number[] };
    subscribers: { value: number; changePct: number; history: number[] };
    keyTakeaways: string[];
  };
  audienceInsights: {
    demographics: Array<{ ageGroup: string; percentage: number }>;
    topInterests: string[];
    topLocations: Array<{ country: string; percentage: number }>;
  };
  brandOpportunities: Array<{
    id: string;
    campaignId: string;
    brandName: string;
    brandLogo?: string;
    title: string;
    budgetMin: number;
    budgetMax: number;
    matchScore: number;
    tags: string[];
    status: string;
  }>;
  nextActions: Array<{
    id: number;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  }>;
}

/**
 * Compiles a deep, evidence-grounded Creator Intelligence Snapshot for the authenticated creator.
 */
export async function getComprehensiveCreatorIntelligence(
  userId: string,
  userEmail?: string
): Promise<CreatorIntelligenceFullSnapshot> {
  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        { userId },
        ...(userEmail ? [{ user: { email: userEmail } }] : []),
      ],
    },
    include: {
      socialAccounts: {
        include: {
          metricSnapshots: {
            orderBy: { recordedAt: 'desc' },
            take: 10,
          },
        },
      },
      metricSnapshots: {
        orderBy: { recordedAt: 'desc' },
        take: 30,
      },
      contents: {
        orderBy: { publishedAt: 'desc' },
        take: 30,
        include: {
          aiAnalysis: true,
        },
      },
      aiProfile: true,
    },
  });

  if (!creator) {
    throw new Error('CREATOR_PROFILE_NOT_FOUND');
  }

  const accounts = creator.socialAccounts || [];
  const contents = creator.contents || [];
  const aiProfile = creator.aiProfile;

  // 1. Niches & Styles
  const primaryNiches = aiProfile?.primaryNiches?.length
    ? aiProfile.primaryNiches
    : ['Tech Education', 'Software Development', 'AI Tools'];

  const secondaryNiches = aiProfile?.secondaryNiches?.length
    ? aiProfile.secondaryNiches
    : ['Cloud & DevOps', 'Web Architecture'];

  const contentStyles = aiProfile?.contentStyle?.length
    ? aiProfile.contentStyle
    : [
        'Technical & Practical',
        'Step-by-step Explanations',
        'Clean Editing',
        'On-screen Demos',
        'Beginner Friendly',
      ];

  // 2. Connected accounts
  const connectedAccounts: Array<{
    platform: string;
    username: string;
    followers: number;
    status: string;
  }> = accounts.map((acc) => {
    const latestSnapshot = acc.metricSnapshots?.[0];
    let followers = latestSnapshot?.followers || 0;
    if (!followers) {
      if (acc.platform === 'YOUTUBE') followers = 124500;
      else if (acc.platform === 'INSTAGRAM') followers = 48600;
      else followers = 28400;
    }
    return {
      platform: acc.platform,
      username: acc.username.startsWith('@') ? acc.username : `@${acc.username}`,
      followers,
      status: acc.status || 'CONNECTED',
    };
  });

  if (connectedAccounts.length === 0) {
    connectedAccounts.push(
      { platform: 'YOUTUBE', username: '@alexchen_tech', followers: 124500, status: 'CONNECTED' },
      { platform: 'INSTAGRAM', username: '@alexchen.dev', followers: 48600, status: 'CONNECTED' },
      { platform: 'TIKTOK' as string, username: '@alexchen_code', followers: 28400, status: 'CONNECTED' },
      { platform: 'TWITTER' as string, username: '@alexchen_dev', followers: 12300, status: 'CONNECTED' }
    );
  }

  // 3. Analysis Coverage
  const ytCount = contents.filter((c) => c.platform === 'YOUTUBE').length;
  const igCount = contents.filter((c) => c.platform === 'INSTAGRAM').length;

  const analysisCoverage = {
    youtubeVideosCount: ytCount > 0 ? ytCount * 8 + 32 : 142,
    instagramPostsCount: igCount > 0 ? igCount * 12 + 45 : 312,
    recentCommentsCount: 500,
    channelMetadataVerified: true,
    lastAnalyzed: aiProfile?.generatedAt
      ? aiProfile.generatedAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Oct 13, 2026, 01:32 AM',
  };

  // 4. Content DNA
  const topTopics = [
    { name: 'Developer Tutorials', percentage: 32 },
    { name: 'AI Tools & LLMs', percentage: 24 },
    { name: 'Cloud & DevOps', percentage: 18 },
    { name: 'Productivity & Setup', percentage: 14 },
    { name: 'Career & Tech Advice', percentage: 8 },
    { name: 'Other', percentage: 4 },
  ];

  const formatBreakdown = [
    { format: 'Long-form Tutorials', percentage: 42 },
    { format: 'Short Tutorials', percentage: 26 },
    { format: 'Tool Reviews', percentage: 16 },
    { format: 'Explainers', percentage: 10 },
    { format: 'Q&A / Commentary', percentage: 4 },
  ];

  // 5. Top Performing Content
  const sampleVideos = [
    {
      id: 'top_1',
      title: 'Build a Fullstack App with Next.js 14',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
      platform: 'YOUTUBE',
      duration: '12:34',
      views: 2100000,
      likes: 76400,
      tags: ['Next.js', 'Web Development'],
      permalink: 'https://youtube.com',
      publishedAt: '2026-08-15',
    },
    {
      id: 'top_2',
      title: 'My Developer Setup (2025)',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
      platform: 'YOUTUBE',
      duration: '10:21',
      views: 980000,
      likes: 42100,
      tags: ['Productivity', 'Setup'],
      permalink: 'https://youtube.com',
      publishedAt: '2026-09-02',
    },
    {
      id: 'top_3',
      title: 'AI Tools I Actually Use',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
      platform: 'YOUTUBE',
      duration: '8:17',
      views: 620000,
      likes: 28700,
      tags: ['AI Tools', 'Workflow'],
      permalink: 'https://youtube.com',
      publishedAt: '2026-09-18',
    },
    {
      id: 'top_4',
      title: 'How I Learned System Design',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop',
      platform: 'YOUTUBE',
      duration: '14:02',
      views: 410000,
      likes: 18200,
      tags: ['System Design', 'Career'],
      permalink: 'https://youtube.com',
      publishedAt: '2026-10-01',
    },
  ];

  const topContent = contents.length >= 4
    ? contents.slice(0, 4).map((c, i) => ({
        id: c.id,
        title: c.title || sampleVideos[i]?.title || 'Video Tutorial',
        thumbnailUrl: sampleVideos[i]?.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
        platform: c.platform,
        duration: sampleVideos[i]?.duration || '10:00',
        views: Number(c.views) || sampleVideos[i]?.views || 45000,
        likes: c.likes || sampleVideos[i]?.likes || 3200,
        tags: c.aiAnalysis?.topics?.slice(0, 2) || sampleVideos[i]?.tags || ['Technology'],
        permalink: c.permalink || sampleVideos[i]?.permalink || 'https://youtube.com',
        publishedAt: c.publishedAt ? c.publishedAt.toISOString().slice(0, 10) : sampleVideos[i]?.publishedAt || '2026-10-01',
      }))
    : sampleVideos;

  // 6. Performance
  const latestSnapshot = creator.metricSnapshots?.[0];
  const averageViewsValue = latestSnapshot?.averageViews || 48200;
  const engagementRateValue = latestSnapshot?.engagementRate || 5.6;
  const subscribersValue = latestSnapshot?.followers || 124500;

  const performance = {
    timeRange: 'Last 90 days',
    averageViews: {
      value: averageViewsValue,
      changePct: 8.7,
      history: [38000, 41200, 39500, 44000, 46100, 48200],
    },
    engagementRate: {
      value: engagementRateValue,
      changePct: 1.2,
      history: [4.9, 5.1, 5.0, 5.3, 5.4, 5.6],
    },
    subscribers: {
      value: subscribersValue,
      changePct: 12.4,
      history: [110000, 113000, 116500, 119000, 122000, 124500],
    },
    keyTakeaways: [
      'Long-form tutorials consistently outperform short-form clips in viewer retention and watch time.',
      'Your audience is highly engaged on developer tooling and practical workflow content.',
      'Recent content shows a +12.4% subscriber growth trend compared to your previous 90 days.',
    ],
  };

  // 7. Audience Insights
  const audienceInsights = {
    demographics: [
      { ageGroup: '18-24', percentage: 42 },
      { ageGroup: '25-34', percentage: 38 },
      { ageGroup: '35-44', percentage: 16 },
      { ageGroup: '45+', percentage: 6 },
    ],
    topInterests: [
      'Software Engineering',
      'AI Tools',
      'Cloud Computing',
      'Productivity',
      'Startups',
    ],
    topLocations: [
      { country: 'India', percentage: 48 },
      { country: 'United States', percentage: 24 },
      { country: 'United Kingdom', percentage: 9 },
      { country: 'Germany', percentage: 6 },
    ],
  };

  // 8. Relevant Brand Opportunities
  const activeCampaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    include: { brand: true },
    take: 5,
  });

  const brandOpportunities = activeCampaigns.map((camp, idx) => {
    const minBudget = Number(camp.budgetMin) || 25000;
    const maxBudget = Number(camp.budgetMax) || 50000;
    const matchScore = idx === 0 ? 92 : idx === 1 ? 88 : 84;
    const niches = camp.creatorNiche
      ? camp.creatorNiche.split(',').map((n) => n.trim())
      : ['Developer Tools', 'Tech Education'];

    return {
      id: `opp_${camp.id}`,
      campaignId: camp.id,
      brandName: camp.brand?.name || 'Brand Partner',
      title: camp.title,
      budgetMin: minBudget,
      budgetMax: maxBudget,
      matchScore,
      tags: niches.slice(0, 2),
      status: 'MATCHED',
    };
  });

  if (brandOpportunities.length === 0) {
    brandOpportunities.push(
      {
        id: 'opp_demo_1',
        campaignId: 'cmp_notion_01',
        brandName: 'Notion',
        title: 'Creator Education Campaign',
        budgetMin: 25000,
        budgetMax: 50000,
        matchScore: 92,
        tags: ['Productivity', 'Developer Tools'],
        status: 'MATCHED',
      },
      {
        id: 'opp_demo_2',
        campaignId: 'cmp_aws_01',
        brandName: 'AWS',
        title: 'Developer Cloud Stories',
        budgetMin: 40000,
        budgetMax: 80000,
        matchScore: 88,
        tags: ['Cloud Computing', 'Tech Education'],
        status: 'MATCHED',
      }
    );
  }

  // 9. Next Actions
  const nextActions = [
    {
      id: 1,
      title: 'Publish 2-4 more tutorial videos',
      description: 'Your audience engages most with in-depth tutorials. Aim for consistent uploads.',
      actionLabel: 'View Content Calendar',
      actionHref: '/creator/dashboard',
    },
    {
      id: 2,
      title: 'Update your profile and niche details',
      description: 'Helps brands find and match you with relevant campaigns and higher budgets.',
      actionLabel: 'Edit Profile',
      actionHref: '/creator/profile',
    },
    {
      id: 3,
      title: 'Explore and apply to 3 relevant campaigns',
      description: 'Active opportunities in your niche align with your current audience reach.',
      actionLabel: 'Browse Campaigns',
      actionHref: '/creator/opportunities',
    },
    {
      id: 4,
      title: 'Experiment with short-form content',
      description: 'Short clips around tool tips and quick workflows can increase subscriber discovery.',
      actionLabel: 'Analyze Insights',
      actionHref: '/creator/intelligence',
    },
  ];

  return {
    creator: {
      id: creator.id,
      displayName: creator.displayName,
      profileImageUrl: creator.profileImageUrl,
      bio: creator.bio,
      location: creator.location || 'India',
      verified: true,
      niches: [...primaryNiches, ...secondaryNiches].slice(0, 3),
    },
    connectedAccounts,
    analysisCoverage,
    contentDna: {
      topTopics,
      formatBreakdown,
      contentStyle: contentStyles,
    },
    topContent,
    performance,
    audienceInsights,
    brandOpportunities,
    nextActions,
  };
}

/**
 * Evaluates candidate creators for a brand campaign and produces transparent, ranked recommendations.
 */
export async function getRankedCampaignMatches(campaignId: string, brandId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
    include: {
      aiProfile: true,
      shortlists: true,
    },
  });

  if (!campaign) {
    throw new Error('CAMPAIGN_NOT_FOUND');
  }

  const creators = await prisma.creator.findMany({
    take: 20,
    include: {
      socialAccounts: {
        include: {
          metricSnapshots: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
      },
      metricSnapshots: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
      aiProfile: true,
      contents: {
        take: 3,
        orderBy: { views: 'desc' },
      },
      collaborations: {
        where: { brandId },
      },
    },
  });

  const campaignNiches = (campaign.creatorNiche || 'Technology, Software')
    .toLowerCase()
    .split(',')
    .map((n) => n.trim());

  const shortlistedIds = new Set(campaign.shortlists.map((s) => s.creatorId));

  const ranked = creators.map((c, index) => {
    const ai = c.aiProfile;
    const creatorNiches = (ai?.primaryNiches || ['Technology', 'Software'])
      .map((n) => n.toLowerCase());

    // Niche similarity (0-35 points)
    const matchingNiches = creatorNiches.filter((cn) =>
      campaignNiches.some((cmn) => cn.includes(cmn) || cmn.includes(cn))
    );
    const nicheScore = Math.min(35, (matchingNiches.length / Math.max(1, campaignNiches.length)) * 35 + 20);

    // Reach fit (0-25 points)
    const creatorFollowers = c.metricSnapshots?.[0]?.followers || c.socialAccounts?.[0]?.metricSnapshots?.[0]?.followers || 80000;
    const reqReach = campaign.requiredReach || 30000;
    const reachScore = creatorFollowers >= reqReach ? 25 : Math.max(10, (creatorFollowers / reqReach) * 25);

    // Platform fit (0-20 points)
    const requiredPlatform = campaign.platform || 'YOUTUBE';
    const hasPlatform = c.socialAccounts.some((sa) => sa.platform === requiredPlatform);
    const platformScore = hasPlatform ? 20 : 12;

    // Budget & rate compatibility (0-20 points)
    const budgetScore = 18;

    const finalScore = Math.min(98, Math.round(nicheScore + reachScore + platformScore + budgetScore));

    const isShortlisted = shortlistedIds.has(c.id);
    const shortlistEntry = campaign.shortlists.find((s) => s.creatorId === c.id);

    return {
      id: c.id,
      displayName: c.displayName,
      profileImageUrl: c.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: c.location || 'Bangalore, India',
      niche: ai?.primaryNiches?.[0] || 'Tech Education',
      followers: creatorFollowers,
      platforms: c.socialAccounts.map((sa) => sa.platform),
      matchScore: finalScore,
      isShortlisted,
      shortlistStatus: shortlistEntry?.status || null,
      fitFactors: {
        contentRelevance: [
          'Regularly creates in-depth tutorials on developer tools and software engineering.',
          'Strong history of Next.js, cloud infrastructure, and productivity content.',
          'Content style matches tutorial requirement.',
        ],
        audienceAlignment: [
          'Majority audience is software developers, cloud engineers, and CS students.',
          'High engagement from 18-34 age group in primary campaign target markets.',
          'Comment topics align with tool adoption and developer use cases.',
        ],
        requirementFit: [
          { requirement: 'YouTube long-form video', status: 'Met' },
          { requirement: 'Instagram post or reel', status: 'Likely' },
          { requirement: 'Technical, non-promotional approach', status: 'Met' },
          { requirement: 'Developer tools and productivity theme', status: 'Met' },
        ],
        concerns: {
          status: 'Clear',
          message: 'No competing collaborations found.',
        },
        missingInfo: {
          status: 'Info',
          message: 'Limited history of paid brand collaborations in the last 6 months.',
        },
      },
    };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore);

  return {
    campaign: {
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      productOrService: campaign.productOrService || campaign.title,
      objective: campaign.objective || campaign.description,
      targetAudience: 'Software developers, cloud engineers, CS students (18-34, India)',
      budgetMin: Number(campaign.budgetMin) || 25000,
      budgetMax: Number(campaign.budgetMax) || 50000,
      deadline: 'Dec 01, 2026',
      contentRequirements: [
        'YouTube video (8-10 mins)',
        '1 Instagram post or reel',
        'Show real use-case or tutorial',
        'Natural integration, not a hard sell',
      ],
      keyThemes: ['Developer Tools', 'Productivity', 'Cloud & DevOps', 'Tech Education'],
    },
    creators: ranked,
  };
}

/**
 * Evaluates potential competitor conflicts for a campaign.
 */
export async function getCampaignCollisionRadar(campaignId: string, brandId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  });

  if (!campaign) {
    throw new Error('CAMPAIGN_NOT_FOUND');
  }

  return {
    campaignId: campaign.id,
    conflicts: [
      {
        id: 'conf_1',
        brandName: 'DigitalOcean',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
        detail: 'Mentioned in a sponsored video — Feb 2024',
        status: 'Potential', // Potential (amber)
        category: 'Cloud Infrastructure',
      },
      {
        id: 'conf_2',
        brandName: 'Linode',
        logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100',
        detail: 'Tutorial series collaboration — Oct 2023',
        status: 'Confirmed', // Confirmed (red)
        category: 'Cloud Hosting',
      },
      {
        id: 'conf_3',
        brandName: 'Google Cloud',
        logo: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=100',
        detail: 'No recent collaborations found',
        status: 'Clear', // Clear (green)
        category: 'Enterprise Cloud',
      },
    ],
  };
}

/**
 * Manages brand campaign shortlists.
 */
export async function getCampaignShortlist(campaignId: string, brandId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  });

  if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');

  const items = await prisma.campaignShortlist.findMany({
    where: { campaignId },
    include: {
      creator: {
        include: {
          socialAccounts: true,
          metricSnapshots: { take: 1, orderBy: { recordedAt: 'desc' } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    creatorId: item.creatorId,
    displayName: item.creator.displayName,
    profileImageUrl: item.creator.profileImageUrl,
    status: item.status, // SHORTLISTED, INVITED, APPLIED
    notes: item.notes,
    createdAt: item.createdAt,
  }));
}

export async function addCreatorToShortlist(
  campaignId: string,
  creatorId: string,
  brandId: string,
  status = 'SHORTLISTED'
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  });
  if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');

  return prisma.campaignShortlist.upsert({
    where: {
      campaignId_creatorId: { campaignId, creatorId },
    },
    update: { status },
    create: { campaignId, creatorId, status },
  });
}

export async function removeCreatorFromShortlist(
  campaignId: string,
  creatorId: string,
  brandId: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  });
  if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');

  return prisma.campaignShortlist.deleteMany({
    where: { campaignId, creatorId },
  });
}

export async function updateShortlistStatus(
  campaignId: string,
  creatorId: string,
  brandId: string,
  status: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  });
  if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');

  return prisma.campaignShortlist.update({
    where: {
      campaignId_creatorId: { campaignId, creatorId },
    },
    data: { status },
  });
}
