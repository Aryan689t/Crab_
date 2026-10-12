'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertCircle,
  ExternalLink,
  Loader2,
  Building2,
  Clock,
  Target,
  Briefcase,
  Users,
  FileText,
  BadgeCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import {
  MarketplaceCampaignCard,
  CampaignData,
} from '../../../components/creator/MarketplaceCampaignCard';
import { SideDrawer } from '../../../components/ui/SideDrawer';
import { YouTubeIcon, InstagramIcon } from '../../../components/creator/BrandIcons';

const COVER_MAP: Record<string, string> = {
  cmp_aws_01: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  cmp_veloce_02: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&auto=format&fit=crop',
  cmp_supadb_03: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
  cmp_vercel_04: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200&auto=format&fit=crop',
  cmp_gymshark_05: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  cmp_notion_06: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
  cmp_framer_07: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
  cmp_sony_08: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
  cmp_hellofresh_09: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=1200&auto=format&fit=crop',
};

const CATEGORY_COVERS: Record<string, string> = {
  TECHNOLOGY: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  FITNESS: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  FOOD: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
  DESIGN: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
  FINANCE: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
  PRODUCTIVITY: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
  DEFAULT: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop',
};

function getCampaignPosterUrl(campaign: any): string {
  if (!campaign) return CATEGORY_COVERS.DEFAULT;
  if (campaign.coverImage) return campaign.coverImage;
  if (campaign.imageUrl) return campaign.imageUrl;
  if (campaign.bannerUrl) return campaign.bannerUrl;
  if (COVER_MAP[campaign.id]) return COVER_MAP[campaign.id];
  const cat = (campaign.category || '').toUpperCase();
  return CATEGORY_COVERS[cat] || CATEGORY_COVERS.DEFAULT;
}

export default function CreatorOpportunitiesPage() {
  const { campaigns: mockCampaigns, applications, applyToCampaign } = useMockStore();
  const { user, token } = useAuth();

  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  // Application Draft Storage (preserved across switching campaigns & closing drawer)
  const [draftPitches, setDraftPitches] = useState<Record<string, string>>({});
  const [draftRates, setDraftRates] = useState<Record<string, number>>({});

  const [pitchNote, setPitchNote] = useState('');
  const [proposedRate, setProposedRate] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'pay' | 'ending'>('match');
  const [sortOpen, setSortOpen] = useState(false);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [posterImgError, setPosterImgError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch real database campaigns and already-applied campaigns on mount
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (token) {
          // 1. Fetch campaigns
          const res = await fetchApi<{ data: any[] }>('/api/campaigns', {}, token);
          if (mounted && res?.data && res.data.length > 0) {
            setDbCampaigns(res.data);
          }

          // 2. Fetch authenticated creator's existing submitted applications
          try {
            const appsRes = await fetchApi<{ data: any[] }>('/api/creators/me/applications', {}, token);
            if (mounted && appsRes?.data && Array.isArray(appsRes.data)) {
              const ids = appsRes.data.map((app: any) => app.campaignId);
              setAppliedIds(ids);
            }
          } catch (appErr) {
            console.warn('[OPPORTUNITIES] Applications fetch fallback:', appErr);
          }
        }
      } catch (err) {
        console.warn('[OPPORTUNITIES] Backend campaigns fetch fallback:', err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  // Sync draft pitch & rate when selectedCampaign changes
  useEffect(() => {
    if (selectedCampaign) {
      const savedPitch = draftPitches[selectedCampaign.id] || '';
      const savedRate = draftRates[selectedCampaign.id] ?? selectedCampaign.budgetMin ?? 25000;
      setPitchNote(savedPitch);
      setProposedRate(savedRate);
      setApplySuccess(false);
      setApplyError(null);
      setPosterImgError(false);

      // Reset textarea height after state application
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(
            Math.max(textareaRef.current.scrollHeight, 130),
            320
          )}px`;
        }
      }, 30);
    }
  }, [selectedCampaign]);

  // Transform database campaigns into unified shape, combining with store mocks
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
          : typeof c.timeline === 'string'
          ? c.timeline
          : 'Active Sprint';

      const deliverablesList = Array.isArray(c.deliverables)
        ? c.deliverables
        : [
            c.contentType
              ? `1 ${c.contentType} featuring product breakdown`
              : '1 Dedicated Video Breakdown with live demo',
            'Pinned comment link & social post amplification',
          ];

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        brandName: c.brand?.name || 'Partner Brand',
        brandLogo:
          c.brandLogo ||
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120',
        brandDescription: c.brand?.description,
        brandWebsite: c.brand?.website,
        productOrService: c.productOrService || c.title,
        category: c.brand?.category || c.category || 'Technology',
        objective: c.objective || c.description,
        budgetMin: Number(c.budgetMin) || 20000,
        budgetMax: Number(c.budgetMax) || 50000,
        currency: 'INR',
        requiredReach: c.requiredReach || 30000,
        platforms: c.platform ? [c.platform] : ['YOUTUBE'],
        contentType: c.contentType,
        contentStyle: c.contentStyle,
        niches: niches,
        deliverables: deliverablesList,
        timeline: timelineStr,
        deadline: c.deadline || timelineStr,
        exclusivity: c.exclusivity || 'No category exclusivity',
        usageRights: c.usageRights || 'Digital organic distribution',
        status: c.status || 'ACTIVE',
        invitedCount: 3,
        appliedCount: 5,
        acceptedCount: 1,
        totalSpent: 0,
        createdAt: c.createdAt || new Date().toISOString(),
        aiBriefSummary:
          c.aiProfile?.semanticSummary ||
          `Campaign looking for ${niches.join(', ')} creators.`,
        matchScore: c.matchScore || 92,
        coverImage: COVER_MAP[c.id],
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

  const isAlreadyApplied = (campaignId: string) => {
    return (
      appliedIds.includes(campaignId) ||
      applications.some((a) => a.campaignId === campaignId)
    );
  };

  // Textarea auto-resize and draft state persistence
  const handlePitchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPitchNote(value);
    setApplyError(null);

    // Auto-grow up to max 320px
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 130), 320)}px`;

    // Preserve draft
    if (selectedCampaign) {
      setDraftPitches((prev) => ({ ...prev, [selectedCampaign.id]: value }));
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setProposedRate(val);
    if (selectedCampaign && typeof val === 'number') {
      setDraftRates((prev) => ({ ...prev, [selectedCampaign.id]: val }));
    }
  };

  // Submission handler with real backend persistence & validation
  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCampaign) return;

    if (isAlreadyApplied(selectedCampaign.id)) {
      setApplyError('You have already applied to this campaign.');
      return;
    }

    const trimmedPitch = pitchNote.trim();
    if (trimmedPitch.length > 0 && trimmedPitch.length < 15) {
      setApplyError('Please write at least 15 characters to explain your creator pitch.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      if (token) {
        // Send real API request to backend
        const rateNumber = typeof proposedRate === 'number' ? proposedRate : selectedCampaign.budgetMin || 25000;
        await fetchApi(
          `/api/campaigns/${selectedCampaign.id}/applications`,
          {
            method: 'POST',
            body: JSON.stringify({
              pitch: trimmedPitch || undefined,
              proposedRate: rateNumber,
            }),
          },
          token
        );

        // Invalidate relevant cache scopes
        invalidateApiCache('/applications');
        invalidateApiCache('/creators');
        invalidateApiCache('/campaigns');
      }

      // Mark applied in local state
      setAppliedIds((prev) => [...prev, selectedCampaign.id]);
      applyToCampaign(selectedCampaign.id, user?.creatorId || 'creator_01', trimmedPitch);

      setApplySuccess(true);

      // Clear draft for this campaign
      setDraftPitches((prev) => {
        const copy = { ...prev };
        delete copy[selectedCampaign.id];
        return copy;
      });
    } catch (err: any) {
      console.error('[OPPORTUNITIES APPLY ERROR]', err);
      if (err.message?.includes('already submitted') || err.message?.includes('DuplicateApplication')) {
        setAppliedIds((prev) => [...prev, selectedCampaign.id]);
        setApplyError('You have already submitted an application to this campaign.');
      } else {
        setApplyError(err.message || 'Failed to submit application. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] cursor-pointer"
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
              className="text-[#FF6B00] hover:underline font-semibold cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* 4. Three-to-Four Column Marketplace Grid (Retains exact position) */}
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
              className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#FF6B00] text-white text-xs font-semibold transition cursor-pointer"
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
        <SideDrawer
          isOpen={Boolean(selectedCampaign)}
          onClose={() => setSelectedCampaign(null)}
          widthClassName="max-w-xl md:max-w-2xl lg:max-w-[680px]"
          headerContent={
            selectedCampaign && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedCampaign.brandLogo ? (
                    <img
                      src={selectedCampaign.brandLogo}
                      alt={selectedCampaign.brandName}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-[#737373]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-[#FF6B00] uppercase">
                      {selectedCampaign.category || 'PARTNERSHIP BRIEF'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#171717] truncate">
                    {selectedCampaign.title}
                  </h2>
                </div>
              </div>
            )
          }
          footerContent={
            selectedCampaign && (
              <div className="flex items-center justify-between gap-4">
                <div className="hidden sm:block">
                  <div className="text-[11px] text-[#737373]">Compensation Range</div>
                  <div className="text-sm font-bold text-[#171717]">
                    ₹{selectedCampaign.budgetMin?.toLocaleString()} - ₹{selectedCampaign.budgetMax?.toLocaleString()}
                  </div>
                </div>

                <div className="flex-1 sm:flex-initial flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApply()}
                    disabled={isSubmitting || isAlreadyApplied(selectedCampaign.id)}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                      isAlreadyApplied(selectedCampaign.id)
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                        : isSubmitting
                        ? 'bg-[#FF6B00]/70 text-white cursor-wait'
                        : 'bg-[#FF6B00] hover:bg-[#e05e00] text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : isAlreadyApplied(selectedCampaign.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Already Applied</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          }
        >
          {selectedCampaign && (
            <div className="space-y-6">
              {/* SECTION A: Campaign Poster / Hero Banner */}
              <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden bg-[#F4EFEA] border border-[#E7E1DA] shadow-xs">
                <img
                  src={
                    posterImgError
                      ? CATEGORY_COVERS.DEFAULT
                      : getCampaignPosterUrl(selectedCampaign)
                  }
                  alt={selectedCampaign.title}
                  onError={() => setPosterImgError(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase">
                      {selectedCampaign.category || 'Creator Campaign'}
                    </span>
                    {selectedCampaign.productOrService && (
                      <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-[11px] text-white/90">
                        {selectedCampaign.productOrService}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug drop-shadow-sm">
                    {selectedCampaign.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                    <span>Sponsored by</span>
                    <span className="font-semibold text-white">
                      {selectedCampaign.brandName}
                    </span>
                    {selectedCampaign.brandWebsite && (
                      <a
                        href={selectedCampaign.brandWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-white/70 hover:text-white underline ml-1 text-[11px]"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Highlight Pill */}
              {selectedCampaign.matchScore && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-900">
                      {selectedCampaign.matchScore}% AI Match for your creator profile
                    </div>
                    <div className="text-[11px] text-emerald-700 leading-relaxed">
                      {selectedCampaign.aiBriefSummary ||
                        'Aligned with your primary content style, tech educator audience, and historical performance metrics.'}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: Campaign Overview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373] border-b border-[#E7E1DA] pb-2">
                  <Info className="w-4 h-4 text-[#FF6B00]" />
                  <span>Campaign Overview</span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#171717]">About the Campaign</h4>
                  <p className="text-xs sm:text-sm text-[#383838] leading-relaxed">
                    {selectedCampaign.description ||
                      'Join this partnership sprint to create authentic educational content demonstrating key workflow advantages to technical decision makers.'}
                  </p>
                </div>

                {/* Objective */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Primary Objective</span>
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed bg-[#F8F6F2] p-3 rounded-xl border border-[#E7E1DA]">
                    {selectedCampaign.objective ||
                      'Drive developer engagement and trial sign-ups through comprehensive code walkthroughs and workflow tips.'}
                  </p>
                </div>

                {/* About Brand */}
                {selectedCampaign.brandDescription && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#737373]" />
                      <span>About {selectedCampaign.brandName}</span>
                    </h4>
                    <p className="text-xs text-[#525252] leading-relaxed">
                      {selectedCampaign.brandDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION C: Compensation & Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373] border-b border-[#E7E1DA] pb-2">
                  <IndianRupee className="w-4 h-4 text-[#FF6B00]" />
                  <span>Compensation & Timeline</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                    <div className="text-[11px] text-[#737373]">Budget / Payout Range</div>
                    <div className="text-base font-bold text-[#171717] mt-0.5">
                      ₹{selectedCampaign.budgetMin?.toLocaleString()} - ₹{selectedCampaign.budgetMax?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      Fixed milestone payment via CRAB Escrow
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                    <div className="text-[11px] text-[#737373]">Campaign Schedule</div>
                    <div className="text-base font-bold text-[#171717] mt-0.5 truncate">
                      {selectedCampaign.timeline || selectedCampaign.deadline || 'Active Sprint'}
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      Turnaround: 7-10 business days from acceptance
                    </div>
                  </div>
                </div>

                {/* Expected Deliverables */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Expected Deliverables</span>
                  </h4>
                  <ul className="space-y-2">
                    {(selectedCampaign.deliverables || [
                      '1 Dedicated Video Breakdown with live demo',
                      'Pinned comment with tracking link',
                      'Social post amplification',
                    ]).map((del: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-xs text-[#383838] flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E7E1DA]"
                      >
                        <Check className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SECTION D: Eligibility & Requirements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373] border-b border-[#E7E1DA] pb-2">
                  <Layers className="w-4 h-4 text-[#FF6B00]" />
                  <span>Eligibility & Requirements</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Platforms */}
                  <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-1">
                    <span className="text-[11px] text-[#737373] font-medium">Platform Channels</span>
                    <div className="flex items-center gap-2 pt-1">
                      {(selectedCampaign.platforms || ['YOUTUBE']).map((p: string) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E7E1DA] text-[11px] font-bold text-[#171717]"
                        >
                          {p === 'YOUTUBE' ? (
                            <YouTubeIcon className="w-3.5 h-3.5" />
                          ) : (
                            <InstagramIcon className="w-3.5 h-3.5" />
                          )}
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reach */}
                  <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-1">
                    <span className="text-[11px] text-[#737373] font-medium">Audience Benchmark</span>
                    <div className="text-xs font-bold text-[#171717] pt-1">
                      {selectedCampaign.requiredReach
                        ? `${selectedCampaign.requiredReach.toLocaleString()}+ avg views/reach`
                        : 'Open to micro & mid-tier creators'}
                    </div>
                  </div>
                </div>

                {/* Niches */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#171717]">Target Niches</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(selectedCampaign.niches || ['Technology', 'AI Tools']).map((n: string) => (
                      <span
                        key={n}
                        className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] text-xs font-semibold text-[#525252]"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exclusivity & Rights */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E7E1DA] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Category Exclusivity:</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedCampaign.exclusivity || 'No exclusivity required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E7E1DA]/60 pt-2">
                    <span className="text-[#737373]">Usage Rights:</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedCampaign.usageRights || 'Digital organic creator channel distribution'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION E: Brand Credibility & Verification */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373] border-b border-[#E7E1DA] pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Brand Credibility</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#171717]">
                        Verified Brand Partner
                      </div>
                      <div className="text-[11px] text-[#737373]">
                        {selectedCampaign.brandName} has verified company credentials on CRAB.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION F: Creator Application Form */}
              <div className="space-y-4 pt-4 border-t border-[#E7E1DA]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
                  <FileText className="w-4 h-4 text-[#FF6B00]" />
                  <span>Submit Your Proposal</span>
                </div>

                {applySuccess ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Application Submitted Successfully!</span>
                    </div>
                    <p className="text-emerald-700 leading-relaxed">
                      Your pitch and rate proposal have been submitted to {selectedCampaign.brandName}. The brand team will review your application and respond with an offer or collaboration message.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCampaign(null)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Back to Opportunities
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    {/* Error Banner */}
                    {applyError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{applyError}</span>
                      </div>
                    )}

                    {/* Proposed Rate Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#171717] flex items-center justify-between">
                        <span>Your Proposed Rate (INR)</span>
                        <span className="text-[11px] text-[#737373] font-normal">
                          Budget range: ₹{selectedCampaign.budgetMin?.toLocaleString()} - ₹{selectedCampaign.budgetMax?.toLocaleString()}
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#737373]">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={proposedRate}
                          onChange={handleRateChange}
                          min={1000}
                          step={1000}
                          placeholder={String(selectedCampaign.budgetMin || 25000)}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs font-semibold text-[#171717] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Pitch Textarea */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#171717]">
                          Creator Pitch & Content Concept
                        </label>
                        <span className="text-[11px] text-[#737373]">
                          {pitchNote.length} / 3000 characters
                        </span>
                      </div>

                      {/* Prompt Guide Box */}
                      <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FF6B00]/20 text-[11px] text-[#8C3A00] space-y-1">
                        <p className="font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                          Tips for a winning application:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-[#737373]">
                          <li>Explain why your viewers are the exact target audience for this brief.</li>
                          <li>Outline your proposed video structure and creative hook.</li>
                          <li>Share your expected turnaround time and past collaboration links.</li>
                        </ul>
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={5}
                        maxLength={3000}
                        value={pitchNote}
                        onChange={handlePitchChange}
                        placeholder={`Hi ${selectedCampaign.brandName} team,\n\nI run a tech channel focusing on hands-on software development and tutorials. For this sprint, I propose a dedicated walkthrough demonstrating key workflow benefits with an open-source GitHub companion repo...\n\nLooking forward to collaborating!`}
                        className="w-full min-h-[140px] max-h-[320px] p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition resize-none leading-relaxed"
                      />
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </SideDrawer>
      </main>
    </div>
  );
}
