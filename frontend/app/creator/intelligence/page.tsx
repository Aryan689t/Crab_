'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Youtube,
  Instagram,
  TrendingUp,
  Sparkles,
  Check,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface CreatorSnapshot {
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
    followers: number | null;
    status: string;
    isPublicLinkOnly?: boolean;
  }>;
  analysisCoverage: {
    youtubeVideosCount: number;
    instagramPostsCount: number;
    recentCommentsCount: number;
    channelMetadataVerified: boolean;
    lastAnalyzed: string | null;
  };
  contentDna: {
    topTopics: Array<{ name: string; percentage: number; count?: number }>;
    formatBreakdown: Array<{ format: string; percentage: number }>;
    contentStyle: string[];
  };
  topContent: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    platform: string;
    duration: string | null;
    views: number | null;
    likes: number | null;
    tags: string[];
    permalink: string;
    publishedAt: string | null;
  }>;
  performance: {
    timeRange: string;
    averageViews: { value: number | null; changePct: number | null; history: number[] };
    engagementRate: { value: number | null; changePct: number | null; history: number[] };
    subscribers: { value: number | null; changePct: number | null; history: number[] };
    keyTakeaways: string[];
  };
  audienceInsights: {
    hasDemographics: boolean;
    demographics: Array<{ ageGroup: string; percentage: number }>;
    topInterests: string[];
    topLocations: Array<{ country: string; percentage: number }>;
    notice?: string;
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

export default function CreatorIntelligencePage() {
  const { user, token } = useAuth();
  const [intel, setIntel] = useState<CreatorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audience' | 'opportunities' | 'growth'>('content');
  const [audienceSubtab, setAudienceSubtab] = useState<'demographics' | 'interests' | 'locations'>('demographics');
  const [timeRange, setTimeRange] = useState('Last 90 days');
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const fetchIntelligence = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchApi<{ data: CreatorSnapshot }>(
        '/api/creators/me/intelligence',
        {},
        token || undefined
      );
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
    if (refreshing || !token) return;
    setRefreshing(true);
    setRefreshNotice(null);
    try {
      const res = await fetchApi<{ data: CreatorSnapshot; meta?: { message?: string } }>(
        '/api/creators/me/intelligence/analyze',
        { method: 'POST' },
        token || undefined
      );
      if (res?.data) {
        setIntel(res.data);
        setRefreshNotice(res.meta?.message || 'Intelligence refreshed with latest data.');
      }
    } catch (err: any) {
      console.warn('[INTELLIGENCE REFRESH] Error:', err);
      // Fallback: re-fetch cached snapshot
      await fetchIntelligence();
      setRefreshNotice('Refreshed latest available data.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshNotice(null), 5000);
    }
  };

  // Sparkline generator (only renders when genuine historical points exist)
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
      <svg width={width} height={height} className="overflow-visible shrink-0" aria-hidden="true">
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

  // Actual creator fields
  const creator = intel?.creator || {
    id: '',
    displayName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Creator',
    profileImageUrl: null,
    bio: null,
    location: null,
    verified: false,
    niches: [],
  };

  const connectedAccounts = intel?.connectedAccounts || [];
  const coverage = intel?.analysisCoverage || {
    youtubeVideosCount: 0,
    instagramPostsCount: 0,
    recentCommentsCount: 0,
    channelMetadataVerified: false,
    lastAnalyzed: null,
  };
  const contentDna = intel?.contentDna || {
    topTopics: [],
    formatBreakdown: [],
    contentStyle: [],
  };
  const topContent = intel?.topContent || [];
  const performance = intel?.performance || {
    timeRange: 'Last 90 days',
    averageViews: { value: null, changePct: null, history: [] },
    engagementRate: { value: null, changePct: null, history: [] },
    subscribers: { value: null, changePct: null, history: [] },
    keyTakeaways: [],
  };
  const audienceInsights = intel?.audienceInsights || {
    hasDemographics: false,
    demographics: [],
    topInterests: [],
    topLocations: [],
  };
  const brandOpportunities = intel?.brandOpportunities || [];
  const nextActions = intel?.nextActions || [];

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
            {coverage.lastAnalyzed && (
              <span className="text-xs text-[#737373] hidden sm:inline flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#737373]" />
                <span>Last analyzed {coverage.lastAnalyzed}</span>
              </span>
            )}

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

        {/* Refresh feedback alert */}
        {refreshNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refreshNotice}</span>
          </div>
        )}

        {/* Creator Identity & Analysis Coverage Banner */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar, Name, Niches, Connected handles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FFE8D6] text-[#FF6B00] shrink-0 border border-[#FFD0B0] flex items-center justify-center font-bold text-xl font-serif">
              {creator.profileImageUrl && !avatarFailed ? (
                <img
                  src={creator.profileImageUrl}
                  alt={creator.displayName}
                  onError={() => setAvatarFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{creator.displayName.charAt(0).toUpperCase()}</span>
              )}
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

              {creator.niches.length > 0 ? (
                <p className="text-xs text-[#737373] font-medium">
                  {creator.niches.join(' • ')}
                </p>
              ) : (
                <p className="text-xs text-[#A3A3A3] italic">
                  No primary niches defined yet.
                </p>
              )}

              {/* Connected Platform Stats */}
              {connectedAccounts.length > 0 ? (
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {connectedAccounts.map((acc, i) => {
                    const isYt = acc.platform === 'YOUTUBE';
                    const isIg = acc.platform === 'INSTAGRAM';
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E7E1DA]"
                      >
                        {isYt ? (
                          <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                        ) : isIg ? (
                          <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[9px] font-bold">
                            {acc.platform.charAt(0)}
                          </span>
                        )}
                        <span className="text-[#737373] font-medium">{acc.username}</span>
                        <strong className="text-[#171717] font-bold">
                          {acc.followers !== null
                            ? acc.followers >= 1000
                              ? `${(acc.followers / 1000).toFixed(1)}K`
                              : acc.followers.toLocaleString()
                            : acc.isPublicLinkOnly
                            ? 'Profile Link'
                            : 'Pending sync'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-[#737373]">No social accounts connected yet.</span>
                  <Link
                    href="/creator/settings"
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    Connect Platforms &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Analysis Coverage */}
          <div className="lg:border-l border-[#E7E1DA] lg:pl-6 space-y-2 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
              Analysis Coverage
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#171717]">
                {coverage.youtubeVideosCount > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                )}
                <span>
                  YouTube content ({coverage.youtubeVideosCount > 0 ? `${coverage.youtubeVideosCount} videos` : 'No videos synced'})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                {coverage.instagramPostsCount > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                )}
                <span>
                  Instagram posts ({coverage.instagramPostsCount > 0 ? `${coverage.instagramPostsCount} posts` : 'No posts synced'})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                {coverage.recentCommentsCount > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                )}
                <span>
                  Recent comments ({coverage.recentCommentsCount > 0 ? `${coverage.recentCommentsCount.toLocaleString()} analyzed` : 'No comments retrieved'})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]">
                {coverage.channelMetadataVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                )}
                <span>
                  Channel metadata {coverage.channelMetadataVerified ? '(Verified channel)' : '(Pending link)'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-[#737373] pt-1">
              Last analyzed:{' '}
              <span className="text-[#171717] font-medium">
                {coverage.lastAnalyzed || 'Not analyzed yet'}
              </span>
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

              {contentDna.topTopics.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-center space-y-2">
                  <h4 className="font-serif text-base font-semibold text-[#171717]">
                    Your Content DNA is not ready yet.
                  </h4>
                  <p className="text-xs text-[#737373] max-w-md mx-auto">
                    Connect an eligible social account and publish or sync content to discover your main topics, formats, and content patterns.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition cursor-pointer"
                    >
                      {refreshing ? 'Syncing...' : 'Sync & Analyze Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Col 1: Top Topics */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#171717]">Top Topics</div>
                    <div className="space-y-2.5">
                      {contentDna.topTopics.map((topic, i) => (
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
                    {contentDna.formatBreakdown.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {contentDna.formatBreakdown.map((fmt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/60"
                          >
                            <span className="text-[#525252] font-medium">{fmt.format}</span>
                            <span className="font-bold text-[#171717]">{fmt.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#A3A3A3] italic p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E1DA]">
                        No format distribution data available.
                      </div>
                    )}
                  </div>

                  {/* Col 3: Content Style */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#171717]">Content Style</div>
                    {contentDna.contentStyle.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {contentDna.contentStyle.map((style, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/60 text-[#171717] font-semibold"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{style}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#A3A3A3] italic p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E1DA]">
                        Content style analysis pending. Sync more uploads to extract style markers.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Performing Content Grid */}
              <div className="pt-4 border-t border-[#E7E1DA]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#171717]">
                    Top Performing Content <span className="text-[#737373] font-normal">({topContent.length} posts analyzed)</span>
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

                {topContent.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-center space-y-2">
                    <h4 className="font-serif text-base font-semibold text-[#171717]">
                      No published content synced yet
                    </h4>
                    <p className="text-xs text-[#737373] max-w-md mx-auto">
                      Connect your YouTube or Instagram account in Settings and click Refresh Analysis to import and evaluate your videos.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/creator/settings"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition"
                      >
                        <span>Connect Channel</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topContent.map((vid) => (
                      <a
                        key={vid.id}
                        href={vid.permalink || '#'}
                        target={vid.permalink && vid.permalink !== '#' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="group rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] overflow-hidden hover:border-[#FF6B00]/60 transition flex flex-col"
                      >
                        <div className="relative aspect-video bg-black/10 overflow-hidden flex items-center justify-center">
                          {vid.thumbnailUrl ? (
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="text-xs text-[#737373] font-semibold flex items-center gap-1.5">
                              {vid.platform === 'YOUTUBE' ? (
                                <Youtube className="w-5 h-5 text-red-600" />
                              ) : (
                                <Instagram className="w-5 h-5 text-pink-600" />
                              )}
                              <span>{vid.platform}</span>
                            </div>
                          )}
                          {vid.duration && (
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                              {vid.duration}
                            </span>
                          )}
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#171717] line-clamp-2 leading-snug group-hover:text-[#FF6B00] transition-colors">
                              {vid.title}
                            </h4>
                            <p className="text-[11px] text-[#737373] mt-1">
                              {vid.views !== null
                                ? vid.views >= 1000000
                                  ? `${(vid.views / 1000000).toFixed(1)}M views`
                                  : `${(vid.views / 1000).toFixed(0)}K views`
                                : 'Views not synced'}
                              {vid.likes !== null ? ` • ${vid.likes.toLocaleString()} likes` : ''}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 pt-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {vid.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-semibold text-[#525252]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <ExternalLink className="w-3 h-3 text-[#A3A3A3] group-hover:text-[#FF6B00] shrink-0" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
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
                      {performance.averageViews.value !== null
                        ? performance.averageViews.value >= 1000
                          ? `${(performance.averageViews.value / 1000).toFixed(1)}K`
                          : performance.averageViews.value.toLocaleString()
                        : 'Pending sync'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {performance.averageViews.changePct !== null ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{performance.averageViews.changePct}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A3A3A3] font-medium">Baseline</span>
                      )}
                      {renderSparkline(performance.averageViews.history)}
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-2">
                    <div className="text-xs text-[#737373] font-medium">Engagement Rate</div>
                    <div className="text-xl font-bold text-[#171717]">
                      {performance.engagementRate.value !== null
                        ? `${performance.engagementRate.value}%`
                        : 'Pending sync'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {performance.engagementRate.changePct !== null ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{performance.engagementRate.changePct}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A3A3A3] font-medium">Baseline</span>
                      )}
                      {renderSparkline(performance.engagementRate.history)}
                    </div>
                  </div>

                  {/* Subscribers */}
                  <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-2">
                    <div className="text-xs text-[#737373] font-medium">Subscribers / Followers</div>
                    <div className="text-xl font-bold text-[#171717]">
                      {performance.subscribers.value !== null
                        ? performance.subscribers.value >= 1000
                          ? `${(performance.subscribers.value / 1000).toFixed(1)}K`
                          : performance.subscribers.value.toLocaleString()
                        : 'Pending sync'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {performance.subscribers.changePct !== null ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{performance.subscribers.changePct}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A3A3A3] font-medium">Baseline</span>
                      )}
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
                    {audienceInsights.hasDemographics && audienceInsights.demographics.length > 0 ? (
                      audienceInsights.demographics.map((demo, i) => (
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
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-2.5">
                        <div className="flex items-center gap-2 text-[#FF6B00]">
                          <Lock className="w-4 h-4 shrink-0" />
                          <h4 className="font-semibold text-xs text-[#171717]">
                            Platform Demographics Permission Required
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          Audience age and gender distributions require owner-authorized platform analytics permissions (e.g. YouTube Analytics API or Instagram Business Insights).
                        </p>
                        <div className="text-[11px] text-[#525252] font-medium bg-white p-2.5 rounded-lg border border-[#E7E1DA]">
                          CRAB never fabricates demographic age brackets. Once you authorize analytics access, verified data will appear here.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {audienceSubtab === 'interests' && (
                  <div className="space-y-3 pt-1">
                    <div className="text-[11px] font-bold text-[#737373]">
                      Top Interests (inferred from content topics and metadata)
                    </div>
                    {audienceInsights.topInterests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {audienceInsights.topInterests.map((interest, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs font-semibold text-[#171717]"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-xs text-[#737373] italic">
                        No interest themes inferred yet. Connect an account and sync content to generate audience alignment tags.
                      </div>
                    )}
                  </div>
                )}

                {audienceSubtab === 'locations' && (
                  <div className="space-y-3 pt-1">
                    {audienceInsights.topLocations.length > 0 ? (
                      audienceInsights.topLocations.map((loc, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#F8F6F2]">
                          <span className="text-[#171717] font-semibold">{loc.country}</span>
                          <strong className="text-[#FF6B00]">{loc.percentage}%</strong>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-xs text-[#737373] italic">
                        Geographic analytics require owner-authorized platform analytics access.
                      </div>
                    )}
                  </div>
                )}
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

                {brandOpportunities.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-center space-y-1.5">
                    <div className="text-xs font-semibold text-[#171717]">
                      No active campaigns currently match your profile
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      New campaigns are posted regularly. Check back soon or browse open opportunities.
                    </p>
                    <Link
                      href="/creator/opportunities"
                      className="inline-block mt-1 text-xs font-bold text-[#FF6B00] hover:underline"
                    >
                      Browse Opportunities &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brandOpportunities.map((opp) => (
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
                            {opp.tags.map((tag, idx) => (
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
                )}
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

                {nextActions.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-center text-xs text-[#737373]">
                    All recommended profile actions are up to date!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nextActions.map((action) => (
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
                          {action.actionHref === '#refresh' ? (
                            <button
                              type="button"
                              onClick={handleRefresh}
                              disabled={refreshing}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline pt-1 cursor-pointer"
                            >
                              <span>{action.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <Link
                              href={action.actionHref}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline pt-1"
                            >
                              <span>{action.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
