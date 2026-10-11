'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockStore, getStoredCreators } from '../../../mock/store';
import { useAuth } from '../../../lib/auth-context';
import { CreatorCampaignCard } from '../../../components/ui/creator-campaign-card';
import {
  Sparkles,
  Search,
  CheckCircle2,
  X,
  ChevronDown,
  Target,
  Lightbulb,
  Zap,
  List,
  LayoutGrid,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function CreatorOpportunitiesPage() {
  const { campaigns, applications, applyToCampaign } = useMockStore();
  const { user } = useAuth();

  const creators = getStoredCreators();
  const creatorProfile = creators.find(c => c.id === 'creator_01');
  const creatorNiches = creatorProfile?.primaryNiches || [];

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [pitchNote, setPitchNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'pay' | 'ending'>('match');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const categories = useMemo(() => {
    const unique = new Set(campaigns.map(c => c.category));
    return ['All', ...Array.from(unique)];
  }, [campaigns]);

  const sortedAndFilteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'DRAFT');

    if (activeCategory !== 'All') {
      filtered = filtered.filter(c => c.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.brandName.toLowerCase().includes(query)
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

  const topMatches = useMemo(() => {
    return [...campaigns]
      .filter(c => c.status === 'ACTIVE')
      .sort((a, b) => (b.matchScore ?? 85) - (a.matchScore ?? 85))
      .slice(0, 3);
  }, [campaigns]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;

    applyToCampaign(selectedCampaignId, 'creator_01', pitchNote);
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedCampaignId(null);
      setPitchNote('');
    }, 1800);
  };

  const isAlreadyApplied = (campaignId: string) => {
    return applications.some((a) => a.campaignId === campaignId);
  };

  const SkeletonCard = () => (
    <div className="bg-surface-card rounded-[16px] border border-border-warm shadow-sm animate-pulse overflow-hidden flex flex-col sm:flex-row p-3 sm:p-5 gap-5 h-auto sm:h-[180px]">
      <div className="relative shrink-0 w-full sm:w-[220px] h-[160px] sm:h-full rounded-[10px] bg-surface-tint" />
      <div className="flex flex-col flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-surface-tint shrink-0" />
          <div className="h-3 bg-surface-tint rounded w-20" />
        </div>
        <div className="h-5 bg-surface-tint rounded w-3/4 mb-3" />
        <div className="h-10 bg-surface-tint rounded w-full mb-4" />
        <div className="mt-auto pt-3 border-t border-border-warm flex justify-between gap-3">
          <div className="h-4 bg-surface-tint rounded w-1/2" />
          <div className="h-4 bg-surface-tint rounded w-1/4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ======================= */}
        {/* MAIN DISCOVERY AREA */}
        {/* ======================= */}
        <div className={`transition-all duration-300 ${rightSidebarOpen ? 'flex-1 min-w-0' : 'w-full'} flex flex-col space-y-7`}>

          {/* Header Area */}
          <div className="space-y-3">
            <div className="inline-flex items-center px-2 py-0.5 bg-brand-peach/40 rounded text-[10px] font-bold tracking-wide text-brand-crimson uppercase">
              Opportunities
            </div>
            <h1 className="text-3xl sm:text-[32px] font-extrabold text-text-strong tracking-tight">
              Discover campaigns that <span className="text-brand-orange">fit you</span>
            </h1>
            <p className="text-text-muted text-[14px]">
              Partner with innovative brands looking for creators in your niche. Use filters and search to find the perfect fit.
            </p>
          </div>

          {/* Search Bar (Wide Style) */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search campaigns, brands or niches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-surface-card border border-border-warm rounded-[14px] text-sm font-medium text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button className="p-2 text-text-muted hover:text-brand-crimson hover:bg-surface-tint rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson" aria-label="Filters">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toolbar (Filters & Sort) */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sticky top-0 z-20 bg-surface-page/90 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 xl:pb-0 hide-scrollbar" role="group">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson border ${activeCategory === category
                      ? 'bg-brand-crimson text-white border-brand-crimson shadow-sm'
                      : 'bg-surface-card text-text-strong border-border-warm hover:border-brand-crimson/40 hover:bg-surface-tint hover:shadow-sm'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort & Display Toggles */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[13px] text-text-strong font-semibold hidden md:inline-block">
                {sortedAndFilteredCampaigns.length} campaigns
              </span>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center px-4 py-2 bg-surface-card border border-border-warm rounded-xl text-[13px] font-bold text-text-strong hover:border-brand-crimson/40 hover:bg-surface-tint cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson transition-all duration-200 shadow-sm"
                  >
                    Sort: {sortBy === 'match' ? 'Best match' : sortBy === 'pay' ? 'Highest pay' : 'Ending soon'}
                    <ChevronDown className="w-4 h-4 ml-2 text-text-muted" />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-48 bg-surface-card border border-border-warm rounded-xl shadow-elevated z-30 overflow-hidden"
                      >
                        {([
                          { id: 'match', label: 'Best match' },
                          { id: 'pay', label: 'Highest pay' },
                          { id: 'ending', label: 'Ending soon' }
                        ] as const).map(option => (
                          <button
                            key={option.id}
                            onClick={() => { setSortBy(option.id); setSortOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:bg-surface-tint ${sortBy === option.id ? 'bg-surface-tint text-brand-crimson' : 'text-text-strong hover:bg-surface-subtle'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center bg-surface-card border border-border-warm rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setRightSidebarOpen(true)}
                    className={`p-1.5 rounded-[8px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson ${rightSidebarOpen ? 'bg-brand-crimson text-white shadow-sm' : 'text-text-muted hover:text-text-strong hover:bg-surface-tint'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightSidebarOpen(false)}
                    className={`p-1.5 rounded-[8px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson ${!rightSidebarOpen ? 'bg-brand-crimson text-white shadow-sm' : 'text-text-muted hover:text-text-strong hover:bg-surface-tint'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : sortedAndFilteredCampaigns.length > 0 ? (
              <motion.div
                layout
                className="flex flex-col gap-5"
              >
                <AnimatePresence>
                  {sortedAndFilteredCampaigns.map((cmp, index) => (
                    <motion.div
                      key={cmp.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <CreatorCampaignCard
                        campaign={cmp}
                        creatorNiches={creatorNiches}
                        applied={isAlreadyApplied(cmp.id)}
                        onApply={() => setSelectedCampaignId(cmp.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center bg-surface-card rounded-2xl border border-border-warm shadow-sm"
              >
                <div className="w-16 h-16 bg-brand-peach/30 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-brand-orange" />
                </div>
                <h3 className="text-[17px] font-bold text-text-strong">No campaigns found</h3>
                <p className="text-[14px] text-text-muted mt-1 max-w-sm mb-6">There are currently no active campaigns matching your selected filters.</p>
                <button
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-xl border border-border-warm font-bold text-[14px] text-text-strong hover:bg-surface-tint transition-colors focus-visible:outline-none"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </div>
        </div>


        {/* ======================= */}
        {/* RIGHT RECOMMENDATION SIDEBAR */}
        {/* ======================= */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: '320px', marginLeft: 0 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="hidden lg:block shrink-0 sticky top-8 self-start min-h-[calc(100vh-4rem)] bg-surface-card border border-border-warm rounded-[24px] shadow-sm overflow-hidden flex flex-col"
            >
              
              {/* 1. Profile Strength */}
              <div className="p-5 border-b border-border-warm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center font-bold text-[14px] text-text-strong">
                    <Sparkles className="w-4 h-4 text-brand-orange mr-2" />
                    Profile strength: 85%
                  </div>
                </div>
                <div className="w-full h-[6px] bg-surface-tint rounded-full overflow-hidden mb-4 border border-border-warm/50">
                  <div className="h-full bg-brand-orange w-[85%]" />
                </div>
                <p className="text-[12px] text-text-muted mb-4 leading-relaxed font-medium">
                  Complete your media kit to unlock higher payouts and better matches.
                </p>
                <button className="text-[13px] font-bold text-brand-crimson bg-brand-peach/20 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-brand-peach/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson flex items-center justify-center w-full">
                  Complete profile <span className="ml-1.5 text-[15px]">→</span>
                </button>
              </div>

              {/* 2. Top Matches */}
              <div className="p-5 border-b border-border-warm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-bold text-text-strong flex items-center">
                    <Target className="w-4 h-4 mr-2 text-brand-crimson" />
                    Top matches for you
                  </h3>
                  <button className="text-[12px] font-bold text-brand-crimson cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson rounded px-1">View all</button>
                </div>

                <div className="space-y-2">
                  {topMatches.map((cmp) => (
                    <div key={`sidebar-${cmp.id}`} className="flex items-center justify-between group cursor-pointer hover:bg-surface-tint p-2 -mx-2 rounded-xl transition-all duration-200" onClick={() => setSelectedCampaignId(cmp.id)}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-[10px] bg-surface-tint border border-border-warm overflow-hidden shrink-0 relative">
                          <img 
                            src={cmp.brandLogo || ''} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute inset-0 w-full h-full bg-brand-peach/30 text-brand-crimson font-bold text-[11px] flex items-center justify-center">
                            {cmp.brandName.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="truncate">
                          <h4 className="text-[12px] font-bold text-text-strong truncate group-hover:text-brand-crimson transition-colors">{cmp.title}</h4>
                          <p className="text-[11px] font-bold text-text-strong mt-0.5">
                            ₹{cmp.budgetMax >= 1000 ? `${cmp.budgetMax / 1000}k` : cmp.budgetMax}
                          </p>
                        </div>
                      </div>
                      {/* Score Ring */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-surface-tint" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-brand-crimson" strokeDasharray={`${cmp.matchScore ?? 85}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-[9px] font-bold text-brand-crimson">{cmp.matchScore ?? 85}%</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Discovery Insights */}
              <div className="p-5 border-b border-border-warm flex-1">
                <h3 className="text-[14px] font-bold text-text-strong mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 text-brand-orange mr-2" />
                  Discovery insights
                </h3>
                <p className="text-[12px] font-medium text-text-muted leading-relaxed mb-4">
                  Based on your content and audience, brands are actively seeking creators in these niches this month.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-brand-peach/20 flex items-center justify-center"><Target className="w-3.5 h-3.5 text-brand-crimson" /></div>
                      <span className="text-[12px] font-bold text-text-strong">Technology</span>
                    </div>
                    <span className="text-[11px] font-medium text-text-muted">12 new campaigns</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-brand-peach/20 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-brand-crimson" /></div>
                      <span className="text-[12px] font-bold text-text-strong">Software Engineering</span>
                    </div>
                    <span className="text-[11px] font-medium text-text-muted">8 new campaigns</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-brand-peach/20 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-brand-crimson" /></div>
                      <span className="text-[12px] font-bold text-text-strong">AI Tools</span>
                    </div>
                    <span className="text-[11px] font-medium text-text-muted">6 new campaigns</span>
                  </div>
                </div>
              </div>

              {/* 4. Get better matches */}
              <div className="bg-brand-peach/20 p-5 relative overflow-hidden shrink-0 mt-auto">
                <div className="relative z-10">
                  <h3 className="text-[14px] font-bold text-text-strong mb-2 flex items-center">
                    <Zap className="w-4 h-4 text-brand-orange mr-2" />
                    Get better matches
                  </h3>
                  <p className="text-[12px] font-medium text-text-muted leading-relaxed mb-4 max-w-[85%]">
                    Add your audience demographics and content topics to improve recommendations.
                  </p>
                  <button className="text-[13px] font-bold text-brand-crimson bg-white px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:bg-surface-tint flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson">
                    Improve profile <span className="ml-1.5 text-[15px]">→</span>
                  </button>
                </div>
                {/* Decorative wavy gradient placeholder in bottom right corner */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-brand-orange/40 to-brand-crimson/40 rounded-full blur-2xl opacity-70 pointer-events-none" />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedCampaignId && activeCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-text-strong/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-card rounded-[20px] max-w-lg w-full border border-border-warm p-6 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-4 border-b border-border-warm">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-tint border border-border-warm shadow-sm shrink-0 overflow-hidden relative">
                    <img
                      src={activeCampaign.brandLogo || ''}
                      alt={activeCampaign.brandName}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 w-full h-full bg-brand-peach/30 text-brand-crimson font-bold text-sm flex flex-col items-center justify-center rounded-xl">
                      {activeCampaign.brandName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-brand-crimson tracking-wider uppercase mb-0.5">{activeCampaign.brandName}</p>
                    <h3 className="font-extrabold text-[17px] text-text-strong leading-tight">{activeCampaign.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaignId(null)}
                  className="text-text-muted hover:text-text-strong bg-surface-subtle p-2 rounded-full transition-colors focus-visible:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-surface-tint rounded-xl border border-brand-peach/50 space-y-2">
                <span className="font-bold text-text-strong text-[14px]">Required Deliverables</span>
                <ul className="space-y-2 mt-2">
                  {activeCampaign.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start text-[13px] font-medium text-text-muted">
                      <CheckCircle2 className="w-4 h-4 text-brand-crimson mr-2 shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleApply} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-text-strong flex justify-between">
                    Why are you a great fit?
                    <span className="text-[12px] font-medium text-text-muted font-normal">Optional pitch note</span>
                  </label>
                  <textarea
                    rows={4}
                    value={pitchNote}
                    onChange={(e) => setPitchNote(e.target.value)}
                    placeholder="Share your creative vision for this campaign and why your audience will love it..."
                    className="w-full px-4 py-3 rounded-xl border border-border-warm bg-surface-card text-[14px] text-text-strong focus:outline-none focus:ring-2 focus:ring-brand-crimson transition-all shadow-sm"
                  />
                </div>

                {applySuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-center font-bold text-[14px] flex items-center justify-center space-x-2 text-status-success"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Application Sent Successfully!</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignId(null)}
                      className="w-1/2 py-3 rounded-xl border border-border-warm text-[14px] font-bold text-text-muted hover:bg-surface-tint transition-colors focus-visible:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 rounded-xl bg-brand-crimson hover:bg-brand-orange text-white text-[14px] font-bold shadow-md transition-all flex items-center justify-center space-x-2 focus-visible:outline-none"
                    >
                      <span>Submit Pitch</span>
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
