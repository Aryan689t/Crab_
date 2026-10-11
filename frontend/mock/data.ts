export interface CreatorItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  primaryNiches: string[];
  location: string;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  subscribers: number;
  avgViews: number;
  engagementRate: number;
  postingFrequency: string;
  rateEstimate: number;
  matchScore: number;
  matchBreakdown: {
    semantic: number;
    audience: number;
    performance: number;
    platform: number;
    brandFit: number;
  };
  keyFitReasons: string[];
  warningNotes?: string[];
  isShortlisted?: boolean;
}

export interface CampaignItem {
  id: string;
  title: string;
  brandName: string;
  brandLogo: string;
  productOrService: string;
  category: string;
  objective: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  requiredReach: number;
  platforms: ('YOUTUBE' | 'INSTAGRAM')[];
  niches: string[];
  deliverables: string[];
  timeline: string;
  exclusivity: string;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'PAUSED';
  invitedCount: number;
  appliedCount: number;
  acceptedCount: number;
  totalSpent: number;
  createdAt: string;
  aiBriefSummary: string;
  matchScore?: number;
  deadline?: string;
}

export interface ApplicationItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  matchScore: number;
  proposedRate: number;
  deliverablesSummary: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'OFFER_RECEIVED' | 'ACCEPTED' | 'DECLINED';
  appliedAt: string;
  note?: string;
}

export const INITIAL_CREATORS: CreatorItem[] = [
  {
    id: 'creator_01',
    name: 'Alex Chen',
    handle: '@alextechlabs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Fullstack software engineer breaking down cloud architecture, Next.js, and generative AI tooling.',
    primaryNiches: ['Technology', 'Software Engineering', 'AI Tools'],
    location: 'Bengaluru, India',
    platform: 'YOUTUBE',
    subscribers: 142000,
    avgViews: 48200,
    engagementRate: 5.6,
    postingFrequency: '3.4 videos/week',
    rateEstimate: 35000,
    matchScore: 94,
    matchBreakdown: {
      semantic: 96,
      audience: 92,
      performance: 94,
      platform: 98,
      brandFit: 90,
    },
    keyFitReasons: [
      'High topical overlap with cloud & developer platforms',
      'Audience includes 68% professional developers and technical leads',
      'Consistent 48k+ average video views with 5.6% engagement',
    ],
    warningNotes: ['Prefers deep-dive technical integrations over standard 30s shoutouts'],
    isShortlisted: true,
  },
  {
    id: 'creator_02',
    name: 'Priya Sharma',
    handle: '@priyacodes',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    bio: 'Frontend architect and UI designer specializing in Tailwind, React, and modern web UX.',
    primaryNiches: ['Web Design', 'Frontend Development', 'SaaS Tools'],
    location: 'Mumbai, India',
    platform: 'YOUTUBE',
    subscribers: 88500,
    avgViews: 32400,
    engagementRate: 6.2,
    postingFrequency: '2 videos/week',
    rateEstimate: 22000,
    matchScore: 89,
    matchBreakdown: {
      semantic: 91,
      audience: 88,
      performance: 92,
      platform: 95,
      brandFit: 84,
    },
    keyFitReasons: [
      'Top-tier engagement (6.2%) in UI/UX and web development',
      'Strong audience concentration in early-stage tech builders',
    ],
    isShortlisted: false,
  },
  {
    id: 'creator_03',
    name: 'Rohan Varma',
    handle: '@rohandevops',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Kubernetes, AWS cloud cost optimization, and infrastructure as code.',
    primaryNiches: ['DevOps', 'Cloud Infrastructure', 'Cybersecurity'],
    location: 'Hyderabad, India',
    platform: 'YOUTUBE',
    subscribers: 210000,
    avgViews: 62000,
    engagementRate: 4.8,
    postingFrequency: '4 videos/week',
    rateEstimate: 45000,
    matchScore: 86,
    matchBreakdown: {
      semantic: 88,
      audience: 84,
      performance: 89,
      platform: 92,
      brandFit: 82,
    },
    keyFitReasons: [
      'Deep enterprise and cloud architect audience',
      'High historical view retention on hands-on benchmarks',
    ],
    isShortlisted: false,
  },
  {
    id: 'creator_04',
    name: 'Sarah Miller',
    handle: '@sarah.builds',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Indie hacking, micro-SaaS case studies, and bootstrapping tech startups.',
    primaryNiches: ['Indie Hacking', 'Productivity & SaaS', 'AI Tools'],
    location: 'London, UK',
    platform: 'INSTAGRAM',
    subscribers: 64000,
    avgViews: 28500,
    engagementRate: 7.1,
    postingFrequency: '5 reels/week',
    rateEstimate: 18000,
    matchScore: 82,
    matchBreakdown: {
      semantic: 84,
      audience: 82,
      performance: 88,
      platform: 80,
      brandFit: 86,
    },
    keyFitReasons: [
      'Extremely high viral Reel engagement (7.1%)',
      'Passionate founder and builder audience base',
    ],
    isShortlisted: false,
  },
];

export const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'cmp_aws_01',
    title: 'AWS Developer Cloud Acceleration Sprint',
    brandName: 'Amazon Web Services',
    brandLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100',
    productOrService: 'AWS App Runner & Bedrock AI SDKs',
    category: 'TECHNOLOGY',
    objective: 'Drive developer adoption and hands-on tutorials for serverless AI deployments.',
    budgetMin: 30000,
    budgetMax: 75000,
    currency: 'INR',
    requiredReach: 40000,
    platforms: ['YOUTUBE'],
    niches: ['Technology', 'Software Engineering', 'AI Tools', 'DevOps'],
    deliverables: ['1 Dedicated YouTube Video (8-12 mins)', 'Pinned comment with sign-up link', 'GitHub repository template'],
    timeline: 'Nov 1 - Nov 20, 2026',
    exclusivity: '30 days cloud provider category exclusivity',
    status: 'ACTIVE',
    invitedCount: 8,
    appliedCount: 14,
    acceptedCount: 3,
    totalSpent: 95000,
    createdAt: '2026-10-01T10:00:00Z',
    aiBriefSummary: 'Targeting technical creators with strong developer following for live coding tutorials demonstrating serverless container deployments.',
  },
  {
    id: 'cmp_veloce_02',
    title: 'Veloce AI Fullstack IDE Launch',
    brandName: 'Veloce AI',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
    productOrService: 'Veloce Autonomous Code Editor',
    category: 'TECHNOLOGY',
    objective: 'Generate developer buzz, workflow demos, and beta registrations.',
    budgetMin: 20000,
    budgetMax: 45000,
    currency: 'INR',
    requiredReach: 25000,
    platforms: ['YOUTUBE', 'INSTAGRAM'],
    niches: ['Software Development', 'Productivity & SaaS', 'Web Design'],
    deliverables: ['1 YouTube Integration (90s mid-roll) OR 2 Instagram Reels', 'Discord community link'],
    timeline: 'Nov 10 - Dec 05, 2026',
    exclusivity: 'No exclusivity required',
    status: 'ACTIVE',
    invitedCount: 5,
    appliedCount: 9,
    acceptedCount: 2,
    totalSpent: 44000,
    createdAt: '2026-10-04T12:00:00Z',
    aiBriefSummary: 'Seeks energetic tech YouTubers and Instagram developers showcasing speed improvements in daily coding workflows.',
  },
  {
    id: 'cmp_supadb_03',
    title: 'Supabase Vector Database Benchmark Series',
    brandName: 'Supabase Ecosystem',
    brandLogo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100',
    productOrService: 'PostgreSQL pgvector & Embeddings API',
    category: 'TECHNOLOGY',
    objective: 'Showcase real-time semantic search performance and architectural simplicity.',
    budgetMin: 40000,
    budgetMax: 80000,
    currency: 'INR',
    requiredReach: 50000,
    platforms: ['YOUTUBE'],
    niches: ['Technology', 'AI Tools', 'Software Engineering'],
    deliverables: ['1 Full Dedicated Technical Breakdown', 'Open-source starter kit'],
    timeline: 'Nov 15 - Dec 15, 2026',
    exclusivity: '14 days database exclusivity',
    status: 'ACTIVE',
    invitedCount: 3,
    appliedCount: 6,
    acceptedCount: 1,
    totalSpent: 38000,
    createdAt: '2026-10-06T15:30:00Z',
    aiBriefSummary: 'Technical deep-dive campaign for senior engineers demonstrating pgvector scalability vs dedicated vector stores.',
    matchScore: 92,
    deadline: 'Closes in 12 days'
  },
  {
    id: 'cmp_vercel_04',
    title: 'Next.js 15 App Router Migration Guide',
    brandName: 'Vercel',
    brandLogo: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=100',
    productOrService: 'Vercel Deployment Platform',
    category: 'TECHNOLOGY',
    objective: 'Create a comprehensive video guide on migrating a React SPA to Next.js 15 App Router.',
    budgetMin: 35000,
    budgetMax: 60000,
    currency: 'INR',
    requiredReach: 30000,
    platforms: ['YOUTUBE'],
    niches: ['Web Development', 'Frontend', 'React'],
    deliverables: ['1 YouTube Tutorial (15 mins)', 'GitHub Repo'],
    timeline: 'Nov 20 - Dec 10, 2026',
    exclusivity: 'No exclusivity',
    status: 'ACTIVE',
    invitedCount: 10,
    appliedCount: 20,
    acceptedCount: 5,
    totalSpent: 120000,
    createdAt: '2026-10-07T10:00:00Z',
    aiBriefSummary: 'Looking for frontend educators to demonstrate seamless Vercel deployments.',
    matchScore: 88,
    deadline: 'Closes in 3 days'
  },
  {
    id: 'cmp_gymshark_05',
    title: 'Winter Seamless Collection Launch',
    brandName: 'Gymshark',
    brandLogo: 'https://images.unsplash.com/photo-1571731956672-f2b94e7dd271?w=100',
    productOrService: 'Winter Activewear',
    category: 'FITNESS',
    objective: 'Showcase the new winter seamless collection in high-energy workout routines.',
    budgetMin: 15000,
    budgetMax: 40000,
    currency: 'INR',
    requiredReach: 50000,
    platforms: ['INSTAGRAM'],
    niches: ['Fitness', 'Lifestyle', 'Fashion'],
    deliverables: ['2 Instagram Reels', '3 Story sets with swipe-up'],
    timeline: 'Nov 25 - Dec 20, 2026',
    exclusivity: '30 days activewear exclusivity',
    status: 'ACTIVE',
    invitedCount: 15,
    appliedCount: 45,
    acceptedCount: 8,
    totalSpent: 85000,
    createdAt: '2026-10-08T09:00:00Z',
    aiBriefSummary: 'Targeting fitness influencers for an energetic apparel launch.',
    matchScore: 45,
    deadline: 'Closes in 8 days'
  },
  {
    id: 'cmp_notion_06',
    title: 'Notion AI Productivity Systems',
    brandName: 'Notion',
    brandLogo: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100',
    productOrService: 'Notion AI workspaces',
    category: 'PRODUCTIVITY',
    objective: 'Demonstrate how Notion AI accelerates daily workflows and project management.',
    budgetMin: 25000,
    budgetMax: 50000,
    currency: 'INR',
    requiredReach: 20000,
    platforms: ['YOUTUBE', 'INSTAGRAM'],
    niches: ['Productivity', 'SaaS Tools', 'Entrepreneurship'],
    deliverables: ['1 YouTube Integration (2 mins)', 'Notion Template Link'],
    timeline: 'Dec 01 - Dec 25, 2026',
    exclusivity: 'No exclusivity',
    status: 'ACTIVE',
    invitedCount: 12,
    appliedCount: 18,
    acceptedCount: 4,
    totalSpent: 65000,
    createdAt: '2026-10-08T11:30:00Z',
    aiBriefSummary: 'Seeking productivity experts to share custom Notion AI templates.',
    matchScore: 82,
    deadline: 'Closes in 15 days'
  },
  {
    id: 'cmp_framer_07',
    title: 'Framer Sites: From Figma to Live in 10 Mins',
    brandName: 'Framer',
    brandLogo: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=100',
    productOrService: 'Framer Web Builder',
    category: 'DESIGN',
    objective: 'Highlight the speed of publishing beautiful sites directly from design tools.',
    budgetMin: 45000,
    budgetMax: 90000,
    currency: 'INR',
    requiredReach: 40000,
    platforms: ['YOUTUBE'],
    niches: ['Web Design', 'UI/UX', 'Frontend'],
    deliverables: ['1 Dedicated Video', 'Affiliate Link'],
    timeline: 'Nov 15 - Nov 30, 2026',
    exclusivity: '14 days web builder exclusivity',
    status: 'ACTIVE',
    invitedCount: 6,
    appliedCount: 22,
    acceptedCount: 2,
    totalSpent: 90000,
    createdAt: '2026-10-09T08:00:00Z',
    aiBriefSummary: 'For top-tier UI/UX designers showcasing no-code web publishing.',
    matchScore: 85,
    deadline: 'Closes in 2 days'
  },
  {
    id: 'cmp_sony_08',
    title: 'Sony Alpha 7CR Creator Campaign',
    brandName: 'Sony',
    brandLogo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=100',
    productOrService: 'Sony Alpha 7CR Compact Full-Frame Camera',
    category: 'PHOTOGRAPHY',
    objective: 'Showcase travel and street photography capabilities of the new compact Alpha.',
    budgetMin: 80000,
    budgetMax: 150000,
    currency: 'INR',
    requiredReach: 100000,
    platforms: ['INSTAGRAM', 'YOUTUBE'],
    niches: ['Photography', 'Travel', 'Cinematography'],
    deliverables: ['3 Instagram Reels', '1 YouTube Video'],
    timeline: 'Dec 10 - Jan 15, 2027',
    exclusivity: '60 days camera exclusivity',
    status: 'ACTIVE',
    invitedCount: 4,
    appliedCount: 30,
    acceptedCount: 1,
    totalSpent: 100000,
    createdAt: '2026-10-09T14:00:00Z',
    aiBriefSummary: 'High-end campaign for professional photographers and cinematographers.',
    matchScore: 60,
    deadline: 'Closes in 20 days'
  },
  {
    id: 'cmp_hellofresh_09',
    title: 'Healthy Holiday Meals in 30 Minutes',
    brandName: 'HelloFresh',
    brandLogo: 'https://images.unsplash.com/photo-1606859191214-25806e8e2423?w=100',
    productOrService: 'HelloFresh Meal Kits',
    category: 'LIFESTYLE',
    objective: 'Promote healthy, fast home cooking during the busy holiday season.',
    budgetMin: 12000,
    budgetMax: 25000,
    currency: 'INR',
    requiredReach: 15000,
    platforms: ['INSTAGRAM'],
    niches: ['Lifestyle', 'Food', 'Parenting'],
    deliverables: ['1 Instagram Reel', 'Discount code link in bio'],
    timeline: 'Dec 01 - Dec 31, 2026',
    exclusivity: 'No exclusivity',
    status: 'ACTIVE',
    invitedCount: 20,
    appliedCount: 50,
    acceptedCount: 12,
    totalSpent: 60000,
    createdAt: '2026-10-09T16:00:00Z',
    aiBriefSummary: 'Seeking relatable lifestyle creators to demonstrate easy meal prep.',
    matchScore: 35,
    deadline: 'Closes in 10 days'
  }
];

export const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app_01',
    campaignId: 'cmp_aws_01',
    campaignTitle: 'AWS Developer Cloud Acceleration Sprint',
    brandName: 'Amazon Web Services',
    creatorId: 'creator_01',
    creatorName: 'Alex Chen',
    creatorHandle: '@alextechlabs',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    platform: 'YOUTUBE',
    matchScore: 94,
    proposedRate: 35000,
    deliverablesSummary: '1 Dedicated Video (10m) + GitHub Sample Code',
    status: 'OFFER_RECEIVED',
    appliedAt: '2026-10-05T09:20:00Z',
    note: 'I regularly build AI agent demos and my audience frequently asks for cloud deployment architecture guides.',
  },
  {
    id: 'app_02',
    campaignId: 'cmp_veloce_02',
    campaignTitle: 'Veloce AI Fullstack IDE Launch',
    brandName: 'Veloce AI',
    creatorId: 'creator_02',
    creatorName: 'Priya Sharma',
    creatorHandle: '@priyacodes',
    creatorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    platform: 'YOUTUBE',
    matchScore: 89,
    proposedRate: 22000,
    deliverablesSummary: '2 Dedicated YouTube shorts + community post',
    status: 'ACCEPTED',
    appliedAt: '2026-10-06T14:15:00Z',
  },
  {
    id: 'app_03',
    campaignId: 'cmp_supadb_03',
    campaignTitle: 'Supabase Vector Database Benchmark Series',
    brandName: 'Supabase Ecosystem',
    creatorId: 'creator_01',
    creatorName: 'Alex Chen',
    creatorHandle: '@alextechlabs',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    platform: 'YOUTUBE',
    matchScore: 96,
    proposedRate: 40000,
    deliverablesSummary: '1 Full Dedicated Technical Breakdown',
    status: 'SUBMITTED',
    appliedAt: '2026-10-07T11:00:00Z',
    note: 'Excited to show pgvector indexing and cosine similarity performance in Next.js 15.',
  },
];
