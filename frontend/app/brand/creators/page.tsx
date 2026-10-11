'use client';

import React, { useState } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
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
} from 'lucide-react';

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

  const niches = ['ALL', 'Technology', 'Software Engineering', 'AI Tools', 'Web Design', 'DevOps', 'Productivity & SaaS'];

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
    <AppShell
      title="Find & Discover Creators"
      subtitle="AI-driven contextual matching based on audience alignment, content vectors, and deliverable reliability."
    >
      {/* Search & Filters Bar */}
      <section className="bg-white rounded-2xl p-5 border border-[#E7E8F0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8B90A5]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by creator name, handle, tech stack, or topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          {/* Platform Toggle */}
          <div className="flex items-center space-x-2 bg-[#F5F6FA] p-1 rounded-xl border border-[#E7E8F0] self-start md:self-auto">
            <button
              onClick={() => setSelectedPlatform('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPlatform === 'ALL' ? 'bg-white text-[#17182B] shadow-sm' : 'text-[#626782]'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setSelectedPlatform('YOUTUBE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                selectedPlatform === 'YOUTUBE' ? 'bg-white text-[#17182B] shadow-sm' : 'text-[#626782]'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('INSTAGRAM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                selectedPlatform === 'INSTAGRAM' ? 'bg-white text-[#17182B] shadow-sm' : 'text-[#626782]'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram</span>
            </button>
          </div>
        </div>

        {/* Niche Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs text-[#8B90A5] shrink-0 font-medium mr-1 flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Niches:</span>
          </span>
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                selectedNiche === niche
                  ? 'bg-[#F3F3FC] border-[#8580E8] text-[#8580E8] font-semibold'
                  : 'bg-[#F8F9FC] border-[#E7E8F0] text-[#626782] hover:border-[#8580E8]/40'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </section>

      {/* Creators Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#626782]">
          <span>Showing {filteredCreators.length} verified creators matching current criteria</span>
          <span className="text-[#8580E8] font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ranked by Explainable AI Vector Score</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm hover:border-[#8580E8]/50 transition flex flex-col justify-between space-y-5"
            >
              {/* Creator Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E7E8F0] shadow-sm shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-base text-[#17182B]">{creator.name}</h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-[#626782]">{creator.handle}</p>
                    <p className="text-[11px] text-[#8B90A5]">{creator.location}</p>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#8580E8]/15 to-[#F4511E]/15 border border-[#8580E8]/30 text-xs font-bold text-[#17182B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
                    <span>{creator.matchScore}% Match</span>
                  </div>
                  <span className="block text-[10px] text-[#8B90A5] mt-0.5">High Alignment</span>
                </div>
              </div>

              {/* Bio & Niches */}
              <div className="space-y-2">
                <p className="text-xs text-[#626782] line-clamp-2 leading-relaxed">{creator.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.primaryNiches.map((n) => (
                    <span
                      key={n}
                      className="px-2 py-0.5 rounded-md bg-[#F3F3FC] text-[#8580E8] text-[10px] font-semibold"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explainable AI Fit Reasons Box */}
              <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#17182B] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#8580E8]" />
                    <span>Why This Creator Fits:</span>
                  </span>
                  <span className="text-[10px] text-[#8B90A5]">Cosine Dist: 0.06</span>
                </div>
                <ul className="space-y-1 text-[11px] text-[#626782]">
                  {creator.keyFitReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Mini Match Factor Bar Breakdown */}
                <div className="pt-2 border-t border-[#E7E8F0] grid grid-cols-5 gap-1 text-[9px] text-center text-[#8B90A5]">
                  <div>
                    <div className="h-1 bg-[#8580E8] rounded-full mb-1" style={{ width: `${creator.matchBreakdown.semantic}%` }}></div>
                    <span>Sem {creator.matchBreakdown.semantic}%</span>
                  </div>
                  <div>
                    <div className="h-1 bg-emerald-500 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.audience}%` }}></div>
                    <span>Aud {creator.matchBreakdown.audience}%</span>
                  </div>
                  <div>
                    <div className="h-1 bg-blue-500 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.performance}%` }}></div>
                    <span>Perf {creator.matchBreakdown.performance}%</span>
                  </div>
                  <div>
                    <div className="h-1 bg-purple-500 rounded-full mb-1" style={{ width: `${creator.matchBreakdown.platform}%` }}></div>
                    <span>Plat {creator.matchBreakdown.platform}%</span>
                  </div>
                  <div>
                    <div className="h-1 bg-[#F4511E] rounded-full mb-1" style={{ width: `${creator.matchBreakdown.brandFit}%` }}></div>
                    <span>Brand {creator.matchBreakdown.brandFit}%</span>
                  </div>
                </div>
              </div>

              {/* Metrics & Action Footer */}
              <div className="pt-3 border-t border-[#E7E8F0] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3 text-xs text-[#626782]">
                  <div>
                    <span className="block font-bold text-[#17182B] text-xs">
                      {creator.subscribers.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8B90A5]">Subscribers</span>
                  </div>
                  <div className="border-l border-[#E7E8F0] pl-3">
                    <span className="block font-bold text-[#17182B] text-xs">
                      {creator.avgViews.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8B90A5]">Avg Views</span>
                  </div>
                  <div className="border-l border-[#E7E8F0] pl-3">
                    <span className="block font-bold text-[#17182B] text-xs">
                      {creator.engagementRate}%
                    </span>
                    <span className="text-[10px] text-[#8B90A5]">Eng. Rate</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleShortlist(creator.id)}
                    className={`p-2 rounded-xl border transition ${
                      creator.isShortlisted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-[#F8F9FC] border-[#E7E8F0] text-[#8B90A5] hover:text-red-500 hover:bg-white'
                    }`}
                    title={creator.isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                  >
                    <Bookmark className={`w-4 h-4 ${creator.isShortlisted ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCreatorId(creator.id);
                      setSelectedCampaignId(campaigns[0]?.id || '');
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite to Campaign Modal */}
      {selectedCreatorId && activeCreator && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E7E8F0] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E8F0]">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#F4511E]" />
                <h3 className="font-bold text-base text-[#17182B]">Invite to Campaign</h3>
              </div>
              <button
                onClick={() => setSelectedCreatorId(null)}
                className="text-[#8B90A5] hover:text-[#17182B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0]">
              <img
                src={activeCreator.avatar}
                alt={activeCreator.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <p className="text-sm font-bold text-[#17182B]">{activeCreator.name}</p>
                <p className="text-xs text-[#626782]">
                  {activeCreator.handle} • {activeCreator.matchScore}% Match
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#17182B]">Select Target Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white"
              >
                {campaigns.map((cmp) => (
                  <option key={cmp.id} value={cmp.id}>
                    {cmp.title} (Budget: ₹{cmp.budgetMin.toLocaleString()} - ₹{cmp.budgetMax.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">Rate Estimate: ₹{activeCreator.rateEstimate.toLocaleString()}</span>
              <span className="text-[11px] text-emerald-700">
                CRAB Deal Intelligence indicates this creator fits comfortably within your selected campaign budget.
              </span>
            </div>

            {inviteSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-center font-bold text-xs flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Invitation Sent & Added to Collaborations!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCreatorId(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#E7E8F0] text-xs font-semibold text-[#626782] hover:bg-[#F5F6FA]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  className="w-1/2 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Invite</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
