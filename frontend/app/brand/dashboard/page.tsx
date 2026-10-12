'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Layers,
  Users,
  Clock,
  DollarSign,
  Sparkles,
  Search,
  CheckCircle2,
  BarChart3,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';
import { SideDrawer } from '../../../components/ui/SideDrawer';

const BrandPerformanceChart = dynamic(
  () => import('../../../components/brand/BrandPerformanceChart'),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full pt-2 animate-pulse bg-neutral-100 rounded-xl" />,
  }
);

const PERFORMANCE_DATA = {
  '30D': [
    { label: 'Week 1', impressions: 32000, engagements: 2800 },
    { label: 'Week 2', impressions: 48000, engagements: 4200 },
    { label: 'Week 3', impressions: 72000, engagements: 6100 },
    { label: 'Week 4', impressions: 148200, engagements: 12400 },
  ],
  '90D': [
    { label: 'Aug', impressions: 45000, engagements: 3900 },
    { label: 'Sep', impressions: 89000, engagements: 7800 },
    { label: 'Oct', impressions: 148200, engagements: 12400 },
  ],
  '6M': [
    { label: 'May', impressions: 22000, engagements: 1800 },
    { label: 'Jun', impressions: 36000, engagements: 3100 },
    { label: 'Jul', impressions: 58000, engagements: 5100 },
    { label: 'Aug', impressions: 85000, engagements: 7400 },
    { label: 'Sep', impressions: 112000, engagements: 9800 },
    { label: 'Oct', impressions: 148200, engagements: 12400 },
  ],
  '1Y': [
    { label: 'Q4 25', impressions: 18000, engagements: 1500 },
    { label: 'Q1 26', impressions: 42000, engagements: 3600 },
    { label: 'Q2 26', impressions: 82000, engagements: 7100 },
    { label: 'Q3 26', impressions: 148200, engagements: 12400 },
  ],
};

const RECENT_APPLICATIONS = [
  {
    id: 'app_1',
    creator: {
      name: 'Alex Chen',
      handle: '@alexchen_tech',
      avatar: 'AC',
      niche: 'Fullstack Dev & Cloud',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
    matchScore: 94,
    requestedBudget: '₹45,000',
    status: 'UNDER_REVIEW',
    appliedDate: '2 hours ago',
  },
  {
    id: 'app_2',
    creator: {
      name: 'Sarah Codes',
      handle: '@sarahcodes',
      avatar: 'SC',
      niche: 'AI & Vector Databases',
    },
    campaignTitle: 'AI Vector Database Integration Series',
    matchScore: 89,
    requestedBudget: '₹60,000',
    status: 'IN_DISCUSSION',
    appliedDate: '5 hours ago',
  },
  {
    id: 'app_3',
    creator: {
      name: 'Dev Tips Daily',
      handle: '@devtips',
      avatar: 'DT',
      niche: 'Developer Platform & DevOps',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
    matchScore: 86,
    requestedBudget: '₹35,000',
    status: 'OFFER_RECEIVED',
    appliedDate: '1 day ago',
  },
];

const ACTIVE_CAMPAIGNS_SUMMARY = [
  {
    id: 'camp_1',
    title: 'Cloud Infrastructure Launch & CLI Deep Dive',
    category: 'Cloud & DevOps',
    budget: '₹75,000',
    creatorsCount: 2,
    deliverablesCompleted: 1,
    totalDeliverables: 2,
    status: 'ACTIVE',
    deadline: 'Nov 15, 2026',
  },
  {
    id: 'camp_2',
    title: 'AI Vector Database Integration Series',
    category: 'AI Software',
    budget: '₹95,000',
    creatorsCount: 3,
    deliverablesCompleted: 2,
    totalDeliverables: 3,
    status: 'ACTIVE',
    deadline: 'Nov 28, 2026',
  },
  {
    id: 'camp_3',
    title: 'Fullstack Next.js Deployment Benchmark',
    category: 'Developer Tooling',
    budget: '₹85,000',
    creatorsCount: 2,
    deliverablesCompleted: 2,
    totalDeliverables: 2,
    status: 'COMPLETED',
    deadline: 'Oct 02, 2026',
  },
];

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  timestamp: string | Date;
  iconType: 'proposal' | 'milestone' | 'agreement' | 'payment' | 'campaign';
  href: string;
  status?: string;
}

function getActivityIconConfig(iconType: string) {
  switch (iconType) {
    case 'proposal':
      return {
        icon: Users,
        iconColor: 'text-[#FF6B00]',
        bgColor: 'bg-[#FFF4EB]',
      };
    case 'milestone':
      return {
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      };
    case 'agreement':
      return {
        icon: Sparkles,
        iconColor: 'text-[#FF6B00]',
        bgColor: 'bg-[#FFF4EB]',
      };
    case 'payment':
      return {
        icon: DollarSign,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      };
    case 'campaign':
      return {
        icon: Layers,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    default:
      return {
        icon: Sparkles,
        iconColor: 'text-[#FF6B00]',
        bgColor: 'bg-[#FFF4EB]',
      };
  }
}

export default function BrandDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '6M' | '1Y'>('30D');
  const [loading, setLoading] = useState(false);

  // Activity Drawer State
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Applications & Campaigns Data
  const [applications, setApplications] = useState<any[]>(RECENT_APPLICATIONS);
  const [campaigns, setCampaigns] = useState<any[]>(ACTIVE_CAMPAIGNS_SUMMARY);

  const fetchActivities = useCallback(async (authToken?: string | null) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setActivitiesLoading(false);
      return;
    }

    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await fetchApi<{ data: { activities: ActivityItem[]; unreadCount: number } }>(
        '/api/brands/me/activity',
        {},
        activeToken
      );

      if (res?.data) {
        setActivities(res.data.activities || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        setActivities([]);
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Failed to load activity feed:', err);
      setActivitiesError(err?.message || 'Failed to load activity feed');
    } finally {
      setActivitiesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;

    if (!authLoading) {
      if (user && user.role !== 'BRAND') {
        router.push('/creator/dashboard');
        return;
      }

      const loadBrandData = async () => {
        setLoading(true);
        try {
          if (token) {
            // Load brand profile
            const profileRes = await fetchApi<any>('/api/brands/me', {}, token).catch(() => null);
            if (mounted && profileRes?.data) {
              setBrandProfile(profileRes.data);
            }

            // Load real activities
            if (mounted) {
              fetchActivities(token);
            }

            // Attempt to load real applications if present
            const appsRes = await fetchApi<any>('/api/brands/me/applications', {}, token).catch(() => null);
            if (mounted && appsRes?.data && Array.isArray(appsRes.data) && appsRes.data.length > 0) {
              const mappedApps = appsRes.data.slice(0, 5).map((app: any) => ({
                id: app.id,
                creator: {
                  name: app.creator?.displayName || 'Creator',
                  handle: app.creator?.socialAccounts?.[0]?.username
                    ? `@${app.creator.socialAccounts[0].username}`
                    : '@creator',
                  avatar: (app.creator?.displayName || 'CR').slice(0, 2).toUpperCase(),
                  niche: app.creator?.bio || 'Creator',
                },
                campaignTitle: app.campaign?.title || 'Brand Campaign',
                matchScore: 92,
                requestedBudget: app.proposedRate ? `₹${Number(app.proposedRate).toLocaleString()}` : 'Negotiable',
                status: app.status || 'UNDER_REVIEW',
                appliedDate: new Date(app.createdAt).toLocaleDateString(),
              }));
              setApplications(mappedApps);
            }

            // Attempt to load real campaigns if present
            const campsRes = await fetchApi<any>('/api/brands/me/campaigns', {}, token).catch(() => null);
            if (mounted && campsRes?.data && Array.isArray(campsRes.data) && campsRes.data.length > 0) {
              const mappedCamps = campsRes.data.slice(0, 3).map((camp: any) => ({
                id: camp.id,
                title: camp.title,
                category: camp.contentType || 'Campaign',
                budget: camp.budgetMax ? `₹${Number(camp.budgetMax).toLocaleString()}` : '₹50,000',
                creatorsCount: 1,
                deliverablesCompleted: camp.status === 'COMPLETED' ? 2 : 1,
                totalDeliverables: 2,
                status: camp.status || 'ACTIVE',
                deadline: 'Nov 2026',
              }));
              setCampaigns(mappedCamps);
            }
          }
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadBrandData();
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.role, authLoading, token, router, fetchActivities]);

  const brandDisplayName = brandProfile?.name || user?.displayName || 'Avinya Technologies';
  const chartData = PERFORMANCE_DATA[timeRange];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Workspace Overview"
            titlePrefix="Good morning,"
            highlightText={`${brandDisplayName}.`}
            description="Here's what's happening with your creator campaigns, inbound proposals, and deliverables."
          />

          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Activity Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsActivityDrawerOpen(true)}
              aria-label="View campaign activity"
              className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] hover:border-[#FF6B00]/40 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>Activity</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF6B00] text-white min-w-[18px] h-[18px]">
                  {unreadCount}
                </span>
              )}
            </button>

            <Link
              href="/brand/creators"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] text-xs font-semibold shadow-xs transition"
            >
              <Search className="w-4 h-4 text-[#737373]" />
              <span>Find Creators</span>
            </Link>
          </div>
        </div>

        {/* 2. KPI Metrics Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Active Campaigns */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Active Campaigns
              </span>
              <span className="p-2 rounded-xl bg-[#FFF4EB] text-[#FF6B00]">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#171717]">2</div>
              <p className="text-xs text-[#737373] mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                  +1 scheduled
                </span>
                <span>Next sprint Nov 15</span>
              </p>
            </div>
          </div>

          {/* KPI 2: Creator Partnerships */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Creator Partnerships
              </span>
              <span className="p-2 rounded-xl bg-[#FFF4EB] text-[#FF6B00]">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#171717]">18</div>
              <p className="text-xs text-[#737373] mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                  85%+ fit
                </span>
                <span>pgvector verified</span>
              </p>
            </div>
          </div>

          {/* KPI 3: Pending Applications */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Pending Proposals
              </span>
              <span className="p-2 rounded-xl bg-[#FFF4EB] text-[#FF6B00]">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#FF6B00]">5</div>
              <p className="text-xs text-[#737373] mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
                  Requires review
                </span>
                <span>Avg match 91%</span>
              </p>
            </div>
          </div>

          {/* KPI 4: Total Budget Committed */}
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Budget Committed
              </span>
              <span className="p-2 rounded-xl bg-[#FFF4EB] text-[#FF6B00]">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#171717]">₹2,55,000</div>
              <p className="text-xs text-[#737373] mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                  Escrow secured
                </span>
                <span>Razorpay Escrow</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Performance Chart Card — Expanded to Full Horizontal Width */}
        <div className="w-full bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-[#171717] tracking-tight">
                  Campaign reach & qualified impressions
                </h3>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Verified audience reach across contracted creator publications
              </p>
            </div>

            {/* Time Range Filter Buttons */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] self-start sm:self-auto">
              {(['30D', '90D', '6M', '1Y'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    timeRange === r
                      ? 'bg-[#FF6B00] text-white shadow-xs'
                      : 'text-[#737373] hover:text-[#171717] hover:bg-white/60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Value Header */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl font-extrabold text-[#171717]">148,200</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              +24.8% vs previous window
            </span>
            <span className="text-xs text-[#737373] ml-auto hidden sm:inline">
              Cost per impression: <strong className="text-[#171717]">₹1.72</strong>
            </span>
          </div>

          {/* Dynamic Brand Performance Chart */}
          <BrandPerformanceChart data={chartData} />

          {/* Sub-Metric Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7E1DA]">
            <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]/80">
              <span className="text-[11px] text-[#737373] block">Avg Match Fit</span>
              <span className="text-sm font-bold text-[#171717] mt-0.5 block">91.4%</span>
            </div>
            <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]/80">
              <span className="text-[11px] text-[#737373] block">Deliverables Delivered</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">5 of 7</span>
            </div>
            <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]/80">
              <span className="text-[11px] text-[#737373] block">On-Time Completion</span>
              <span className="text-sm font-bold text-[#171717] mt-0.5 block">100%</span>
            </div>
          </div>
        </div>

        {/* 4. Lower Dashboard Grid: Reorganized Immediately Below the Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Inbound Applications (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
              <div>
                <h3 className="text-base font-bold text-[#171717] tracking-tight">
                  Recent Inbound Applications
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Proposals submitted by creators matching your campaign requirements
                </p>
              </div>

              <Link
                href="/brand/applications"
                className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all ({applications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2]/40 hover:bg-[#F8F6F2] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {app.creator.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-[#171717] truncate">
                          {app.creator.name}
                        </h4>
                        <StarRating rating={4.9} size="xs" />
                        <span className="text-[11px] text-[#737373]">{app.creator.handle}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold">
                          {app.matchScore}% match
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] truncate mt-0.5">
                        {app.campaignTitle}
                      </p>
                      <span className="text-[11px] text-[#737373] block mt-0.5">
                        Budget: <strong className="text-[#171717]">{app.requestedBudget}</strong> • {app.appliedDate}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/brand/applications"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#FFF4EB] hover:text-[#FF6B00] text-xs font-semibold shadow-2xs transition self-start sm:self-center shrink-0"
                  >
                    <span>Review</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Active Campaigns Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
              <div>
                <h3 className="text-base font-bold text-[#171717] tracking-tight">
                  Active Campaigns
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Live partner sprints & deliverable delivery tracking
                </p>
              </div>

              <Link
                href="/brand/campaigns"
                className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Campaign Cards List */}
            <div className="space-y-3">
              {campaigns.map((camp) => {
                const percent = Math.round(
                  (camp.deliverablesCompleted / camp.totalDeliverables) * 100
                );
                return (
                  <div
                    key={camp.id}
                    className="p-4 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2]/40 hover:bg-[#F8F6F2] transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
                          {camp.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#171717] truncate mt-0.5">
                          {camp.title}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-[#171717] shrink-0">
                        {camp.budget}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#737373]">
                        <span>
                          {camp.deliverablesCompleted} of {camp.totalDeliverables} deliverables
                        </span>
                        <span className="font-semibold text-[#171717]">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E7E1DA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Unobtrusive Right-Edge Trigger on Desktop */}
      <button
        type="button"
        onClick={() => setIsActivityDrawerOpen(true)}
        aria-label="Toggle Activity Feed"
        title="Campaign Activity"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-1.5 px-2 py-3 bg-white hover:bg-[#FFF4EB] border-l border-y border-[#E7E1DA] rounded-l-xl shadow-md text-[#171717] hover:text-[#FF6B00] transition cursor-pointer group"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#FF6B00]" />
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] group-hover:text-[#FF6B00] [writing-mode:vertical-rl] rotate-180">
          Activity
        </span>
      </button>

      {/* Collapsible Activity Drawer */}
      <SideDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        widthClassName="max-w-md w-full sm:max-w-lg"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        title={
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-base sm:text-lg font-bold text-[#171717]">
              Campaign Activity
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FF6B00] text-white">
                {unreadCount} new
              </span>
            )}
          </div>
        }
        subtitle="Live feed of proposals, milestone updates, agreements, and payments"
        footerContent={
          <Link
            href="/brand/collaborations"
            onClick={() => setIsActivityDrawerOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F8F6F2] hover:bg-[#FFF4EB] text-[#171717] hover:text-[#FF6B00] border border-[#E7E1DA] text-xs font-semibold transition"
          >
            <span>View All Collaborations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="space-y-4">
          {/* Loading State */}
          {activitiesLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F2]/60">
                  <div className="w-9 h-9 rounded-xl bg-[#E7E1DA] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-[#E7E1DA] rounded w-1/2" />
                    <div className="h-3 bg-[#E7E1DA] rounded w-5/6" />
                    <div className="h-2.5 bg-[#E7E1DA] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!activitiesLoading && activitiesError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-700 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{activitiesError}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchActivities()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/50 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!activitiesLoading && !activitiesError && activities.length === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171717]">No activity recorded yet</h4>
              <p className="text-xs text-[#737373] max-w-xs mx-auto leading-relaxed">
                When creators apply to campaigns, update milestones, or receive escrow compensation, real updates will appear here.
              </p>
            </div>
          )}

          {/* Actual Activity List */}
          {!activitiesLoading && !activitiesError && activities.length > 0 && (
            <div className="space-y-3">
              {activities.map((event) => {
                const iconConfig = getActivityIconConfig(event.iconType);
                const IconComponent = iconConfig.icon;
                return (
                  <Link
                    key={event.id}
                    href={event.href || '/brand/collaborations'}
                    onClick={() => setIsActivityDrawerOpen(false)}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl border border-[#E7E1DA]/80 bg-[#F8F6F2]/30 hover:bg-[#F8F6F2] hover:border-[#FF6B00]/40 transition group cursor-pointer"
                  >
                    <span
                      className={`p-2.5 rounded-xl shrink-0 ${iconConfig.bgColor} ${iconConfig.iconColor} transition group-hover:scale-105`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-[#171717] group-hover:text-[#FF6B00] transition truncate">
                          {event.title}
                        </h4>
                        <span className="text-[10px] text-[#737373] shrink-0 font-medium">
                          {event.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                        {event.description}
                      </p>
                      {event.status && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                            {event.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </SideDrawer>
    </div>
  );
}
