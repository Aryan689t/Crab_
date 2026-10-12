'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Users,
  Eye,
  TrendingUp,
  Mail,
  ShieldCheck,
  AlertCircle,
  MoreHorizontal,
  Youtube,
  Instagram,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { StarRating } from '../../../components/ui/StarRating';

export type OpportunityType = 'application' | 'invitation';

export interface OpportunityItem {
  id: string;
  sourceType: OpportunityType;
  title: string;
  campaignTitle: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarInitials: string;
  rating?: number;
  status: string;
  statusLabel: string;
  timeAgo: string;
  createdAt: string;
  isUnread?: boolean;
  message: string;
  budget?: string;
  proposedBudget?: string;
  tags: string[];
  youtubeStats?: string;
  instagramStats?: string;
  rawBrandId?: string;
  rawCampaignId?: string;
  conversationId?: string;
  creatorProfile?: {
    subscribers: string;
    followers: string;
    engagementRate: string;
    primaryNiche: string;
  };
  relevantContent?: Array<{
    id: string;
    title: string;
    duration: string;
    views: string;
    timeAgo: string;
    thumbnailUrl?: string;
  }>;
}

const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp_1',
    sourceType: 'application',
    title: 'Cloud Creator Program',
    campaignTitle: 'Cloud Creator Program',
    name: 'Alex Chen',
    handle: '@alexchen_tech',
    avatarInitials: 'AC',
    rating: 4.8,
    status: 'UNDER_REVIEW',
    statusLabel: 'Application',
    timeAgo: '2 hours ago',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isUnread: true,
    message:
      "Hi! I'd love to collaborate on this campaign. My recent videos on cloud architecture and AWS tutorials have performed really well, and I think this aligns perfectly with my audience. Let me know if you'd like any additional information!",
    budget: '₹45,000',
    tags: ['Cloud Computing', 'Developer Tools', 'Tech Education'],
    youtubeStats: '124K',
    instagramStats: '48K',
    creatorProfile: {
      subscribers: '124K',
      followers: '48K',
      engagementRate: '5.6%',
      primaryNiche: 'Tech Education',
    },
    relevantContent: [
      {
        id: 'v1',
        title: 'AWS for Beginners – Full Course (2024)',
        duration: '14:22',
        views: '2.1M views',
        timeAgo: '3 weeks ago',
      },
      {
        id: 'v2',
        title: 'Deploy a Next.js App on AWS',
        duration: '10:15',
        views: '980K views',
        timeAgo: '1 month ago',
      },
      {
        id: 'v3',
        title: 'Cloud Architecture Explained Simply',
        duration: '8:37',
        views: '620K views',
        timeAgo: '1 month ago',
      },
    ],
  },
  {
    id: 'opp_2',
    sourceType: 'application',
    title: 'AI Coding Tools Campaign',
    campaignTitle: 'AI Coding Tools Campaign',
    name: 'Sarah Codes',
    handle: '@sarahcodes',
    avatarInitials: 'SC',
    rating: 4.7,
    status: 'IN_DISCUSSION',
    statusLabel: 'Application',
    timeAgo: '5 hours ago',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    isUnread: false,
    message:
      'I create in-depth tutorials on developer tools and AI. This campaign matches my upcoming video series on developer workflows and LLM-assisted coding.',
    budget: '₹60,000',
    tags: ['AI Tools', 'Programming'],
    youtubeStats: '85K',
    instagramStats: '62K',
    creatorProfile: {
      subscribers: '85K',
      followers: '62K',
      engagementRate: '6.2%',
      primaryNiche: 'AI & Engineering',
    },
    relevantContent: [
      {
        id: 'v4',
        title: 'Top 5 AI Code Assistants Benchmarked',
        duration: '12:40',
        views: '1.4M views',
        timeAgo: '2 weeks ago',
      },
      {
        id: 'v5',
        title: 'Vector Databases in 100 Seconds',
        duration: '3:15',
        views: '450K views',
        timeAgo: '1 month ago',
      },
    ],
  },
  {
    id: 'opp_3',
    sourceType: 'application',
    title: 'Productivity for Creators',
    campaignTitle: 'Productivity for Creators',
    name: 'Dev Diaries',
    handle: '@devdiaries',
    avatarInitials: 'DD',
    rating: 4.6,
    status: 'OFFER_RECEIVED',
    statusLabel: 'Application',
    timeAgo: '1 day ago',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    isUnread: false,
    message:
      'I focus on productivity tools and developer workflows. I think I am a great match to showcase how this system speeds up daily operations.',
    budget: '₹35,000',
    tags: ['Productivity', 'Developer Lifestyle'],
    youtubeStats: '62K',
    instagramStats: '38K',
    creatorProfile: {
      subscribers: '62K',
      followers: '38K',
      engagementRate: '4.8%',
      primaryNiche: 'Productivity & Workflows',
    },
    relevantContent: [
      {
        id: 'v6',
        title: 'My Minimalist Engineering Setup for 2024',
        duration: '9:50',
        views: '780K views',
        timeAgo: '3 weeks ago',
      },
    ],
  },
  {
    id: 'opp_4',
    sourceType: 'invitation',
    title: 'Creator Partnership Invitation',
    campaignTitle: 'Creator Partnership Invitation',
    name: 'Notion Creators',
    handle: '@notion_hq',
    avatarInitials: 'N',
    status: 'PENDING',
    statusLabel: 'Brand Invitation',
    timeAgo: '2 days ago',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    isUnread: true,
    message:
      "We'd love to invite you to our upcoming creator program focused on Notion for developers and technical productivity. Let us know if you have availability to collaborate this quarter!",
    budget: '₹40,000 – ₹75,000',
    tags: ['Productivity', 'Notion'],
    rawBrandId: 'demo_brand_notion',
    rawCampaignId: 'demo_cmp_notion',
    relevantContent: [
      {
        id: 'v7',
        title: 'Building a Second Brain in Notion for Engineers',
        duration: '16:04',
        views: '1.8M views',
        timeAgo: '2 months ago',
      },
    ],
  },
  {
    id: 'opp_5',
    sourceType: 'invitation',
    title: 'Cloud Infrastructure Series',
    campaignTitle: 'Cloud Infrastructure Series',
    name: 'AWS Developer Relations',
    handle: '@awscloud',
    avatarInitials: 'AWS',
    status: 'PENDING',
    statusLabel: 'Brand Invitation',
    timeAgo: '3 days ago',
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    isUnread: true,
    message:
      "We're inviting you to be part of our cloud infrastructure content series targeting fullstack engineers. We'd love a dedicated breakdown video on serverless container workflows.",
    budget: '₹75,000 – ₹1,00,000',
    tags: ['Cloud Computing', 'DevOps'],
    rawBrandId: 'demo_brand_01',
    rawCampaignId: 'demo_cmp_aws_01',
    relevantContent: [
      {
        id: 'v8',
        title: 'Serverless Microservices with AWS ECS and Fargate',
        duration: '18:30',
        views: '2.5M views',
        timeAgo: '1 month ago',
      },
    ],
  },
  {
    id: 'opp_6',
    sourceType: 'application',
    title: 'Developer Tools Campaign',
    campaignTitle: 'Developer Tools Campaign',
    name: 'JetBrains',
    handle: '@jetbrains',
    avatarInitials: 'JB',
    rating: 4.5,
    status: 'ACCEPTED',
    statusLabel: 'Application',
    timeAgo: '4 days ago',
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    isUnread: false,
    message:
      'Proposal approved for IDE extension deep dive and developer tips series featuring WebStorm and RustRover.',
    budget: '₹55,000',
    tags: ['IDEs', 'Dev Tools'],
    youtubeStats: '110K',
    instagramStats: '35K',
    creatorProfile: {
      subscribers: '110K',
      followers: '35K',
      engagementRate: '5.1%',
      primaryNiche: 'Software Engineering',
    },
    relevantContent: [
      {
        id: 'v9',
        title: '10 WebStorm Shortcuts That Save 2 Hours a Day',
        duration: '11:12',
        views: '640K views',
        timeAgo: '3 weeks ago',
      },
    ],
  },
  {
    id: 'opp_7',
    sourceType: 'invitation',
    title: 'Next-Gen Editor Sponsorship',
    campaignTitle: 'Next-Gen Editor Sponsorship',
    name: 'Cursor AI',
    handle: '@cursor_editor',
    avatarInitials: 'CR',
    status: 'PENDING',
    statusLabel: 'Brand Invitation',
    timeAgo: '5 days ago',
    createdAt: new Date(Date.now() - 120 * 3600000).toISOString(),
    isUnread: false,
    message:
      'We think your technical coding tutorials are an ideal fit for our engineer audience. We would love to sponsor your next fullstack build video!',
    budget: '₹60,000 – ₹95,000',
    tags: ['AI Coding', 'Editor'],
    rawBrandId: 'demo_brand_02',
    rawCampaignId: 'demo_cmp_veloce_02',
    relevantContent: [
      {
        id: 'v10',
        title: 'Building a Fullstack App with Cursor AI in 30 Minutes',
        duration: '22:15',
        views: '1.2M views',
        timeAgo: '1 month ago',
      },
    ],
  },
  {
    id: 'opp_8',
    sourceType: 'application',
    title: 'Ergonomic Creator Setup Series',
    campaignTitle: 'Ergonomic Creator Setup Series',
    name: 'Logitech G',
    handle: '@logitech',
    avatarInitials: 'LG',
    rating: 4.6,
    status: 'UNDER_REVIEW',
    statusLabel: 'Application',
    timeAgo: '1 week ago',
    createdAt: new Date(Date.now() - 168 * 3600000).toISOString(),
    isUnread: false,
    message:
      'Application submitted for mechanical keyboard & ergonomic mouse review for remote developers and creators.',
    budget: '₹35,000',
    tags: ['Hardware', 'Workstations'],
    youtubeStats: '95K',
    instagramStats: '50K',
    creatorProfile: {
      subscribers: '95K',
      followers: '50K',
      engagementRate: '4.5%',
      primaryNiche: 'Developer Hardware',
    },
    relevantContent: [
      {
        id: 'v11',
        title: 'Best Developer Keyboards for Typing Speed and Ergonomics',
        duration: '13:05',
        views: '510K views',
        timeAgo: '2 weeks ago',
      },
    ],
  },
];

function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  // Primary Tab state: 'All Opportunities' | 'Creator Applications' | 'Brand Invitations'
  const paramTab = searchParams.get('tab');
  const initialTab =
    paramTab === 'applications'
      ? 'Creator Applications'
      : paramTab === 'invitations'
      ? 'Brand Invitations'
      : 'All Opportunities';

  const [activeTab, setActiveTab] = useState<'All Opportunities' | 'Creator Applications' | 'Brand Invitations'>(
    initialTab as any
  );

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(DEFAULT_OPPORTUNITIES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_OPPORTUNITIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'content' | 'audience' | 'whyFits'>('content');

  // Action states
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Mobile detail view toggle
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // 1. Fetch real applications and conversations from backend
  const loadRealOpportunities = useCallback(async () => {
    if (!token) return;

    try {
      const [appsRes, convsRes, metricsRes] = await Promise.allSettled([
        fetchApi<{ data: any[] }>('/api/creators/me/applications', {}, token),
        fetchApi<{ data: any[] }>('/api/conversations', {}, token),
        fetchApi<{ data: any }>('/api/creators/me/metrics', {}, token),
      ]);

      const liveItems: OpportunityItem[] = [];

      // Extract verified metrics if available
      const verifiedProfile =
        metricsRes.status === 'fulfilled' && metricsRes.value?.data
          ? {
              subscribers: metricsRes.value.data.followers
                ? `${(metricsRes.value.data.followers / 1000).toFixed(0)}K`
                : '124K',
              followers: metricsRes.value.data.followers
                ? `${(metricsRes.value.data.followers / 1000).toFixed(0)}K`
                : '48K',
              engagementRate: metricsRes.value.data.engagementRate
                ? `${metricsRes.value.data.engagementRate}%`
                : '5.6%',
              primaryNiche: 'Tech Education',
            }
          : undefined;

      // 1. Map real applications
      if (appsRes.status === 'fulfilled' && appsRes.value?.data && Array.isArray(appsRes.value.data)) {
        appsRes.value.data.forEach((app: any) => {
          const brandName = app.campaign?.brand?.name || 'Partner Brand';
          const campaignTitle = app.campaign?.title || 'Brand Campaign';
          const budgetStr = app.proposedRate
            ? `₹${Number(app.proposedRate).toLocaleString()}`
            : app.campaign?.budgetMax
            ? `₹${Number(app.campaign.budgetMax).toLocaleString()}`
            : '₹45,000';

          liveItems.push({
            id: `app_${app.id}`,
            sourceType: 'application',
            title: campaignTitle,
            campaignTitle,
            name: brandName,
            handle: `@${brandName.toLowerCase().replace(/\s+/g, '')}`,
            avatarInitials: brandName.slice(0, 2).toUpperCase(),
            rating: 4.8,
            status: app.status || 'UNDER_REVIEW',
            statusLabel: 'Application',
            timeAgo: new Date(app.createdAt).toLocaleDateString(),
            createdAt: app.createdAt,
            isUnread: false,
            message: app.pitch || 'Application submitted with creator proposal and deliverables terms.',
            budget: budgetStr,
            tags: [app.campaign?.platform || 'YouTube', 'Sponsorship'],
            rawCampaignId: app.campaignId,
            creatorProfile: verifiedProfile,
          });
        });
      }

      // 2. Map real invitations (conversations initiated by brand)
      if (convsRes.status === 'fulfilled' && convsRes.value?.data && Array.isArray(convsRes.value.data)) {
        convsRes.value.data.forEach((conv: any) => {
          const brandName = conv.brand?.name || 'Inviting Brand';
          const campaignTitle = conv.campaign?.title || 'Collaboration Invitation';
          const firstMsg =
            conv.messages?.[0]?.messageText ||
            "We'd love to partner with you on an upcoming developer content series!";
          const budgetStr = conv.campaign?.budgetMin
            ? `₹${Number(conv.campaign.budgetMin).toLocaleString()} – ₹${Number(
                conv.campaign.budgetMax || conv.campaign.budgetMin * 1.5
              ).toLocaleString()}`
            : '₹50,000 – ₹80,000';

          liveItems.push({
            id: `inv_${conv.id}`,
            sourceType: 'invitation',
            title: campaignTitle,
            campaignTitle,
            name: brandName,
            handle: `@${brandName.toLowerCase().replace(/\s+/g, '')}`,
            avatarInitials: brandName.slice(0, 2).toUpperCase(),
            status: conv.collaborationId ? 'ACCEPTED' : 'PENDING',
            statusLabel: 'Brand Invitation',
            timeAgo: new Date(conv.createdAt).toLocaleDateString(),
            createdAt: conv.createdAt,
            isUnread: true,
            message: firstMsg,
            budget: budgetStr,
            tags: [conv.brand?.category || 'Technology', 'Partnership'],
            rawBrandId: conv.brandId,
            rawCampaignId: conv.campaignId,
            conversationId: conv.id,
            creatorProfile: verifiedProfile,
          });
        });
      }

      // If we found live records, combine with DEFAULT_OPPORTUNITIES (avoiding key collisions)
      if (liveItems.length > 0) {
        setOpportunities((prev) => {
          const liveIds = new Set(liveItems.map((item) => item.id));
          const filteredDefaults = prev.filter((item) => !liveIds.has(item.id));
          return [...liveItems, ...filteredDefaults];
        });
      }
    } catch (err) {
      console.warn('[OPPORTUNITIES] Failed to load backend opportunities:', err);
    }
  }, [token]);

  useEffect(() => {
    loadRealOpportunities();
  }, [loadRealOpportunities]);

  // Tab counts
  const counts = useMemo(() => {
    const total = opportunities.length;
    const apps = opportunities.filter((o) => o.sourceType === 'application').length;
    const invs = opportunities.filter((o) => o.sourceType === 'invitation').length;
    return { total, apps, invs };
  }, [opportunities]);

  // Filtered list based on active primary tab, search query, and status filter
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      // 1. Primary Tab filter
      if (activeTab === 'Creator Applications' && item.sourceType !== 'application') {
        return false;
      }
      if (activeTab === 'Brand Invitations' && item.sourceType !== 'invitation') {
        return false;
      }

      // 2. Status filter
      if (statusFilter !== 'ALL') {
        if (item.status !== statusFilter) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTitle = item.campaignTitle.toLowerCase().includes(q);
        const matchesHandle = item.handle.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesMessage = item.message.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesHandle && !matchesTags && !matchesMessage) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, activeTab, statusFilter, searchQuery]);

  // Selected item
  const selectedOpportunity = useMemo(() => {
    const found = filteredOpportunities.find((o) => o.id === selectedId);
    return found || filteredOpportunities[0] || opportunities[0];
  }, [filteredOpportunities, selectedId, opportunities]);

  // Keep selected ID consistent
  useEffect(() => {
    if (selectedOpportunity && selectedOpportunity.id !== selectedId) {
      setSelectedId(selectedOpportunity.id);
    }
  }, [selectedOpportunity, selectedId]);

  // Handle Invitation Acceptance
  const handleAcceptInvitation = async () => {
    if (!selectedOpportunity || isAccepting) return;
    setIsAccepting(true);
    setActionError(null);
    setActionFeedback(null);

    try {
      const targetId = selectedOpportunity.conversationId || selectedOpportunity.id;

      if (token) {
        const res = await fetchApi<any>(
          `/api/requests/${targetId}/accept`,
          {
            method: 'POST',
            body: JSON.stringify({
              brandId: selectedOpportunity.rawBrandId,
              campaignId: selectedOpportunity.rawCampaignId,
              snippet: selectedOpportunity.message,
              budget: selectedOpportunity.budget,
            }),
          },
          token
        ).catch(() => null);

        // Update local opportunity status to ACCEPTED
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === selectedOpportunity.id
              ? { ...o, status: 'ACCEPTED', statusLabel: 'Accepted' }
              : o
          )
        );

        setActionFeedback('Invitation accepted! Navigating to your collaboration thread in Inbox...');
        const convId = res?.data?.conversationId || selectedOpportunity.conversationId;
        setTimeout(() => {
          if (convId) {
            router.push(`/creator/inbox?conversationId=${convId}`);
          } else {
            router.push('/creator/inbox');
          }
        }, 1200);
      } else {
        // Optimistic acceptance when not authenticated
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === selectedOpportunity.id
              ? { ...o, status: 'ACCEPTED', statusLabel: 'Accepted' }
              : o
          )
        );
        setActionFeedback('Invitation accepted! Navigating to Inbox...');
        setTimeout(() => router.push('/creator/inbox'), 1000);
      }
    } catch (err: any) {
      console.error('[OPPORTUNITIES] Failed to accept invitation:', err);
      setActionError(err?.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle Invitation Decline
  const handleDeclineInvitation = async () => {
    if (!selectedOpportunity) return;
    const confirmed = window.confirm(`Decline collaboration invitation from "${selectedOpportunity.name}"?`);
    if (!confirmed) return;

    try {
      const targetId = selectedOpportunity.conversationId || selectedOpportunity.id;
      if (token) {
        await fetchApi<any>(
          `/api/requests/${targetId}/decline`,
          { method: 'POST' },
          token
        ).catch(() => null);
      }

      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === selectedOpportunity.id
            ? { ...o, status: 'DECLINED', statusLabel: 'Declined' }
            : o
        )
      );
      setActionFeedback(`Declined invitation from ${selectedOpportunity.name}.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('[OPPORTUNITIES] Failed to decline invitation:', err);
      setActionError(err?.message || 'Failed to decline invitation.');
    }
  };

  // Toggle Read Status
  const handleToggleRead = () => {
    if (!selectedOpportunity) return;
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === selectedOpportunity.id ? { ...o, isUnread: !o.isUnread } : o
      )
    );
  };

  // Open inbox conversation
  const handleDiscussInInbox = () => {
    if (selectedOpportunity.conversationId) {
      router.push(`/creator/inbox?conversationId=${selectedOpportunity.conversationId}`);
    } else {
      router.push('/creator/inbox');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. Page Header (Editorial Serif Style Matching Screenshot) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#171717] tracking-tight">
              Your collaboration{' '}
              <span className="text-[#FF6B00] italic font-normal">opportunities.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1.5">
              Manage all creator applications and your brand invitations in one place.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2.5 self-stretch lg:self-center">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators, campaigns..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E7E1DA] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#FF6B00] shadow-xs transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 rounded-xl border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] transition shadow-xs cursor-pointer ${
                  statusFilter !== 'ALL' ? 'border-[#FF6B00] text-[#FF6B00]' : 'text-[#737373]'
                }`}
                title="Filter options"
                aria-label="Filter options"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Status Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E1DA] rounded-xl shadow-lg z-30 p-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] px-2 block">
                    Status Filter
                  </span>
                  {[
                    { id: 'ALL', label: 'All Statuses' },
                    { id: 'UNDER_REVIEW', label: 'Under Review' },
                    { id: 'IN_DISCUSSION', label: 'In Discussion' },
                    { id: 'OFFER_RECEIVED', label: 'Offer Received' },
                    { id: 'PENDING', label: 'Pending Invitations' },
                    { id: 'ACCEPTED', label: 'Accepted' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st.id);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        statusFilter === st.id
                          ? 'bg-[#FFF4EB] text-[#FF6B00]'
                          : 'text-[#171717] hover:bg-[#F8F6F2]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Primary Tabs: All Opportunities | Creator Applications | Brand Invitations */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
          {/* Tab 1: All Opportunities */}
          <button
            type="button"
            onClick={() => setActiveTab('All Opportunities')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              activeTab === 'All Opportunities'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-white text-[#737373] hover:text-[#171717] border border-[#E7E1DA] hover:bg-[#F8F6F2]'
            }`}
          >
            <span>All Opportunities</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'All Opportunities'
                  ? 'bg-white text-[#FF6B00]'
                  : 'bg-[#F8F6F2] text-[#171717]'
              }`}
            >
              {counts.total}
            </span>
          </button>

          {/* Tab 2: Creator Applications */}
          <button
            type="button"
            onClick={() => setActiveTab('Creator Applications')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              activeTab === 'Creator Applications'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-white text-[#737373] hover:text-[#171717] border border-[#E7E1DA] hover:bg-[#F8F6F2]'
            }`}
          >
            <span>Creator Applications</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'Creator Applications'
                  ? 'bg-white text-[#FF6B00]'
                  : 'bg-[#F8F6F2] text-[#171717]'
              }`}
            >
              {counts.apps}
            </span>
          </button>

          {/* Tab 3: Brand Invitations */}
          <button
            type="button"
            onClick={() => setActiveTab('Brand Invitations')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              activeTab === 'Brand Invitations'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-white text-[#737373] hover:text-[#171717] border border-[#E7E1DA] hover:bg-[#F8F6F2]'
            }`}
          >
            <span>Brand Invitations</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'Brand Invitations'
                  ? 'bg-white text-[#FF6B00]'
                  : 'bg-[#F8F6F2] text-[#171717]'
              }`}
            >
              {counts.invs}
            </span>
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-700 hover:text-red-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. Main Two-Column Collaboration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Vertically Scrollable Opportunity Cards List (~50%) */}
          <div
            className={`lg:col-span-6 space-y-3 ${
              mobileDetailOpen ? 'hidden lg:block' : 'block'
            }`}
          >
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-[#E7E1DA] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#171717]">No opportunities found</h3>
                <p className="text-xs text-[#737373] max-w-sm mx-auto">
                  No records match your selected filters. Try switching tabs or searching for other keywords.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setActiveTab('All Opportunities');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#FF6B00] text-white text-xs font-semibold transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1 hide-scrollbar">
                {filteredOpportunities.map((item) => {
                  const isSelected = selectedOpportunity?.id === item.id;
                  const isApp = item.sourceType === 'application';

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setMobileDetailOpen(true);
                      }}
                      className={`p-4 rounded-2xl transition cursor-pointer relative bg-white ${
                        isSelected
                          ? 'border-2 border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/20'
                          : 'border border-[#E7E1DA] hover:border-[#FF6B00]/40 hover:bg-[#F8F6F2]/30'
                      }`}
                    >
                      {/* Top Row: Checkbox, Avatar, Name, Rating, Handle, Badge, Time */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox square indicator */}
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#FF6B00] bg-[#FFF4EB]'
                                : 'border-[#E7E1DA] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-xs bg-[#FF6B00]" />}
                          </div>

                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.avatarInitials
                            )}
                          </div>

                          {/* Name, Rating, Handle */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#171717] truncate">
                                {item.name}
                              </span>
                              {item.rating && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                                  <span>{item.rating}</span>
                                  <span>★</span>
                                </span>
                              )}
                              <span className="text-[11px] text-[#737373] truncate">
                                {item.handle}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Badge & Time */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isApp ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold">
                              Application
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[#FF6B00] text-[10px] font-bold">
                              Brand Invitation
                            </span>
                          )}
                          <span className="text-[10px] text-[#737373]">{item.timeAgo}</span>
                        </div>
                      </div>

                      {/* Campaign Title */}
                      <div className="mt-2.5 pl-7">
                        <h3 className="text-sm font-bold text-[#171717] tracking-tight">
                          {item.campaignTitle}
                        </h3>
                        <p className="text-xs text-[#737373] mt-1 line-clamp-1 leading-relaxed">
                          {item.message}
                        </p>
                      </div>

                      {/* Bottom Meta Tags / Stats Strip */}
                      <div className="mt-3 pl-7 flex items-center gap-2 flex-wrap text-[11px] text-[#737373]">
                        {/* Stats if available */}
                        {item.youtubeStats && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#171717]">
                            <Youtube className="w-3.5 h-3.5 text-red-600" />
                            <span>{item.youtubeStats}</span>
                          </span>
                        )}
                        {item.instagramStats && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#171717]">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                            <span>{item.instagramStats}</span>
                          </span>
                        )}
                        {/* Budget if invitation */}
                        {item.budget && !item.youtubeStats && (
                          <span className="font-bold text-[#171717]">{item.budget}</span>
                        )}

                        {/* Topic Tags */}
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-[#F8F6F2] border border-[#E7E1DA] text-[10px] font-medium text-[#737373]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Opportunity Detail Panel (~50%) */}
          <div
            className={`lg:col-span-6 ${
              mobileDetailOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {selectedOpportunity ? (
              <div className="bg-white rounded-2xl border border-[#E7E1DA] p-5 sm:p-6 shadow-xs space-y-6 sticky top-6">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] mb-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Opportunity List</span>
                </button>

                {/* 1. Header Row */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7E1DA]">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Large Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-xs">
                      {selectedOpportunity.avatarUrl ? (
                        <img
                          src={selectedOpportunity.avatarUrl}
                          alt={selectedOpportunity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedOpportunity.avatarInitials
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-[#171717]">
                          {selectedOpportunity.name}
                        </h2>
                        {selectedOpportunity.rating && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                            <span>{selectedOpportunity.rating}</span>
                            <span>★</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#737373] block mt-0.5">
                        {selectedOpportunity.handle}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        {selectedOpportunity.sourceType === 'application' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold">
                            Application
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[#FF6B00] text-[10px] font-bold">
                            Brand Invitation
                          </span>
                        )}
                        <span className="text-xs text-[#737373]">{selectedOpportunity.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions: Mark as Read & Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleRead}
                      className="px-3 py-1.5 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition shadow-xs cursor-pointer"
                    >
                      {selectedOpportunity.isUnread ? 'Mark as Read' : 'Mark Unread'}
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-[#737373] transition cursor-pointer"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Campaign Title & Meta Badges */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#171717] tracking-tight">
                    {selectedOpportunity.campaignTitle}
                  </h3>
                  <div className="flex items-center gap-2.5 flex-wrap text-xs text-[#737373]">
                    {selectedOpportunity.youtubeStats && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#171717]">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span>{selectedOpportunity.youtubeStats}</span>
                      </span>
                    )}
                    {selectedOpportunity.instagramStats && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#171717]">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span>{selectedOpportunity.instagramStats}</span>
                      </span>
                    )}
                    {selectedOpportunity.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-md bg-[#F8F6F2] border border-[#E7E1DA] text-[11px] font-medium text-[#737373]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Message Section (Application Message / Brand Invitation Note) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
                    {selectedOpportunity.sourceType === 'application'
                      ? 'Application Message'
                      : 'Brand Invitation Message'}
                  </span>
                  <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs sm:text-sm text-[#171717] leading-relaxed">
                    {selectedOpportunity.message}
                  </div>
                  {selectedOpportunity.budget && (
                    <div className="text-xs text-[#737373] pt-1 flex items-center gap-1.5">
                      <span>Proposed Compensation:</span>
                      <strong className="text-[#171717]">{selectedOpportunity.budget}</strong>
                    </div>
                  )}
                </div>

                {/* 3. Creator Quick Profile (Matching Screenshot) */}
                {selectedOpportunity.creatorProfile && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                        Creator Quick Profile
                      </span>
                      <Link
                        href="/creator/profile"
                        className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                      >
                        <span>View Full Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <span className="text-base font-extrabold text-[#171717] block">
                          {selectedOpportunity.creatorProfile.subscribers}
                        </span>
                        <span className="text-[10px] text-[#737373] mt-0.5 block font-medium">
                          Subscribers
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <span className="text-base font-extrabold text-[#171717] block">
                          {selectedOpportunity.creatorProfile.followers}
                        </span>
                        <span className="text-[10px] text-[#737373] mt-0.5 block font-medium">
                          Followers
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <span className="text-base font-extrabold text-emerald-700 block">
                          {selectedOpportunity.creatorProfile.engagementRate}
                        </span>
                        <span className="text-[10px] text-[#737373] mt-0.5 block font-medium">
                          Engagement Rate
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <span className="text-xs font-bold text-[#171717] block truncate">
                          {selectedOpportunity.creatorProfile.primaryNiche}
                        </span>
                        <span className="text-[10px] text-[#737373] mt-0.5 block font-medium">
                          Primary Niche
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Sub-Tabs: Relevant Content | Audience Fit | Why They're a Good Fit */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-6 border-b border-[#E7E1DA] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('content')}
                      className={`pb-2 transition cursor-pointer relative ${
                        activeDetailTab === 'content'
                          ? 'text-[#FF6B00]'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      <span>Relevant Content</span>
                      {activeDetailTab === 'content' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('audience')}
                      className={`pb-2 transition cursor-pointer relative ${
                        activeDetailTab === 'audience'
                          ? 'text-[#FF6B00]'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      <span>Audience Fit</span>
                      {activeDetailTab === 'audience' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('whyFits')}
                      className={`pb-2 transition cursor-pointer relative ${
                        activeDetailTab === 'whyFits'
                          ? 'text-[#FF6B00]'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      <span>Why This Fits</span>
                      {activeDetailTab === 'whyFits' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
                      )}
                    </button>
                  </div>

                  {/* Tab Content 1: Relevant Content Video Cards */}
                  {activeDetailTab === 'content' && (
                    <div className="space-y-3">
                      {selectedOpportunity.relevantContent &&
                      selectedOpportunity.relevantContent.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {selectedOpportunity.relevantContent.map((video) => (
                            <div
                              key={video.id}
                              className="rounded-xl border border-[#E7E1DA] overflow-hidden bg-[#F8F6F2]/50 hover:bg-[#F8F6F2] transition group"
                            >
                              {/* Simulated Video Thumbnail Box */}
                              <div className="h-24 bg-[#171717] text-white flex items-center justify-center relative p-2 text-center">
                                <div className="text-[10px] font-bold text-neutral-300 line-clamp-2 px-1">
                                  {video.title}
                                </div>
                                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {video.duration}
                                </span>
                              </div>
                              <div className="p-2.5 space-y-1">
                                <h4 className="text-xs font-bold text-[#171717] line-clamp-1 group-hover:text-[#FF6B00] transition">
                                  {video.title}
                                </h4>
                                <p className="text-[10px] text-[#737373]">
                                  {video.views} • {video.timeAgo}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#737373] italic">
                          Connect YouTube to automatically showcase relevant video benchmarks here.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tab Content 2: Audience Fit */}
                  {activeDetailTab === 'audience' && (
                    <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#737373]">Audience Profession:</span>
                        <span className="font-bold text-[#171717]">
                          84% Software Engineers & Cloud Architects
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#737373]">Top Geographies:</span>
                        <span className="font-bold text-[#171717]">India (42%), US (35%), UK (12%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#737373]">Brand Affinity:</span>
                        <span className="font-bold text-emerald-700">Verified High Match</span>
                      </div>
                    </div>
                  )}

                  {/* Tab Content 3: Why This Fits */}
                  {activeDetailTab === 'whyFits' && (
                    <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-2 text-xs text-[#171717] leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold text-[#FF6B00]">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Match Evidence</span>
                      </div>
                      <p>
                        High overlap between campaign technical scope and creator’s recent publication
                        topics. Audience engagement benchmarks indicate strong retention on hands-on
                        workflow demonstrations.
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Action Buttons Bar (Bottom of Right Panel) */}
                <div className="pt-4 border-t border-[#E7E1DA]">
                  {selectedOpportunity.sourceType === 'invitation' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {/* Accept & Move to Collaboration */}
                      <button
                        type="button"
                        onClick={handleAcceptInvitation}
                        disabled={isAccepting || selectedOpportunity.status === 'ACCEPTED'}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                          selectedOpportunity.status === 'ACCEPTED'
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#FF6B00] hover:bg-[#E56000] text-white active:scale-98'
                        }`}
                      >
                        {isAccepting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : selectedOpportunity.status === 'ACCEPTED' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Invitation Accepted</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Accept & Move to Collaboration</span>
                          </>
                        )}
                      </button>

                      {/* Discuss in Inbox */}
                      <button
                        type="button"
                        onClick={handleDiscussInInbox}
                        className="py-3 px-4 rounded-xl bg-white hover:bg-[#F8F6F2] border border-[#E7E1DA] text-[#171717] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#737373]" />
                        <span>Discuss in Inbox</span>
                      </button>

                      {/* Decline */}
                      {selectedOpportunity.status !== 'ACCEPTED' &&
                        selectedOpportunity.status !== 'DECLINED' && (
                          <button
                            type="button"
                            onClick={handleDeclineInvitation}
                            className="py-3 px-3 rounded-xl text-[#737373] hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                          >
                            Decline
                          </button>
                        )}
                    </div>
                  ) : (
                    /* When Creator Application */
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDiscussInInbox}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#171717] hover:bg-[#FF6B00] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Discuss in Inbox</span>
                      </button>

                      <Link
                        href="/creator/discover"
                        className="py-3 px-4 rounded-xl bg-white hover:bg-[#F8F6F2] border border-[#E7E1DA] text-[#171717] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <span>View Marketplace</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreatorOpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F2] p-8 animate-pulse" />}>
      <OpportunitiesContent />
    </Suspense>
  );
}
