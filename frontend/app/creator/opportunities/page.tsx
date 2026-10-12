'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMockStore, getStoredCreators } from '../../../mock/store';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../lib/api';
import {
  Search,
  CheckCircle2,
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Send,
  Calendar,
  Layers,
  IndianRupee,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import {
  MarketplaceCampaignCard,
  CampaignData,
} from '../../../components/creator/MarketplaceCampaignCard';
import { StarRating } from '../../../components/ui/StarRating';

export default function CreatorOpportunitiesPage() {
  const { campaigns: mockCampaigns, applications, applyToCampaign } = useMockStore();
  const { user, token } = useAuth();

  const creators = getStoredCreators();
  const creatorProfile = creators.find((c) => c.id === 'creator_01');
  const creatorNiches = creatorProfile?.primaryNiches || [];

  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [pitchNote, setPitchNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'pay' | 'ending'>('match');
  const [isLoading, setIsLoading] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadCampaigns = async () => {
      try {
        if (token) {
          const res = await fetchApi<{ data: any[] }>('/api/campaigns', {}, token);
          if (mounted && res?.data && res.data.length > 0) {
            setDbCampaigns(res.data);
          }
        }
      } catch (err) {
        console.warn('[OPPORTUNITIES] Backend campaigns fetch fallback:', err);
      }
    };

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, [token]);

  // Transform database campaigns into CampaignItem shape, combining with store mocks
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
          ? `${c.timeline.start} - ${c.timeline.end}`
          : 'Active';

      return {
        id: c.id,
        title: c.title,
        brandName: c.brand?.name || 'Partner Brand',
        brandLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100',
        productOrService: c.productOrService || c.title,
        category: c.brand?.category || 'Technology',
        objective: c.objective || c.description,
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
        exclusivity: c.exclusivity || 'No category exclusivity',
        status: c.status || 'ACTIVE',
        invitedCount: 3,
        appliedCount: 5,
        acceptedCount: 1,
        totalSpent: 0,
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

  const categories = useMemo(() => {
    const unique = new Set(campaigns.map((c) => c.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [campaigns]);

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

  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    if (token) {
      try {
        await fetchApi(
          `/api/campaigns/${selectedCampaign.id}/applications`,
          {
            method: 'POST',
            body: JSON.stringify({
              pitch: pitchNote,
              proposedRate: selectedCampaign.budgetMin || 25000,
            }),
          },
          token
        );
        invalidateApiCache('/applications');
        invalidateApiCache('/creators');
        invalidateApiCache('/campaigns');
      } catch (err) {
        console.warn('[OPPORTUNITIES] Backend apply submission fallback:', err);
      }
    }

    setAppliedIds((prev) => [...prev, selectedCampaign.id]);
    applyToCampaign(selectedCampaign.id, 'creator_01', pitchNote);
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedCampaign(null);
      setPitchNote('');
    }, 1800);
  };

  const isAlreadyApplied = (campaignId: string) => {
    return appliedIds.includes(campaignId) || applications.some((a) => a.campaignId === campaignId);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* 1. Unified Page Header */}
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
                    ? 'Highest pay'
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

        {/* 4. Three-to-Four Column Marketplace Grid */}
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

        {/* 5. Campaign Details & Application Slide-Over Drawer */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
            <div
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E7E1DA] flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-semibold tracking-wider text-[#FF6B00] uppercase">
                    {selectedCampaign.category || 'PARTNERSHIP BRIEF'}
                  </div>
                  <h2 className="text-xl font-bold text-[#171717]">
                    {selectedCampaign.title}
                  </h2>
                  <div className="text-xs text-[#737373] flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span>Sponsored by</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedCampaign.brandName}
                    </span>
                    <StarRating rating={selectedCampaign.brandRating || 4.8} size="xs" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="p-2 rounded-xl hover:bg-[#F8F6F2] text-[#737373] hover:text-[#171717] transition"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Match Highlight Pill */}
                {selectedCampaign.matchScore && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          {selectedCampaign.matchScore}% Match for your channel
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Aligned with your tech educator niche and average video performance.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                    <div className="text-[11px] text-[#737373]">Budget / Payout</div>
                    <div className="text-base font-bold text-[#171717] mt-0.5">
                      ₹{selectedCampaign.budgetMin?.toLocaleString()} - ₹
                      {selectedCampaign.budgetMax?.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                    <div className="text-[11px] text-[#737373]">Timeline / Deadline</div>
                    <div className="text-base font-bold text-[#171717] mt-0.5 truncate">
                      {selectedCampaign.timeline || selectedCampaign.deadline || 'Flexible'}
                    </div>
                  </div>
                </div>

                {/* Objective */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Campaign Objective
                  </h4>
                  <p className="text-xs sm:text-sm text-[#383838] leading-relaxed">
                    {selectedCampaign.objective ||
                      selectedCampaign.aiBriefSummary ||
                      'Seeking tech and developer creators to showcase key workflow benefits with authentic tutorial content.'}
                  </p>
                </div>

                {/* Deliverables */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Expected Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {(
                      selectedCampaign.deliverables || [
                        '1 Dedicated long-form review video with product walk-through',
                        '1 Pinned comment with tracking link',
                        'Social post amplification',
                      ]
                    ).map((del: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-xs text-[#383838] flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pitch Submission Form */}
                <form onSubmit={handleApply} className="space-y-4 pt-4 border-t border-[#E7E1DA]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">
                      Your Creator Pitch Note
                    </label>
                    <textarea
                      rows={3}
                      value={pitchNote}
                      onChange={(e) => setPitchNote(e.target.value)}
                      placeholder="Explain why your audience fits this campaign and your creative concept..."
                      className="w-full p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition resize-none"
                    />
                  </div>

                  {applySuccess ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Application submitted successfully!</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isAlreadyApplied(selectedCampaign.id)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                        isAlreadyApplied(selectedCampaign.id)
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-[#FF6B00] hover:bg-[#e05e00] text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isAlreadyApplied(selectedCampaign.id)
                          ? 'Already Applied'
                          : 'Submit Application with Verified Profile'}
                      </span>
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
