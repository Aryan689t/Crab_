'use client';

import React, { useState } from 'react';
import { useMockStore } from '../../../mock/store';
import {
  Users,
  Search,
  SlidersHorizontal,
  Sparkles,
  Youtube,
  Instagram,
  Star,
  Bookmark,
  Send,
  Eye,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Info,
  X,
  Check,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';

export default function BrandFindCreatorsPage() {
  const { creators, campaigns, toggleShortlist, inviteCreatorToCampaign } = useMockStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [minMatch, setMinMatch] = useState<number>(75);

  // Invite Modal State
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const niches = [
    'ALL',
    'Technology',
    'Software Engineering',
    'AI Tools',
    'Web Design',
    'DevOps',
    'Productivity & SaaS',
  ];

  const filteredCreators = creators.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchNiche = selectedNiche === 'ALL' || c.primaryNiches.includes(selectedNiche);
    const matchPlatform = selectedPlatform === 'ALL' || c.platform === selectedPlatform;
    const matchScore = c.matchScore >= minMatch;
    return matchSearch && matchNiche && matchPlatform && matchScore;
  });

  const handleSendInvite = () => {
    if (!selectedCreatorId || !selectedCampaignId) return;
    inviteCreatorToCampaign(selectedCreatorId, selectedCampaignId);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedCreatorId(null);
    }, 1800);
  };

  const activeCreator = creators.find((c) => c.id === selectedCreatorId);

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <PortalPageHeader
          eyebrow="Talent Discovery"
          titlePrefix="Find & discover"
          highlightText="aligned creators."
          description="Contextual matching powered by pgvector semantic analysis, evaluated audience relevance, and historical deliverable reliability."
        />

        {/* 2. Search & Toolbar Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by creator name, handle, tech stack, or topics..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
              />
            </div>

            {/* Platform Toggle */}
            <div className="flex items-center gap-1 bg-[#F8F6F2] p-1 rounded-xl border border-[#E7E1DA] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedPlatform('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedPlatform === 'ALL'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                All Platforms
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('YOUTUBE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPlatform === 'YOUTUBE'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('INSTAGRAM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPlatform === 'INSTAGRAM'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* Niche Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <span className="text-xs text-[#737373] shrink-0 font-semibold flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Niches:</span>
            </span>
            {niches.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setSelectedNiche(niche)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedNiche === niche
                    ? 'bg-[#FFF4EB] border-[#FF6B00] text-[#FF6B00]'
                    : 'bg-[#F8F6F2] border-[#E7E1DA] text-[#737373] hover:text-[#171717] hover:border-[#737373]'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Results Header & Creators Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Showing {filteredCreators.length} verified creators matching criteria</span>
            <span className="text-[#FF6B00] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ranked by Explainable AI Vector Match</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                {/* Creator Top Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E7E1DA] shadow-2xs shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-[#171717] truncate">{creator.name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <StarRating rating={creator.rating || 4.8} reviewCount={creator.reviewCount} />
                      </div>
                      <p className="text-xs text-[#737373]">{creator.handle}</p>
                      <p className="text-[11px] text-[#737373]">{creator.location}</p>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{creator.matchScore}% Match</span>
                    </div>
                    <span className="block text-[10px] text-[#737373] mt-0.5">High Alignment</span>
                  </div>
                </div>

                {/* Bio & Niches */}
                <div className="space-y-2">
                  <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">{creator.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.primaryNiches.map((n) => (
                      <span
                        key={n}
                        className="px-2 py-0.5 rounded-md bg-[#F8F6F2] border border-[#E7E1DA] text-[#737373] text-[10px] font-semibold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explainable AI Fit Reasons Box */}
                <div className="p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#171717] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                      <span>Why This Creator Fits:</span>
                    </span>
                    <span className="text-[10px] text-[#737373]">Cosine Dist: 0.06</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#737373]">
                    {creator.keyFitReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Mini Match Factor Bar Breakdown */}
                  <div className="pt-2 border-t border-[#E7E1DA] grid grid-cols-5 gap-1 text-[9px] text-center text-[#737373]">
                    <div>
                      <div className="h-1 bg-[#FF6B00] rounded-full mb-1" style={{ width: `${creator.matchBreakdown.semantic}%` }}></div>
                      <span>Sem {creator.matchBreakdown.semantic}%</span>
                    </div>
                    <div>
                      <div className="h-1 bg-emerald-600 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.audience}%` }}></div>
                      <span>Aud {creator.matchBreakdown.audience}%</span>
                    </div>
                    <div>
                      <div className="h-1 bg-blue-600 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.performance}%` }}></div>
                      <span>Perf {creator.matchBreakdown.performance}%</span>
                    </div>
                    <div>
                      <div className="h-1 bg-purple-600 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.platform}%` }}></div>
                      <span>Plat {creator.matchBreakdown.platform}%</span>
                    </div>
                    <div>
                      <div className="h-1 bg-[#FF6B00] rounded-full mb-1" style={{ width: `${creator.matchBreakdown.brandFit}%` }}></div>
                      <span>Brand {creator.matchBreakdown.brandFit}%</span>
                    </div>
                  </div>
                </div>

                {/* Metrics & Action Footer */}
                <div className="pt-3 border-t border-[#E7E1DA] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-[#737373]">
                    <div>
                      <span className="block font-bold text-[#171717] text-xs">
                        {creator.subscribers.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#737373]">Subscribers</span>
                    </div>
                    <div className="border-l border-[#E7E1DA] pl-3">
                      <span className="block font-bold text-[#171717] text-xs">
                        {creator.avgViews.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#737373]">Avg Views</span>
                    </div>
                    <div className="border-l border-[#E7E1DA] pl-3">
                      <span className="block font-bold text-[#171717] text-xs">
                        {creator.engagementRate}%
                      </span>
                      <span className="text-[10px] text-[#737373]">Eng. Rate</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleShortlist(creator.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        creator.isShortlisted
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-[#F8F6F2] border-[#E7E1DA] text-[#737373] hover:text-rose-600 hover:bg-white'
                      }`}
                      title={creator.isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                    >
                      <Bookmark className={`w-4 h-4 ${creator.isShortlisted ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCreatorId(creator.id);
                        setSelectedCampaignId(campaigns[0]?.id || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Invite to Campaign Modal Dialog */}
        {selectedCreatorId && activeCreator && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full border border-[#E7E1DA] p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#FF6B00]" />
                  <h3 className="font-bold text-base text-[#171717]">Invite Creator to Campaign</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCreatorId(null)}
                  className="text-[#737373] hover:text-[#171717] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]">
                <img
                  src={activeCreator.avatar}
                  alt={activeCreator.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#171717]">{activeCreator.name}</p>
                    <StarRating rating={activeCreator.rating || 4.8} size="xs" />
                  </div>
                  <p className="text-xs text-[#737373]">
                    {activeCreator.handle} • {activeCreator.matchScore}% Match
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#171717] block">
                  Select Target Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E1DA] rounded-xl text-xs font-medium text-[#171717] focus:outline-none focus:border-[#FF6B00]"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {inviteSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Invitation sent directly to creator's requests pipeline!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCreatorId(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-[#737373] hover:bg-[#F8F6F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInvite}
                    className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs"
                  >
                    Send Campaign Invitation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
