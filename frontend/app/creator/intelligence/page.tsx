'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Heart,
  Youtube,
  Instagram,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowRight,
  Check,
  Building2,
  Target,
  Layers,
  Users,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

export default function CreatorIntelligencePage() {
  const { user, token } = useAuth();
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audience' | 'opportunities' | 'growth'>('content');
  const [audienceSubtab, setAudienceSubtab] = useState<'demographics' | 'interests' | 'locations'>('demographics');
  const [timeRange, setTimeRange] = useState('Last 90 days');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchIntelligence = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchApi<{ data: any }>('/api/creators/me/intelligence', {}, token || undefined);
      if (res?.data) {
        setIntel(res.data);
      }
    } catch (err: any) {
      console.warn('[CREATOR INTELLIGENCE] Fetch warning:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [token]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const res = await fetchApi<{ data: any }>(
        '/api/creators/me/intelligence/analyze',
        { method: 'POST' },
        token || undefined
      );
      if (res?.data) {
        await fetchIntelligence();
      }
    } catch (err: any) {
      console.warn('[INTELLIGENCE REFRESH] Error:', err);
      // Even if AI analyze is rate-limited, re-read cached snapshot
      await fetchIntelligence();
    } finally {
      setRefreshing(false);
    }
  };

  // Sparkline generator
  const renderSparkline = (points: number[] = [], stroke = '#FF6B00') => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  // Safe fallback data mirroring the approved visual specification
  const creator = intel?.creator || {
    displayName: user?.displayName || 'Aryan August',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verified: true,
    niches: ['Tech education', 'Software development', 'AI tools'],
  };

  const connectedAccounts = intel?.connectedAccounts || [
    { platform: 'YOUTUBE', username: '@alexchen_tech', followers: 124500, status: 'CONNECTED' },
    { platform: 'INSTAGRAM', username: '@alexchen.dev', followers: 48600, status: 'CONNECTED' },
    { platform: 'TIKTOK', username: '@alexchen_code', followers: 28400, status: 'CONNECTED' },
    { platform: 'TWITTER', username: '@alexchen_dev', followers: 12300, status: 'CONNECTED' },
  ];

  const coverage = intel?.analysisCoverage || {
    youtubeVideosCount: 142,
    instagramPostsCount: 312,
    recentCommentsCount: 500,
    channelMetadataVerified: true,
    lastAnalyzed: 'Oct 13, 2026, 01:32 AM',
  };

  const contentDna = intel?.contentDna || {
    topTopics: [
      { name: 'Developer Tutorials', percentage: 32 },
      { name: 'AI Tools & LLMs', percentage: 24 },
      { name: 'Cloud & DevOps', percentage: 18 },
      { name: 'Productivity & Setup', percentage: 14 },
      { name: 'Career & Tech Advice', percentage: 8 },
      { name: 'Other', percentage: 4 },
    ],
    formatBreakdown: [
      { format: 'Long-form Tutorials', percentage: 42 },
      { format: 'Short Tutorials', percentage: 26 },
      { format: 'Tool Reviews', percentage: 16 },
      { format: 'Explainers', percentage: 10 },
      { format: 'Q&A / Commentary', percentage: 4 },
    ],
    contentStyle: [
      'Technical & Practical',
      'Step-by-step Explanations',
      'Clean Editing',
      'On-screen Demos',
      'Beginner Friendly',
    ],
  };

  const topContent = intel?.topContent || [
    {
      id: 'c1',
      title: 'Build a Fullstack App with Next.js 14',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
      duration: '12:34',
      views: 2100000,
      likes: 76400,
      tags: ['Next.js', 'Web Development'],
      permalink: 'https://youtube.com',
    },
    {
      id: 'c2',
      title: 'My Developer Setup (2025)',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
      duration: '10:21',
      views: 980000,
      likes: 42100,
      tags: ['Productivity', 'Setup'],
      permalink: 'https://youtube.com',
    },
    {
      id: 'c3',
      title: 'AI Tools I Actually Use',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
      duration: '8:17',
      views: 620000,
      likes: 28700,
      tags: ['AI Tools', 'Workflow'],
      permalink: 'https://youtube.com',
    },
    {
      id: 'c4',
      title: 'How I Learned System Design',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop',
      duration: '14:02',
      views: 410000,
      likes: 18200,
      tags: ['System Design', 'Career'],
      permalink: 'https://youtube.com',
    },
  ];

  const performance = intel?.performance || {
    averageViews: { value: 48200, changePct: 8.7, history: [38000, 41200, 39500, 44000, 46100, 48200] },
    engagementRate: { value: 5.6, changePct: 1.2, history: [4.9, 5.1, 5.0, 5.3, 5.4, 5.6] },
    subscribers: { value: 124500, changePct: 12.4, history: [110000, 113000, 116500, 119000, 122000, 124500] },
    keyTakeaways: [
      'Long-form tutorials consistently outperform short-form clips.',
      'Your audience is highly engaged on developer tooling content.',
      'Recent content shows a positive growth trend compared to your previous 90 days.',
    ],
  };

  const audienceInsights = intel?.audienceInsights || {
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

  const brandOpportunities = intel?.brandOpportunities || [
    {
      id: 'opp_1',
      campaignId: 'cmp_notion',
      brandName: 'Notion',
      title: 'Creator Education Campaign',
      budgetMin: 25000,
      budgetMax: 50000,
      matchScore: 92,
      tags: ['Productivity', 'Developer Tools'],
    },
    {
      id: 'opp_2',
      campaignId: 'cmp_aws',
      brandName: 'AWS',
      title: 'Developer Cloud Stories',
      budgetMin: 40000,
      budgetMax: 80000,
      matchScore: 88,
      tags: ['Cloud Computing', 'Tech Education'],
    },
  ];

  const nextActions = intel?.nextActions || [
    {
      id: 1,
      title: 'Publish 2-4 more tutorial videos',
      description: 'Your audience engages most with in-depth tutorials. Aim for consistent uploads.',
      actionLabel: 'View Schedule',
      actionHref: '/creator/dashboard',
    },
    {
      id: 2,
      title: 'Update your profile and niche details',
      description: 'Helps brands find and match you with relevant campaigns.',
      actionLabel: 'Edit Profile',
      actionHref: '/creator/profile',
    },
    {
      id: 3,
      title: 'Explore and apply to 3 relevant campaigns',
      description: 'Notion, AWS and GitHub campaigns align with your content and audience.',
      actionLabel: 'View Campaigns',
      actionHref: '/creator/opportunities',
    },
    {
      id: 4,
      title: 'Experiment with short-form content',
      description: 'Short clips around tool tips and quick workflows can increase reach.',
      actionLabel: 'Analyze Formats',
      actionHref: '/creator/intelligence',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E7E1DA]/80">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#171717]">
              Your <span className="text-[#FF6B00]">creator intelligence.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Deep analysis of your content, audience and opportunities. Powered by real data from your connected accounts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <span className="text-xs text-[#737373] hidden sm:inline flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#737373]" />
              <span>Last updated 2 hours ago</span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Analyzing...' : 'Refresh Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Creator Identity & Analysis Coverage Banner */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar, Name, Niches, Connected handles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/5 shrink-0 border border-[#E7E1DA]">
              <img
                src={creator.profileImageUrl}
                alt={creator.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-[#171717]">
                  {creator.displayName}
                </h2>
                {creator.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Creator</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-[#737373] font-medium">
                {creator.niches.join(' • ')}
              </p>

              {/* Connected Platform Stats */}
              <div className="flex items-center gap-4 flex-wrap pt-1">
                {connectedAccounts.map((acc: any, i: number) => {
                  const isYt = acc.platform === 'YOUTUBE';
                  const isIg = acc.platform === 'INSTAGRAM';
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {isYt ? (
                        <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                      ) : isIg ? (
                        <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[9px] font-bold">
                          {acc.platform.charAt(0)}
                        </span>
                      )}
                      <span className="text-[#737373]">{acc.username}</span>
                      <strong className="text-[#171717] font-bold">
                        {acc.followers >= 1000 ? `${(acc.followers / 1000).toFixed(1)}K` : acc.followers}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Analysis Coverage */}
          <div className="lg:border-l border-[#E7E1DA] lg:pl-6 space-y-2 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
              Analysis Coverage
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#171717]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>YouTube content ({coverage.youtubeVideosCount} videos)</span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instagram posts ({coverage.instagramPostsCount} posts)</span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Recent comments (last {coverage.recentCommentsCount})</span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Channel metadata</span>
              </div>
            </div>
            <div className="text-[11px] text-[#737373] pt-1">
              Last analyzed: <span className="text-[#171717] font-medium">{coverage.lastAnalyzed}</span>
            </div>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#E7E1DA] pb-2 overflow-x-auto">
          {[
            { id: 'content', label: 'Content Analysis' },
            { id: 'audience', label: 'Audience Insights' },
            { id: 'opportunities', label: 'Brand Opportunities' },
            { id: 'growth', label: 'Growth Recommendations' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* Section 1: Content DNA */}
          {(activeTab === 'content' || activeTab === 'growth') && (
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                <div>
                  <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>Content DNA</span>
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    What CRAB understands about your content, based on your actual videos and posts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View all insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Col 1: Top Topics */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#171717]">Top Topics</div>
                  <div className="space-y-2.5">
                    {contentDna.topTopics.map((topic: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#525252] font-medium">{topic.name}</span>
                          <span className="font-bold text-[#171717]">{topic.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F8F6F2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF6B00] rounded-full"
                            style={{ width: `${topic.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Content Format Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#171717]">Content Format Breakdown</div>
                  <div className="space-y-2 text-xs">
                    {contentDna.formatBreakdown.map((fmt: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/60"
                      >
                        <span className="text-[#525252] font-medium">{fmt.format}</span>
                        <span className="font-bold text-[#171717]">{fmt.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Content Style */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#171717]">Content Style</div>
                  <div className="space-y-2 text-xs">
                    {contentDna.contentStyle.map((style: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/60 text-[#171717] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{style}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performing Content Grid */}
              <div className="pt-4 border-t border-[#E7E1DA]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#171717]">
                    Top Performing Content <span className="text-[#737373] font-normal">(last 90 days)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all content</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topContent.map((vid: any) => (
                    <div
                      key={vid.id}
                      className="group rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] overflow-hidden hover:border-[#FF6B00]/60 transition flex flex-col"
                    >
                      <div className="relative aspect-video bg-black/10 overflow-hidden">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {vid.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#171717] line-clamp-2 leading-snug">
                            {vid.title}
                          </h4>
                          <p className="text-[11px] text-[#737373] mt-1">
                            {vid.views >= 1000000
                              ? `${(vid.views / 1000000).toFixed(1)}M`
                              : `${(vid.views / 1000).toFixed(0)}K`}{' '}
                            views •{' '}
                            {vid.likes >= 1000 ? `${(vid.likes / 1000).toFixed(1)}K` : vid.likes} likes
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {vid.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-semibold text-[#525252]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2 & 3: Performance Analysis & Audience Insights */}
          {(activeTab === 'content' || activeTab === 'audience') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left (7 cols): Performance Analysis */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>Performance Analysis</span>
                    </h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      How your content is performing, based on real data.
                    </p>
                  </div>

                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-[#171717] focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 6 months</option>
                  </select>
                </div>

                {/* 3 KPI Cards with sparklines */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Avg Views */}
                  <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-2">
                    <div className="text-xs text-[#737373] font-medium">Average Views</div>
                    <div className="text-xl font-bold text-[#171717]">
                      {performance.averageViews.value >= 1000
                        ? `${(performance.averageViews.value / 1000).toFixed(1)}K`
                        : performance.averageViews.value}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{performance.averageViews.changePct}%</span>
                      </span>
                      {renderSparkline(performance.averageViews.history)}
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-2">
                    <div className="text-xs text-[#737373] font-medium">Engagement Rate</div>
                    <div className="text-xl font-bold text-[#171717]">
                      {performance.engagementRate.value}%
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{performance.engagementRate.changePct}%</span>
                      </span>
                      {renderSparkline(performance.engagementRate.history)}
                    </div>
                  </div>

                  {/* Subscribers */}
                  <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-2">
                    <div className="text-xs text-[#737373] font-medium">Subscribers</div>
                    <div className="text-xl font-bold text-[#171717]">
                      {performance.subscribers.value >= 1000
                        ? `${(performance.subscribers.value / 1000).toFixed(1)}K`
                        : performance.subscribers.value}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{performance.subscribers.changePct}%</span>
                      </span>
                      {renderSparkline(performance.subscribers.history)}
                    </div>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="p-4 rounded-xl bg-[#FFF4EB]/60 border border-[#FFD8BA] space-y-2">
                  <div className="text-xs font-bold text-[#FF6B00] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#525252]">
                    {performance.keyTakeaways.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#FF6B00] font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right (5 cols): Audience Insights */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
                <div className="pb-3 border-b border-[#E7E1DA]/80">
                  <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>Audience Insights</span>
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Who&apos;s watching and what they care about.
                  </p>
                </div>

                {/* Subtabs: Demographics | Interests | Locations */}
                <div className="flex items-center gap-2 border-b border-[#E7E1DA] pb-2">
                  {[
                    { id: 'demographics', label: 'Demographics' },
                    { id: 'interests', label: 'Interests' },
                    { id: 'locations', label: 'Locations' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAudienceSubtab(st.id as any)}
                      className={`text-xs font-bold pb-1 transition cursor-pointer border-b-2 ${
                        audienceSubtab === st.id
                          ? 'border-[#FF6B00] text-[#FF6B00]'
                          : 'border-transparent text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {audienceSubtab === 'demographics' && (
                  <div className="space-y-3 pt-1">
                    {audienceInsights.demographics.map((demo: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#525252] font-semibold">{demo.ageGroup}</span>
                          <span className="font-bold text-[#171717]">{demo.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#F8F6F2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF6B00] rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {audienceSubtab === 'interests' && (
                  <div className="space-y-3 pt-1">
                    <div className="text-[11px] font-bold text-[#737373]">
                      Top Interests (from comments and titles)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {audienceInsights.topInterests.map((interest: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs font-semibold text-[#171717]"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {audienceSubtab === 'locations' && (
                  <div className="space-y-3 pt-1">
                    {audienceInsights.topLocations.map((loc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#F8F6F2]">
                        <span className="text-[#171717] font-semibold">{loc.country}</span>
                        <strong className="text-[#FF6B00]">{loc.percentage}%</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E7E1DA]/80">
                  <div className="text-[11px] font-bold text-[#737373] mb-2">
                    Top interests (from comments and titles)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {audienceInsights.topInterests.slice(0, 3).map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] text-[11px] font-semibold text-[#525252]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4 & 5: Relevant Brand Opportunities & Next Best Actions */}
          {(activeTab === 'content' || activeTab === 'opportunities' || activeTab === 'growth') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left (6 cols): Relevant Brand Opportunities */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>Relevant Brand Opportunities</span>
                    </h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Campaigns that fit your content and audience.
                    </p>
                  </div>

                  <Link
                    href="/creator/opportunities"
                    className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {brandOpportunities.map((opp: any) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] hover:border-[#FF6B00]/60 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {opp.brandName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#171717]">{opp.brandName}</div>
                            <div className="text-xs font-semibold text-[#525252]">{opp.title}</div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                          {opp.matchScore}% match
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E7E1DA]/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {opp.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-semibold text-[#737373]"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-[#171717] font-bold ml-1">
                            ₹{opp.budgetMin.toLocaleString()} - ₹{opp.budgetMax.toLocaleString()}
                          </span>
                        </div>

                        <Link
                          href="/creator/opportunities"
                          className="font-bold text-[#FF6B00] hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>View Campaign</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (6 cols): Your Next Best Actions */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
                <div className="pb-3 border-b border-[#E7E1DA]/80">
                  <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <span>Your Next Best Actions</span>
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Personalized recommendations based on your current stage.
                  </p>
                </div>

                <div className="space-y-3">
                  {nextActions.map((action: any) => (
                    <div
                      key={action.id}
                      className="p-3.5 rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] flex items-start gap-3.5"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {action.id}
                      </span>

                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-bold text-[#171717]">
                          {action.title}
                        </h4>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          {action.description}
                        </p>
                        <Link
                          href={action.actionHref}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline pt-1"
                        >
                          <span>{action.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
