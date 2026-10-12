'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMockStore, getStoredCreators } from '../../../mock/store';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import {
  MarketplaceCampaignCard,
  CampaignData,
} from '../../../components/creator/MarketplaceCampaignCard';
import { CampaignDetailsDrawer } from '../../../components/creator/CampaignDetailsDrawer';

function CreatorOpportunitiesContent() {
  const { campaigns: mockCampaigns, applications, applyToCampaign } = useMockStore();
  const { user, token } = useAuth();
  const searchParams = useSearchParams();

  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'pay' | 'ending'>('match');
  const [sortOpen, setSortOpen] = useState(false);

  // 1. Fetch real active campaigns and creator's applications from backend
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (token) {
          const [campaignsRes, appsRes] = await Promise.allSettled([
            fetchApi<{ data: any[] }>('/api/campaigns', {}, token),
            fetchApi<{ data: any[] }>('/api/creators/me/applications', {}, token),
          ]);

          if (!mounted) return;

          if (campaignsRes.status === 'fulfilled' && campaignsRes.value?.data && campaignsRes.value.data.length > 0) {
            setDbCampaigns(campaignsRes.value.data);
          }

          if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
            const appIds = appsRes.value.data.map((a: any) => a.campaignId || a.campaign?.id).filter(Boolean);
            setAppliedIds((prev) => Array.from(new Set([...prev, ...appIds])));
          }
        }
      } catch (err) {
        console.warn('[OPPORTUNITIES] Backend fetch fallback:', err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  // 2. Transform database campaigns into clean shape
  const campaigns = useMemo(() => {
    if (!dbCampaigns || dbCampaigns.length === 0) {
      return mockCampaigns;
    }

    const transformedDb = dbCampaigns.map((c) => {
      const niches = c.creatorNiche
        ? c.creatorNiche.split(',').map((s: string) => s.trim())
        : c.aiProfile?.inferredNiches || ['Technology', 'AI Tools'];

      const timelineStr =
        typeof c.timeline === 'object' && c.timeline?.display
          ? c.timeline.display
          : typeof c.timeline === 'object' && c.timeline?.start
          ? `${c.timeline.start} – ${c.timeline.end}`
          : 'Active Sponsorship Window';

      return {
        id: c.id,
        title: c.title,
        brandName: c.brand?.name || 'Partner Brand',
        brandLogo: c.brand?.logo || undefined,
        brandCategory: c.brand?.category || 'Technology',
        brandDescription: c.brand?.description || undefined,
        brandWebsite: c.brand?.website || undefined,
        productOrService: c.productOrService || c.title,
        category: c.brand?.category || 'Technology',
        objective: c.objective || c.description,
        description: c.description || c.objective,
        budgetMin: Number(c.budgetMin) || 20000,
        budgetMax: Number(c.budgetMax) || 50000,
        currency: 'INR',
        requiredReach: c.requiredReach || 30000,
        platforms: [c.platform || 'YOUTUBE'],
        niches: niches,
        deliverables: [
          '1 Dedicated Video Breakdown with live demo',
          'Pinned comment link & social post',
        ],
        timeline: timelineStr,
        exclusivity: c.exclusivity || 'No competitor integrations for 14 days',
        usageRights: c.usageRights || 'Organic brand channels & social reposts (60 days)',
        status: c.status || 'ACTIVE',
        createdAt: c.createdAt || new Date().toISOString(),
        aiBriefSummary:
          c.aiProfile?.semanticSummary ||
          `Campaign looking for ${niches.join(', ')} creators.`,
        matchScore: 92,
      };
    });

    const dbIds = new Set(transformedDb.map((c) => c.id));
    const extraMocks = mockCampaigns.filter((m) => !dbIds.has(m.id));
    return [...transformedDb, ...extraMocks];
  }, [dbCampaigns, mockCampaigns]);

  // 3. Auto-open campaign drawer if ?campaign=id is present in URL
  useEffect(() => {
    const campaignIdParam = searchParams.get('campaign');
    if (campaignIdParam && campaigns.length > 0) {
      const matched = campaigns.find((c) => c.id === campaignIdParam);
      if (matched) {
        setSelectedCampaign(matched);
      }
    }
  }, [searchParams, campaigns]);

  // Categories filter list
  const categories = useMemo(() => {
    const unique = new Set(campaigns.map((c) => c.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [campaigns]);

  // Filtered & sorted campaign list
  const sortedAndFilteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'DRAFT'
    );

    if (activeCategory !== 'All') {
      filtered = filtered.filter((c) => c.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.brandName.toLowerCase().includes(query) ||
          (c.niches && c.niches.some((n: string) => n.toLowerCase().includes(query)))
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'pay') return b.budgetMax - a.budgetMax;
      if (sortBy === 'ending') return a.id.localeCompare(b.id);
      const scoreA = a.matchScore ?? 85;
      const scoreB = b.matchScore ?? 85;
      return scoreB - scoreA;
    });
  }, [campaigns, activeCategory, sortBy, searchQuery]);

  const isAlreadyApplied = (campaignId?: string) => {
    if (!campaignId) return false;
    return appliedIds.includes(campaignId) || applications.some((a) => a.campaignId === campaignId);
  };

  const handleApplySuccess = (campaignId: string) => {
    setAppliedIds((prev) => Array.from(new Set([...prev, campaignId])));
    applyToCampaign(campaignId, user?.id || 'creator_01', 'Applied via Campaign Drawer');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* 1. Page Header */}
        <PortalPageHeader
          titlePrefix="Discover campaigns that"
          highlightText="fit you."
        />

        {/* 2. Search & Toolbar Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search campaigns, brand names or niches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
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

            {/* Sort Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>
                  Sort:{' '}
                  {sortBy === 'match'
                    ? 'Best match'
                    : sortBy === 'pay'
                    ? 'Highest budget'
                    : 'Ending soon'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
              </button>

              {sortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E1DA] rounded-xl shadow-lg z-30 p-1.5 space-y-1">
                  {[
                    { id: 'match', label: 'Best match' },
                    { id: 'pay', label: 'Highest budget' },
                    { id: 'ending', label: 'Ending soon' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSortBy(option.id as any);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        sortBy === option.id
                          ? 'bg-[#FFF4EB] text-[#FF6B00]'
                          : 'text-[#171717] hover:bg-[#F8F6F2]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  activeCategory === category
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xs'
                    : 'bg-[#F8F6F2] text-[#525252] border-[#E7E1DA] hover:border-[#171717]/30 hover:text-[#171717]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-[#737373] px-1">
          <div>
            Showing{' '}
            <span className="font-bold text-[#171717]">
              {sortedAndFilteredCampaigns.length}
            </span>{' '}
            active campaigns
          </div>
          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              className="text-[#FF6B00] hover:underline font-semibold"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* 4. Three-to-Four Column Marketplace Grid (Unchanged position, never squeezed) */}
        {sortedAndFilteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#E7E1DA] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">No campaigns found</h3>
            <p className="text-xs text-[#737373] max-w-md mx-auto">
              No active campaigns match your current filters. Try searching for different keywords or clear your category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#FF6B00] text-white text-xs font-semibold transition"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {sortedAndFilteredCampaigns.map((camp) => (
              <MarketplaceCampaignCard
                key={camp.id}
                campaign={camp}
                applied={isAlreadyApplied(camp.id)}
                onSelect={(selected) => setSelectedCampaign(selected)}
              />
            ))}
          </div>
        )}

        {/* 5. Campaign Details Drawer Overlay */}
        <CampaignDetailsDrawer
          campaign={selectedCampaign}
          isOpen={Boolean(selectedCampaign)}
          onClose={() => setSelectedCampaign(null)}
          applied={isAlreadyApplied(selectedCampaign?.id)}
          onApplySuccess={handleApplySuccess}
          token={token}
        />
      </main>
    </div>
  );
}

export default function CreatorOpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F2] p-8 animate-pulse" />}>
      <CreatorOpportunitiesContent />
    </Suspense>
  );
}
