'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { Users, Eye, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

import dynamic from 'next/dynamic';
import { CreatorHeader } from '../../../components/creator/CreatorHeader';
import { CreatorProfileBanner, BannerSocialAccount } from '../../../components/creator/CreatorProfileBanner';
import { CreatorMetricCard } from '../../../components/creator/CreatorMetricCard';
import { CreatorIntelligencePanel } from '../../../components/creator/CreatorIntelligencePanel';
import { ProfileCompletionPanel, CompletionStep } from '../../../components/creator/ProfileCompletionPanel';
import { RecentActivityList, ActivityItem } from '../../../components/creator/RecentActivityList';
import { OpportunityItem } from '../../../components/creator/RecommendedOpportunityList';
import { PlatformStat } from '../../../components/creator/PlatformBreakdown';

const AudienceGrowthChart = dynamic(
  () => import('../../../components/creator/AudienceGrowthChart').then((mod) => mod.AudienceGrowthChart),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse bg-neutral-100 rounded-2xl" />,
  }
);

export default function CreatorDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!authLoading) {
      if (user && user.role !== 'CREATOR') {
        router.push('/brand/dashboard');
        return;
      }

      const fetchAllData = async (authToken: string) => {
        setLoading(true);
        try {
          const [
            profileRes,
            metricsRes,
            intelRes,
            oppsRes,
            actRes,
            accountsRes,
          ] = await Promise.allSettled([
            fetchApi<any>('/api/creators/me', {}, authToken),
            fetchApi<any>('/api/creators/me/metrics', {}, authToken),
            fetchApi<any>('/api/creators/me/intelligence', {}, authToken),
            fetchApi<any>('/api/creators/me/opportunities', {}, authToken),
            fetchApi<any>('/api/creators/me/activity', {}, authToken),
            fetchApi<any>('/api/social/accounts', {}, authToken),
          ]);

          if (!mounted) return;

          if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
            setProfile(profileRes.value.data);
          }
          if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
            setMetrics(metricsRes.value.data);
          }
          if (intelRes.status === 'fulfilled' && intelRes.value?.data) {
            setIntelligence(intelRes.value.data);
          }
          if (oppsRes.status === 'fulfilled' && oppsRes.value?.data) {
            const opps = Array.isArray(oppsRes.value.data)
              ? oppsRes.value.data
              : oppsRes.value.data.opportunities || [];
            setOpportunities(opps);
          }
          if (actRes.status === 'fulfilled' && actRes.value?.data) {
            const acts = Array.isArray(actRes.value.data)
              ? actRes.value.data
              : actRes.value.data.activities || [];
            setActivities(acts);
          }
          if (accountsRes.status === 'fulfilled' && accountsRes.value?.data) {
            setAccounts(accountsRes.value.data);
          }
        } catch (err) {
          console.error('[CREATOR_DASHBOARD] Error loading data:', err);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      if (token) {
        fetchAllData(token);
      }
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.role, authLoading, token, router]);

  // Loading skeleton during initial fetch
  if (token && loading && !profile) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-white/60 rounded-2xl border border-[#E7E1DA]" />
        <div className="h-32 bg-white/60 rounded-2xl border border-[#E7E1DA]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/60 rounded-2xl border border-[#E7E1DA]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-white/60 rounded-2xl border border-[#E7E1DA]" />
          <div className="lg:col-span-4 h-80 bg-white/60 rounded-2xl border border-[#E7E1DA]" />
        </div>
      </div>
    );
  }

  // Derive real display values
  const primaryAccount = (accounts || []).find((a: any) => a.platform === 'YOUTUBE') || (accounts || [])[0];
  const displayName = profile?.displayName || primaryAccount?.title || user?.displayName || 'Creator';
  const avatarUrl = profile?.profileImageUrl || primaryAccount?.thumbnailUrl || undefined;
  const bio = profile?.bio || undefined;
  const niches = profile?.niches || intelligence?.primaryNiches || [];

  // Determine connected social accounts
  const connectedSocials: BannerSocialAccount[] = (accounts || [])
    .filter((a: any) => a.status === 'CONNECTED' || a.status === 'LINKED')
    .map((a: any) => {
      const u = a.platformUsername || a.username || a.handle;
      return {
        platform: a.platform,
        username: u,
        profileUrl: a.profileUrl || (a.platform === 'YOUTUBE' ? (u ? `https://youtube.com/${u.startsWith('@') ? u : `@${u}`}` : undefined) : (u ? `https://instagram.com/${u.replace(/^@/, '')}` : undefined)),
      };
    });

  // Platform stats for breakdown
  const platformStats: PlatformStat[] = (accounts || [])
    .filter((a: any) => a.status === 'CONNECTED' || a.status === 'LINKED')
    .map((a: any) => {
      const followers = a.metrics?.subscribers || a.metrics?.followers || a.stats?.subscriberCount || a.stats?.followerCount;
      const u = a.platformUsername || a.username || a.handle;
      return {
        platform: a.platform as PlatformStat['platform'],
        name: a.platform === 'YOUTUBE' ? (a.title || 'YouTube') : (a.platform === 'INSTAGRAM' ? 'Instagram' : a.platform),
        count: typeof followers === 'number'
          ? followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : `${followers}`
          : 'Pending sync',
        growth: a.ownershipVerified ? 'Owner Verified' : 'Public Profile',
        handle: u ? (u.startsWith('@') ? u : `@${u}`) : undefined,
        isConnected: true,
      };
    });

  // KPI Metrics (using live backend metrics if available)
  const hasMetrics = !!metrics?.hasData;
  const audienceValue = hasMetrics && typeof metrics.followers === 'number'
    ? metrics.followers >= 1000 ? `${(metrics.followers / 1000).toFixed(1)}K` : `${metrics.followers}`
    : '—';
  const viewsValue = hasMetrics && typeof metrics.averageViews === 'number'
    ? metrics.averageViews >= 1000 ? `${(metrics.averageViews / 1000).toFixed(1)}K` : `${metrics.averageViews}`
    : '—';
  const engagementValue = hasMetrics && typeof metrics.engagementRate === 'number'
    ? `${metrics.engagementRate.toFixed(1)}%`
    : '—';
  const cadenceValue = hasMetrics && typeof metrics.postingFrequency === 'number'
    ? `${metrics.postingFrequency} / wk`
    : '—';

  // Dynamic Profile Completion Calculation
  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 0);
  const hasNiches = Boolean(niches && niches.length > 0);
  const hasLocation = Boolean(profile?.location && profile.location.trim().length > 0);
  const hasConnectedAccount = connectedSocials.length > 0;

  let completionScore = 0;
  if (hasBio) completionScore += 25;
  if (hasNiches) completionScore += 25;
  if (hasLocation) completionScore += 25;
  if (hasConnectedAccount) completionScore += 25;

  const completionSteps: CompletionStep[] = [
    {
      id: 'step-social',
      title: 'Connect your social account',
      subtitle: 'Authorizes CRAB to verify your metrics for brand deals',
      actionText: 'Connect',
      actionHref: '/creator/profile',
      completed: hasConnectedAccount,
    },
    {
      id: 'step-niches',
      title: 'Specify content niches',
      subtitle: 'Helps matching algorithms recommend relevant campaigns',
      actionText: 'Add niches',
      actionHref: '/creator/profile',
      completed: hasNiches,
    },
    {
      id: 'step-bio',
      title: 'Add creator bio',
      subtitle: 'Give brands a clear summary of your channel and content',
      actionText: 'Add bio',
      actionHref: '/creator/profile',
      completed: hasBio,
    },
    {
      id: 'step-location',
      title: 'Add your location',
      subtitle: 'Allows brands targeting specific regions to discover you',
      actionText: 'Add location',
      actionHref: '/creator/profile',
      completed: hasLocation,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Sync Toast Feedback */}
        {syncMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs transition animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Main Editorial Header */}
        <CreatorHeader displayName={displayName} avatarUrl={avatarUrl} />

        {/* 2. Creator Profile Banner */}
        <CreatorProfileBanner
          displayName={displayName}
          avatarUrl={avatarUrl}
          bio={bio}
          niches={niches}
          totalFollowers={metrics?.followers}
          engagementRate={metrics?.engagementRate}
          hasMetrics={hasMetrics}
          isVerified={Boolean(profile?.isVerified || hasConnectedAccount)}
          socialAccounts={connectedSocials}
        />

        {/* 3. Four Compact KPI Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CreatorMetricCard
            label="Audience Size"
            value={audienceValue}
            subtext={
              hasMetrics && typeof metrics.followers === 'number'
                ? 'Public subscriber count'
                : hasConnectedAccount
                ? 'Subscriber count hidden or pending'
                : 'Connect account to track'
            }
            icon={Users}
            hasData={hasMetrics && typeof metrics.followers === 'number'}
          />
          <CreatorMetricCard
            label="Average Views"
            value={viewsValue}
            subtext={
              hasMetrics && typeof metrics.averageViews === 'number'
                ? `Last ${metrics.averageViewsSampleSize || 10} videos sample`
                : hasConnectedAccount
                ? 'Insufficient public video history'
                : 'Requires content sync'
            }
            icon={Eye}
            hasData={hasMetrics && typeof metrics.averageViews === 'number'}
          />
          <CreatorMetricCard
            label="Engagement Rate"
            value={engagementValue}
            subtext={
              hasMetrics && typeof metrics.engagementRate === 'number'
                ? 'Likes + comments per view'
                : hasConnectedAccount
                ? 'Requires public interactions data'
                : 'Awaiting metrics'
            }
            icon={TrendingUp}
            hasData={hasMetrics && typeof metrics.engagementRate === 'number'}
          />
          <CreatorMetricCard
            label="Posting Cadence"
            value={cadenceValue}
            subtext={
              hasMetrics && typeof metrics.postingFrequency === 'number'
                ? 'Weekly cadence (observed uploads)'
                : hasConnectedAccount
                ? 'Need 2+ published videos'
                : 'No recent uploads'
            }
            icon={Layers}
            hasData={hasMetrics && typeof metrics.postingFrequency === 'number'}
          />
        </section>

        {/* 4. Main Content Grid: Audience Growth (Left ~64%) & CRAB Intelligence (Right ~36%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Audience Growth & Social Platform Breakdown */}
          <div className="lg:col-span-8 space-y-6">
            <AudienceGrowthChart
              growthData={metrics?.growthData || []}
              platformStats={platformStats}
              isLoading={loading}
            />
          </div>

          {/* Right Column: CRAB Intelligence & Recommended Opportunities */}
          <div className="lg:col-span-4 space-y-6">
            <CreatorIntelligencePanel
              insightTitle={intelligence?.insightTitle}
              insightBody={intelligence?.insightBody}
              hasIntelligence={Boolean(intelligence?.hasIntelligence)}
              opportunities={opportunities}
              isLoading={loading}
            />
          </div>
        </div>

        {/* 5. Bottom Content Grid: Next Steps (Left ~58%) & Recent Activity (Right ~42%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Completion Progress & Actionable Next Steps */}
          <div className="lg:col-span-7">
            <ProfileCompletionPanel
              completionPercentage={completionScore}
              steps={completionSteps}
              onConnectSocial={() => router.push('/creator/profile')}
            />
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="lg:col-span-5">
            <RecentActivityList
              activities={activities}
              isLoading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
