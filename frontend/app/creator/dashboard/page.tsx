'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import {
  Users,
  Eye,
  TrendingUp,
  Sparkles,
  Youtube,
  Instagram,
  MessageSquare,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ExternalLink,
  Calendar,
  ThumbsUp,
  Check,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const PerformanceChart = dynamic(() => import('../../../components/PerformanceChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-[#F3F3FC] rounded-xl" />
});

const CHART_DATA = [
  { month: 'Jun', views: 24000, engagement: 4.2 },
  { month: 'Jul', views: 31000, engagement: 4.5 },
  { month: 'Aug', views: 38000, engagement: 4.9 },
  { month: 'Sep', views: 42000, engagement: 5.1 },
  { month: 'Oct', views: 48200, engagement: 5.6 },
];

export default function CreatorDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'intelligence' | 'accounts'>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [contentList, setContentList] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'CREATOR') {
        router.push('/brand/dashboard');
        return;
      }

      const loadInitialData = async () => {
        setLoading(true);
        try {
          if (token) {
            const profileRes = await fetchApi<any>('/api/creators/me', {}, token).catch(() => null);
            if (!mounted) return;
            if (profileRes?.data) setProfile(profileRes.data);
            
            // Unblock the main UI as soon as profile is ready
            setLoading(false);

            // Fetch secondary data without blocking the UI
            loadSecondaryData(token, mounted);
          }
        } catch (err) {
          if (mounted) setLoading(false);
        }
      };

      loadInitialData();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, token, router]);

  const loadSecondaryData = async (authToken: string, mounted = true) => {
    const [metricsRes, contentRes, intelRes, accountsRes] = await Promise.all([
      fetchApi<any>('/api/creators/me/metrics', {}, authToken).catch(() => null),
      fetchApi<any>('/api/creators/me/content', {}, authToken).catch(() => null),
      fetchApi<any>('/api/creators/me/intelligence', {}, authToken).catch(() => null),
      fetchApi<any>('/api/social/accounts', {}, authToken).catch(() => null),
    ]);

    if (!mounted) return;
    if (metricsRes?.data) setMetrics(metricsRes.data);
    if (contentRes?.data) setContentList(contentRes.data);
    if (intelRes?.data) setIntelligence(intelRes.data);
    if (accountsRes?.data) setAccounts(accountsRes.data);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      if (token) {
        await fetchApi('/api/social/accounts/social_yt_01/sync', { method: 'POST' }, token);
        const profileRes = await fetchApi<any>('/api/creators/me', {}, token).catch(() => null);
        if (profileRes?.data) setProfile(profileRes.data);
        await loadSecondaryData(token);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 4000);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
                <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#8580E8]" />
          Loading Creator Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      
      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Creator Profile Header Card */}
        <section className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-[0_1px_3px_0_rgba(23,24,43,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8580E8] to-[#F4511E] p-0.5 shadow-sm flex-shrink-0">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center font-bold text-xl text-[#17182B]">
                {profile?.displayName?.slice(0, 2).toUpperCase() || 'CR'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#17182B]">
                  {profile?.displayName || user?.displayName || 'Creator Profile'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Creator</span>
                </span>
              </div>
              <p className="text-xs text-[#626782] max-w-xl">
                {profile?.bio || 'Tech and developer creator sharing tutorials, framework benchmarks, and software tools.'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(intelligence?.primaryNiches || ['Technology', 'AI Tools', 'Software Engineering']).map(
                  (niche: string) => (
                    <span
                      key={niche}
                      className="px-2 py-0.5 rounded-md bg-[#F3F3FC] text-[#8580E8] text-[11px] font-medium"
                    >
                      {niche}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#F5F6FA] hover:bg-[#E7E8F0] text-[#17182B] text-xs font-semibold border border-[#E7E8F0] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8580E8] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Social Data'}</span>
            </button>

            <Link
              href="/creator/profile"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#E7E8F0] pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-[#17182B] text-white shadow-sm'
                : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'content'
                ? 'bg-[#17182B] text-white shadow-sm'
                : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
            }`}
          >
            <span>Imported Content</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{contentList.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'intelligence'
                ? 'bg-[#17182B] text-white shadow-sm'
                : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8580E8]" />
            <span>AI Creator Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'accounts'
                ? 'bg-[#17182B] text-white shadow-sm'
                : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
            }`}
          >
            Connected Channels
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#8B90A5]">
                  <span className="text-xs font-medium">Audience Size</span>
                  <Users className="w-4 h-4 text-[#8580E8]" />
                </div>
                <div className="text-2xl font-bold text-[#17182B]">
                  {(metrics?.followers || 142000).toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">+12.4% this month</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#8B90A5]">
                  <span className="text-xs font-medium">Average Views</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-[#17182B]">
                  {(metrics?.averageViews || 48200).toLocaleString()}
                </div>
                <p className="text-[11px] text-[#626782]">Across longform videos</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#8B90A5]">
                  <span className="text-xs font-medium">Engagement Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-[#17182B]">
                  {metrics?.engagementRate || 5.6}%
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">Top 15% in Developer niche</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[#8B90A5]">
                  <span className="text-xs font-medium">Posting Frequency</span>
                  <Layers className="w-4 h-4 text-[#F4511E]" />
                </div>
                <div className="text-2xl font-bold text-[#17182B]">
                  {metrics?.postingFrequency || 3.4} / week
                </div>
                <p className="text-[11px] text-[#626782]">Verified upload schedule</p>
              </div>
            </section>

            {/* Performance Trend Chart */}
            <section className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#17182B]">Audience & Views Trajectory</h2>
                  <p className="text-xs text-[#626782]">Historical snapshot metrics imported from connected platforms</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F3F3FC] text-[#8580E8]">
                  Consistent Growth
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <PerformanceChart data={CHART_DATA} />
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Content Feed */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#17182B]">Imported Creator Content</h2>
                <p className="text-xs text-[#626782]">
                  Indexed content items analyzed by CRAB to infer topic vectors and commercial fit
                </p>
              </div>
              <span className="text-xs text-[#8B90A5]">
                {contentList.length} items synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-[#E7E8F0] shadow-sm space-y-4 hover:border-[#8580E8]/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F5F6FA] text-[#17182B]">
                        {item.platform === 'YOUTUBE' ? (
                          <Youtube className="w-3.5 h-3.5 text-red-600" />
                        ) : (
                          <Instagram className="w-3.5 h-3.5 text-pink-600" />
                        )}
                        <span>{item.contentType}</span>
                      </span>
                      <span className="text-xs text-[#8B90A5] flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#17182B] leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#626782] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.aiAnalysis && (
                      <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#17182B] flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-[#8580E8]" />
                            <span>Inferred Topics</span>
                          </span>
                          <span className="text-[#8580E8] font-semibold">
                            {Math.round(item.aiAnalysis.confidence * 100)}% Confidence
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.aiAnalysis.topics.map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded bg-white text-[10px] text-[#626782] border border-[#E7E8F0]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E7E8F0] flex items-center justify-between text-xs text-[#626782]">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-[#8B90A5]" />
                        <span>{item.views?.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-[#8B90A5]" />
                        <span>{item.likes?.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8B90A5]" />
                        <span>{item.comments?.toLocaleString()}</span>
                      </span>
                    </div>

                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8580E8] hover:underline flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Intelligence Dossier */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E8F0]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F3FC] text-[#8580E8] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#17182B]">Creator AI Intelligence Profile</h2>
                    <p className="text-xs text-[#626782]">Semantic representation extracted by Gemini & stored in pgvector</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Vector Embedded (768d)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#8B90A5] uppercase tracking-wider">Audience Persona</h3>
                    <p className="text-sm text-[#17182B] mt-1 leading-relaxed">
                      {intelligence?.audienceSummary || 'High-concentration audience of professional software engineers, fullstack developers, and technical founders.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#8B90A5] uppercase tracking-wider">Primary Niches</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(intelligence?.primaryNiches || ['Technology', 'AI Tools', 'Software Engineering']).map((n: string) => (
                        <span key={n} className="px-3 py-1 rounded-xl bg-[#F3F3FC] text-[#8580E8] text-xs font-semibold">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#8B90A5] uppercase tracking-wider">Content Style Signature</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(intelligence?.contentStyle || ['Tutorials', 'Code Walkthroughs', 'Benchmarks']).map((s: string) => (
                        <span key={s} className="px-3 py-1 rounded-xl bg-[#F5F6FA] text-[#17182B] text-xs font-medium border border-[#E7E8F0]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Brand Alignments</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(intelligence?.brandSuitability?.recommended || ['Developer Platforms', 'Cloud & Hosting', 'AI Software', 'Technical Hardware']).map(
                        (b: string) => (
                          <span key={b} className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 text-xs font-medium border border-emerald-200">
                            {b}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                    <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <span>Commercial Exclusions / Avoid</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(intelligence?.brandSuitability?.avoid || ['Gambling / Betting', 'Unverified Crypto Projects']).map((b: string) => (
                        <span key={b} className="px-2.5 py-1 rounded-lg bg-white text-red-800 text-xs font-medium border border-red-200">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Connected Accounts */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#17182B]">Connected Channels & Social APIs</h2>
                <p className="text-xs text-[#626782]">
                  Authorized accounts feeding views, metrics, and content metadata into CRAB
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-5 rounded-2xl border border-[#E7E8F0] bg-[#F8F9FC] space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#E7E8F0]">
                          {acc.platform === 'YOUTUBE' ? (
                            <Youtube className="w-5 h-5 text-red-600" />
                          ) : (
                            <Instagram className="w-5 h-5 text-pink-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#17182B]">{acc.platform}</h3>
                          <span className="text-xs text-[#626782]">{acc.handle}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {acc.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#8B90A5] pt-2 border-t border-[#E7E8F0] flex justify-between">
                      <span>Last Synced:</span>
                      <span className="text-[#17182B] font-medium">{new Date(acc.lastSyncedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
