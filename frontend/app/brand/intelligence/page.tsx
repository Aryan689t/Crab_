'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  Users,
  Building2,
  Check,
  X,
  Target,
  DollarSign,
  Calendar,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Filter,
  Youtube,
  Instagram,
  Eye,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

export default function BrandIntelligencePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matches' | 'analysis' | 'radar' | 'shortlist'>('matches');
  const [reportSubtab, setReportSubtab] = useState<'match' | 'content' | 'audience' | 'collabs'>('match');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [matchesData, setMatchesData] = useState<any>(null);
  const [radarData, setRadarData] = useState<any>(null);
  const [shortlistData, setShortlistData] = useState<any[]>([]);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);

  // 1. Fetch brand's campaigns
  useEffect(() => {
    let mounted = true;
    const fetchCampaigns = async () => {
      if (!token) return;
      try {
        const res = await fetchApi<{ data: any[] }>('/api/campaigns', {}, token || undefined);
        if (mounted && res?.data && res.data.length > 0) {
          setCampaigns(res.data);
          setSelectedCampaignId(res.data[0].id);
        }
      } catch (err) {
        console.warn('[BRAND INTELLIGENCE] Campaigns fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCampaigns();
    return () => {
      mounted = false;
    };
  }, [token]);

  // 2. Fetch matches, collision radar, and shortlist for the selected campaign
  useEffect(() => {
    let mounted = true;
    const fetchCampaignDetails = async () => {
      if (!token || !selectedCampaignId) return;

      try {
        const [mRes, rRes, sRes] = await Promise.allSettled([
          fetchApi<{ data: any }>(`/api/campaigns/${selectedCampaignId}/matches`, {}, token || undefined),
          fetchApi<{ data: any }>(`/api/campaigns/${selectedCampaignId}/collision-radar`, {}, token || undefined),
          fetchApi<{ data: any[] }>(`/api/campaigns/${selectedCampaignId}/shortlist`, {}, token || undefined),
        ]);

        if (mounted) {
          if (mRes.status === 'fulfilled' && mRes.value?.data) {
            setMatchesData(mRes.value.data);
            if (mRes.value.data.creators?.length > 0) {
              setSelectedCreatorId((prev) => prev || mRes.value.data.creators[0].id);
            }
          }
          if (rRes.status === 'fulfilled' && rRes.value?.data) {
            setRadarData(rRes.value.data);
          }
          if (sRes.status === 'fulfilled' && Array.isArray(sRes.value?.data)) {
            setShortlistData(sRes.value.data);
          }
        }
      } catch (err) {
        console.warn('[BRAND INTELLIGENCE] Details fetch error:', err);
      }
    };

    fetchCampaignDetails();
    return () => {
      mounted = false;
    };
  }, [selectedCampaignId, token]);

  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || {
      id: 'cmp_demo_01',
      title: 'Cloud DevTools Creator Campaign',
      status: 'ACTIVE',
      category: 'Product Launch',
      platform: 'YouTube + Instagram',
      location: 'India',
      budgetMin: 25000,
      budgetMax: 50000,
      deadline: 'Dec 01, 2026',
    };
  }, [campaigns, selectedCampaignId]);

  // Selected Creator for the Decision Report
  const currentCreator = useMemo(() => {
    const list = matchesData?.creators || defaultCreators;
    return list.find((c: any) => c.id === selectedCreatorId) || list[0];
  }, [matchesData, selectedCreatorId]);

  // Shortlist toggle handler
  const handleToggleShortlist = async (creatorId: string) => {
    if (!token || !selectedCampaignId || shortlistingId) return;
    setShortlistingId(creatorId);

    const isAlready = shortlistData.some((s) => s.creatorId === creatorId);
    try {
      if (isAlready) {
        await fetchApi(`/api/campaigns/${selectedCampaignId}/shortlist/${creatorId}`, {
          method: 'DELETE',
        }, token || undefined);
        setShortlistData((prev) => prev.filter((s) => s.creatorId !== creatorId));
      } else {
        const res = await fetchApi<{ data: any }>(`/api/campaigns/${selectedCampaignId}/shortlist`, {
          method: 'POST',
          body: JSON.stringify({ creatorId, status: 'SHORTLISTED' }),
        }, token || undefined);
        if (res?.data) {
          setShortlistData((prev) => [res.data, ...prev]);
        }
      }
    } catch (err) {
      console.warn('[SHORTLIST TOGGLE] Error:', err);
    } finally {
      setShortlistingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E7E1DA]/80">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#171717]">
              Campaign <span className="text-[#FF6B00]">intelligence.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Find the right creators, understand the risks, and optimize your campaign.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <Link
              href="/brand/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Campaign Selector Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-[#171717]">Select a campaign</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-sm font-bold text-[#171717] focus:outline-none focus:border-[#FF6B00] min-w-[260px]"
              >
                {campaigns.length > 0 ? (
                  campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title}
                    </option>
                  ))
                ) : (
                  <option value="cmp_demo_01">Cloud DevTools Creator Campaign</option>
                )}
              </select>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-auto">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{activeCampaign.status || 'Active'}</span>
              </span>
            </div>

            {/* Campaign Parameters Tags */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#737373] pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] font-semibold text-[#171717]">
                Product Launch
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] font-semibold text-[#171717]">
                YouTube + Instagram
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] font-semibold text-[#171717]">
                India
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] font-semibold text-[#171717]">
                ₹{(Number(activeCampaign.budgetMin) || 25000).toLocaleString()} - ₹{(Number(activeCampaign.budgetMax) || 50000).toLocaleString()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] font-semibold text-[#171717]">
                Deadline: Dec 01, 2026
              </span>
            </div>
          </div>

          <Link
            href={`/brand/campaigns/${activeCampaign.id || selectedCampaignId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] text-xs font-bold text-[#171717] transition shrink-0 self-start md:self-center"
          >
            <span>View Campaign</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
          </Link>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#E7E1DA] pb-2 overflow-x-auto">
          {[
            { id: 'matches', label: 'Creator Matches' },
            { id: 'analysis', label: 'Campaign Analysis' },
            { id: 'radar', label: 'Collision Radar' },
            { id: 'shortlist', label: `Shortlist (${shortlistData.length || 3})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Creator Matches & Campaign Analysis */}
        {(activeTab === 'matches' || activeTab === 'analysis') && (
          <div className="space-y-6">
            {/* Top Brief Analysis Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">Campaign Analysis</h3>
                    <p className="text-xs text-[#737373]">
                      CRAB AI has analyzed your campaign brief and extracted key requirements.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/brand/campaigns/${activeCampaign.id}`}
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <span>Edit Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 5-column parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Campaign Objective</span>
                  </div>
                  <p className="text-xs text-[#171717] leading-relaxed">
                    Drive awareness and trial for our developer tools among frontend/cloud engineers and tech students.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Target Audience</span>
                  </div>
                  <p className="text-xs text-[#171717] leading-relaxed">
                    Software developers, cloud engineers, CS students (18-34, India).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Content Requirements</span>
                  </div>
                  <ul className="text-xs text-[#171717] space-y-0.5 leading-relaxed">
                    <li>• YouTube video (8-10 mins)</li>
                    <li>• 1 Instagram post or reel</li>
                    <li>• Show real use-case tutorial</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Budget & Timeline</span>
                  </div>
                  <div className="text-sm font-bold text-[#171717]">
                    ₹25,000 - ₹50,000
                  </div>
                  <div className="text-[11px] text-[#737373]">
                    Deadline: Dec 01, 2026
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Key Themes</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['Developer Tools', 'Productivity', 'Cloud & DevOps', 'Tech Education'].map((theme, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-semibold text-[#525252]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Split View: Left Creator List, Right Decision Report */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 cols): Recommended Creators */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E1DA]/80">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">Recommended Creators</h3>
                    <p className="text-[11px] text-[#737373]">
                      AI-ranked list based on content fit, audience alignment and campaign requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#737373] pt-1">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-[#171717] font-semibold">
                    <Filter className="w-3 h-3 text-[#737373]" />
                    <span>Filters</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <span>Sort by:</span>
                    <strong className="text-[#171717]">Best Match</strong>
                  </div>
                </div>

                {/* Ranked List of Creators */}
                <div className="space-y-2.5">
                  {(matchesData?.creators || defaultCreators).map((c: any, index: number) => {
                    const isSelected = c.id === currentCreator.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCreatorId(c.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FFF4EB]/50 border-[#FF6B00] shadow-2xs'
                            : 'bg-[#F8F6F2] border-[#E7E1DA] hover:border-[#FF6B00]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs text-[#737373] w-4 text-center">
                            {index + 1}
                          </span>

                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-[#E7E1DA]">
                            <img
                              src={c.profileImageUrl}
                              alt={c.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>
                            <div className="text-xs font-bold text-[#171717]">
                              {c.displayName}
                            </div>
                            <div className="text-[11px] text-[#737373]">
                              {c.niche} • {c.followers >= 1000 ? `${(c.followers / 1000).toFixed(1)}K` : c.followers} followers
                            </div>
                            <div className="flex items-center gap-2 pt-1 text-[#737373]">
                              <Youtube className="w-3 h-3 text-red-600" />
                              <Instagram className="w-3 h-3 text-pink-600" />
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-block">
                            {c.matchScore}% match
                          </span>
                          <div>
                            <span className="text-[11px] font-bold text-[#FF6B00] hover:underline">
                              View Profile
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (7 cols): Creator Decision Report */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
                {/* Creator Header with Avatar & Match badge */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7E1DA]/80">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/5 shrink-0 border border-[#E7E1DA]">
                      <img
                        src={currentCreator.profileImageUrl}
                        alt={currentCreator.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#171717]">
                          {currentCreator.displayName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Creator</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] mt-0.5">
                        {currentCreator.niche} • {currentCreator.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-extrabold inline-block">
                      {currentCreator.matchScore}% match
                    </span>
                    <div className="text-[10px] text-[#FF6B00] font-semibold mt-0.5">
                      Why this match?
                    </div>
                  </div>
                </div>

                {/* Subtabs for Decision Report */}
                <div className="flex items-center gap-2 border-b border-[#E7E1DA] pb-2 overflow-x-auto">
                  {[
                    { id: 'match', label: 'Match Analysis' },
                    { id: 'content', label: 'Content Fit' },
                    { id: 'audience', label: 'Audience' },
                    { id: 'collabs', label: 'Past Collaborations' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setReportSubtab(st.id as any)}
                      className={`text-xs font-bold pb-1 transition cursor-pointer border-b-2 whitespace-nowrap ${
                        reportSubtab === st.id
                          ? 'border-[#FF6B00] text-[#FF6B00]'
                          : 'border-transparent text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Match Analysis Content */}
                {reportSubtab === 'match' && (
                  <div className="space-y-4">
                    {/* Content Relevance */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Content Relevance</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-[#525252] pl-5">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Regularly creates in-depth tutorials on developer tools and software architecture.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Strong history of Next.js, cloud and productivity content.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Content style matches tutorial requirement.</span>
                        </div>
                      </div>
                    </div>

                    {/* Audience Alignment */}
                    <div className="space-y-2 pt-2 border-t border-[#E7E1DA]/60">
                      <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Audience Alignment</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-[#525252] pl-5">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Majority audience is software developers and CS students.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>High engagement from 18-34 age group in India.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Comment topics align with use-case and tool adoption.</span>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Requirement Fit */}
                    <div className="space-y-2 pt-2 border-t border-[#E7E1DA]/60">
                      <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Campaign Requirement Fit</span>
                      </div>
                      <div className="space-y-2 text-xs pl-5">
                        {[
                          { req: 'YouTube long-form video', status: 'Met', color: 'bg-emerald-50 text-emerald-800' },
                          { req: 'Instagram post or reel', status: 'Likely', color: 'bg-amber-50 text-amber-800' },
                          { req: 'Technical, non-promotional approach', status: 'Met', color: 'bg-emerald-50 text-emerald-800' },
                          { req: 'Developer tools and productivity theme', status: 'Met', color: 'bg-emerald-50 text-emerald-800' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[#525252] font-medium">{item.req}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${item.color}`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Potential Concerns & Missing Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E7E1DA]/60">
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#171717]">Potential Concerns</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Clear
                          </span>
                        </div>
                        <p className="text-[11px] text-[#525252]">No competing collaborations found.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#171717]">Missing Information</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Info
                          </span>
                        </div>
                        <p className="text-[11px] text-[#525252]">Limited history of paid brand collaborations.</p>
                      </div>
                    </div>

                    {/* Actions: Add to Shortlist & Message Creator */}
                    <div className="pt-4 border-t border-[#E7E1DA] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleShortlist(currentCreator.id)}
                        disabled={shortlistingId === currentCreator.id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          shortlistData.some((s) => s.creatorId === currentCreator.id)
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                            : 'bg-[#FF6B00] text-white hover:bg-[#E56000] shadow-xs'
                        }`}
                      >
                        {shortlistData.some((s) => s.creatorId === currentCreator.id) ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>Shortlisted</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Add to Shortlist</span>
                          </>
                        )}
                      </button>

                      <Link
                        href="/brand/inbox"
                        className="px-4 py-2 rounded-xl border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] text-xs font-bold text-[#171717] transition flex items-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Message Creator</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Subtab 2: Content Fit */}
                {reportSubtab === 'content' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#525252]">
                      Videos created by {currentCreator.displayName} matching this campaign brief:
                    </p>
                    <div className="space-y-2">
                      {[
                        { title: 'Build a Fullstack App with Next.js 14', views: '2.1M views', fit: 'High Fit' },
                        { title: 'My Developer Setup & CLI Workflow (2025)', views: '980K views', fit: 'High Fit' },
                        { title: 'Kubernetes vs Serverless for Startup Engineers', views: '620K views', fit: 'Direct Match' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#171717]">{item.title}</div>
                            <div className="text-[11px] text-[#737373]">{item.views}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                            {item.fit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtab 3: Audience */}
                {reportSubtab === 'audience' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#525252]">
                      Audience verification for {currentCreator.displayName}:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <div className="text-[11px] text-[#737373]">Primary Age Group</div>
                        <div className="text-sm font-bold text-[#171717]">18-34 years (80%)</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
                        <div className="text-[11px] text-[#737373]">Geographic Alignment</div>
                        <div className="text-sm font-bold text-[#171717]">India (48%), US (24%)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab 4: Past Collaborations */}
                {reportSubtab === 'collabs' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#525252]">
                      Previous sponsored content and partner collaborations:
                    </p>
                    <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-1">
                      <div className="font-bold text-[#171717]">DigitalOcean Sponsored Deep-Dive</div>
                      <div className="text-[11px] text-[#737373]">Feb 2024 • Tutorial video sponsored segment</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Two Cards: Collision Radar & Shortlist Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left (6 cols): Collision Radar */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#171717]">Collision Radar</h3>
                      <p className="text-xs text-[#737373]">
                        Check for potential competitor conflicts.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('radar')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View full report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(radarData?.conflicts || defaultRadarConflicts).map((conflict: any) => {
                    const isPotential = conflict.status === 'Potential';
                    const isConfirmed = conflict.status === 'Confirmed';
                    return (
                      <div
                        key={conflict.id}
                        className="p-3.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {conflict.brandName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#171717]">{conflict.brandName}</div>
                            <div className="text-[11px] text-[#737373]">{conflict.detail}</div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                            isConfirmed
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : isPotential
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {conflict.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right (6 cols): Shortlist & Campaign Workspace */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]/80">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                      <Bookmark className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#171717]">Shortlist & Campaign Workspace</h3>
                      <p className="text-xs text-[#737373]">
                        Manage your selected creators for this campaign.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('shortlist')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {shortlistData.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#E7E1DA] bg-[#F8F6F2]/50 text-center space-y-2">
                    <p className="text-xs text-[#737373]">
                      No creators shortlisted yet. Click &ldquo;Add to Shortlist&rdquo; on recommended creators above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {shortlistData.map((item: any, i: number) => {
                      const isInvited = item.status === 'INVITED';
                      const isApplied = item.status === 'APPLIED';
                      return (
                        <div
                          key={item.id || i}
                          className="p-3 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-[#E7E1DA]">
                              <img
                                src={item.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={item.displayName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[#171717]">{item.displayName}</div>
                              <div className="text-[11px] text-[#737373]">Selected Creator</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isInvited
                                  ? 'bg-blue-50 text-blue-800'
                                  : isApplied
                                  ? 'bg-purple-50 text-purple-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {item.status || 'Shortlisted'}
                            </span>
                            <Link
                              href="/brand/inbox"
                              className="text-[11px] font-bold text-[#FF6B00] hover:underline"
                            >
                              Message
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dedicated Collision Radar Tab */}
        {activeTab === 'radar' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E7E1DA]/80">
              <h3 className="text-base font-bold text-[#171717]">Collision Radar Overview</h3>
              <p className="text-xs text-[#737373]">
                Continuous monitoring of competitor sponsorships, past mentions, and exclusivity collisions.
              </p>
            </div>

            <div className="space-y-3">
              {(radarData?.conflicts || defaultRadarConflicts).map((conflict: any) => (
                <div
                  key={conflict.id}
                  className="p-4 rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[#171717]">{conflict.brandName}</div>
                    <div className="text-[#525252]">{conflict.detail}</div>
                    <div className="text-[11px] text-[#737373]">Category: {conflict.category}</div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      conflict.status === 'Confirmed'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : conflict.status === 'Potential'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {conflict.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Dedicated Shortlist Tab */}
        {activeTab === 'shortlist' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E7E1DA]/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#171717]">
                  Shortlisted Creators ({shortlistData.length})
                </h3>
                <p className="text-xs text-[#737373]">
                  Selected creators for &ldquo;{activeCampaign.title}&rdquo;.
                </p>
              </div>

              <Link
                href="/brand/creators"
                className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
              >
                <span>Find More Creators</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {shortlistData.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] space-y-2">
                <p>No creators currently shortlisted.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('matches')}
                  className="font-bold text-[#FF6B00] hover:underline"
                >
                  Review Creator Matches
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlistData.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-[#E7E1DA]">
                        <img
                          src={item.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={item.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#171717]">{item.displayName}</div>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E1DA] text-[10px] font-bold text-[#737373]">
                          {item.status || 'SHORTLISTED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E7E1DA] text-xs">
                      <Link
                        href="/brand/inbox"
                        className="font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleShortlist(item.creatorId)}
                        className="text-rose-600 hover:underline text-[11px] font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Fallback creators mirroring the approved visual specification
const defaultCreators = [
  {
    id: 'cr_01',
    displayName: 'Aryan August',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    location: 'Bangalore, India',
    niche: 'Tech Education',
    followers: 124500,
    matchScore: 94,
  },
  {
    id: 'cr_02',
    displayName: 'CodeWithSam',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    location: 'Mumbai, India',
    niche: 'Web Development',
    followers: 85200,
    matchScore: 91,
  },
  {
    id: 'cr_03',
    displayName: 'Dev Diaries',
    profileImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    location: 'Delhi, India',
    niche: 'Cloud & DevOps',
    followers: 62100,
    matchScore: 88,
  },
  {
    id: 'cr_04',
    displayName: 'TechWithPriya',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    location: 'Hyderabad, India',
    niche: 'AI & Productivity',
    followers: 48700,
    matchScore: 85,
  },
  {
    id: 'cr_05',
    displayName: 'BuildShip',
    profileImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    location: 'Pune, India',
    niche: 'No-Code & Dev Tools',
    followers: 36400,
    matchScore: 82,
  },
];

const defaultRadarConflicts = [
  {
    id: 'conf_1',
    brandName: 'DigitalOcean',
    detail: 'Mentioned in a sponsored video — Feb 2024',
    status: 'Potential',
    category: 'Cloud Infrastructure',
  },
  {
    id: 'conf_2',
    brandName: 'Linode',
    detail: 'Tutorial series collaboration — Oct 2023',
    status: 'Confirmed',
    category: 'Cloud Hosting',
  },
  {
    id: 'conf_3',
    brandName: 'Google Cloud',
    detail: 'No recent collaborations found',
    status: 'Clear',
    category: 'Enterprise Cloud',
  },
];
