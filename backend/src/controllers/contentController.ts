import { Request, Response, NextFunction } from 'express';

const MOCK_IMPORTED_CONTENT = [
  {
    id: 'cnt_01',
    platform: 'YOUTUBE',
    contentType: 'VIDEO',
    title: 'Building Production AI Agents with Next.js 15 and pgvector',
    description: 'Deep dive into fullstack vector similarity search, cosine distance, and explainable AI pipelines.',
    permalink: 'https://youtube.com/watch?v=demo1',
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    views: 64200,
    likes: 3850,
    comments: 412,
    shares: 280,
    aiAnalysis: {
      topics: ['AI Agents', 'Vector Databases', 'Next.js 15', 'Fullstack Architecture'],
      niche: 'Software Development',
      style: 'Technical Deep Dive',
      commercialCategories: ['Developer Tools', 'Cloud Infrastructure', 'AI Services'],
      confidence: 0.94,
    },
  },
  {
    id: 'cnt_02',
    platform: 'YOUTUBE',
    contentType: 'VIDEO',
    title: 'Why We Migrated from Monolithic Architecture to Modular Workspaces',
    description: 'Performance benchmarks, developer ergonomics, TypeScript package sharing, and build speed analysis.',
    permalink: 'https://youtube.com/watch?v=demo2',
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    views: 89100,
    likes: 5200,
    comments: 610,
    shares: 490,
    aiAnalysis: {
      topics: ['Microservices', 'Monorepo', 'TypeScript', 'DevOps'],
      niche: 'Software Engineering',
      style: 'Comparative Analysis',
      commercialCategories: ['Dev Tools', 'Productivity Software'],
      confidence: 0.91,
    },
  },
  {
    id: 'cnt_03',
    platform: 'INSTAGRAM',
    contentType: 'REELS',
    title: '5 Clean Code Habits Every Senior Developer Follows 🚀',
    description: 'Short breakdown of early return patterns, explicit interfaces, and self-documenting code.',
    permalink: 'https://instagram.com/reel/demo3',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    views: 45600,
    likes: 4100,
    comments: 180,
    shares: 890,
    aiAnalysis: {
      topics: ['Code Quality', 'Career Growth', 'Clean Code'],
      niche: 'Programming',
      style: 'Short Form Educational',
      commercialCategories: ['Education', 'Developer Lifestyle'],
      confidence: 0.88,
    },
  },
  {
    id: 'cnt_04',
    platform: 'YOUTUBE',
    contentType: 'VIDEO',
    title: 'Top 5 Developer Cloud Tools You Should Be Using in 2026',
    description: 'Comprehensive review of modern developer stacks, latency tests, and pricing comparisons.',
    permalink: 'https://youtube.com/watch?v=demo4',
    publishedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    views: 112000,
    likes: 7400,
    comments: 890,
    shares: 720,
    aiAnalysis: {
      topics: ['Cloud Computing', 'Developer Productivity', 'SaaS'],
      niche: 'Developer Tools',
      style: 'Product Roundup',
      commercialCategories: ['Cloud Providers', 'SaaS Tools', 'Hardware'],
      confidence: 0.96,
    },
  },
];

export async function getCreatorContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const platform = typeof req.query.platform === 'string' ? req.query.platform.toUpperCase() : null;

    let filtered = MOCK_IMPORTED_CONTENT;
    if (platform) {
      filtered = filtered.filter((c) => c.platform === platform);
    }

    res.status(200).json({
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 20,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getContentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contentId = typeof req.params.contentId === 'string' ? req.params.contentId : '';
    const item = MOCK_IMPORTED_CONTENT.find((c) => c.id === contentId) || MOCK_IMPORTED_CONTENT[0];

    res.status(200).json({ data: item });
  } catch (err) {
    next(err);
  }
}
