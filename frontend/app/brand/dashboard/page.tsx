'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Layers,
  Users,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  BarChart3,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Check,
  ChevronRight,
  Send,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';

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

const RECENT_ACTIVITY_EVENTS = [
  {
    id: 'act_1',
    title: 'New proposal received',
    description: 'Alex Chen applied to Cloud Infrastructure Launch',
    time: '12m ago',
    icon: Users,
    iconColor: 'text-[#FF6B00]',
    bgColor: 'bg-[#FFF4EB]',
  },
  {
    id: 'act_2',
    title: 'Milestone draft reviewed',
    description: 'Sarah Codes submitted 12-min YouTube tutorial rough cut',
    time: '2h ago',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'act_3',
    title: 'Agreement signed',
    description: 'TechFlow sponsorship terms approved for ₹95,000',
    time: 'Yesterday',
    icon: Sparkles,
    iconColor: 'text-[#FF6B00]',
    bgColor: 'bg-[#FFF4EB]',
  },
  {
    id: 'act_4',
    title: 'Escrow payment verified',
    description: 'Milestone 1 compensation released to Alex Chen',
    time: '2 days ago',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export default function BrandDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '6M' | '1Y'>('30D');
  const [loading, setLoading] = useState(false);

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
            const res = await fetchApi<any>('/api/brands/me', {}, token).catch(() => null);
            if (mounted && res?.data) {
              setBrandProfile(res.data);
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
  }, [user?.id, user?.role, authLoading, token, router]);

  const brandDisplayName = brandProfile?.name || user?.displayName || 'Acme Cloud';
  const chartData = PERFORMANCE_DATA[timeRange];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Workspace Overview"
            titlePrefix="Good morning,"
            highlightText={`${brandDisplayName}.`}
            description="Here's what's happening with your creator campaigns, inbound proposals, and deliverables."
          />

          <div className="flex items-center gap-3 self-start md:self-center">
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

        {/* 3. Performance Chart & Campaign Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Campaign Performance Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-6 flex flex-col justify-between">
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
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E7E1DA]">
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

          {/* Right: Campaign Activity Feed (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-[#171717] tracking-tight">
                    Campaign Activity
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">Live Feed</span>
              </div>

              {/* Event List */}
              <div className="mt-4 space-y-4">
                {RECENT_ACTIVITY_EVENTS.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="flex items-start gap-3">
                      <span className={`p-2 rounded-xl shrink-0 ${event.bgColor} ${event.iconColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#171717] truncate">
                            {event.title}
                          </h4>
                          <span className="text-[10px] text-[#737373] shrink-0">{event.time}</span>
                        </div>
                        <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Link to Collaborations */}
            <div className="pt-4 border-t border-[#E7E1DA]">
              <Link
                href="/brand/collaborations"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F8F6F2] hover:bg-[#FFF4EB] text-[#171717] hover:text-[#FF6B00] border border-[#E7E1DA] text-xs font-semibold transition"
              >
                <span>View All Collaborations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Bottom Grid: Recent Applications & Active Campaigns */}
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
                <span>View all (5)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              {RECENT_APPLICATIONS.map((app) => (
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
              {ACTIVE_CAMPAIGNS_SUMMARY.map((camp) => {
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
    </div>
  );
}
