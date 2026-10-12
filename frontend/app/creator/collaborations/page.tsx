'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Search,
  UploadCloud,
  Check,
  ChevronRight,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';

interface CollaborationItem {
  id: string;
  brand: {
    name: string;
    avatar: string;
    category: string;
  };
  campaignTitle: string;
  status: 'IN_PROGRESS' | 'CONTRACT_PENDING' | 'COMPLETED';
  agreedAmount: string;
  deadline: string;
  deliverablesCount: number;
  completedDeliverables: number;
  nextDeliverable: string;
  deliverableLinks: string[];
}

const COLLABORATIONS_DATA: CollaborationItem[] = [
  {
    id: 'collab_1',
    brand: {
      name: 'Acme Cloud',
      avatar: 'AC',
      category: 'Cloud Infrastructure',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
    status: 'IN_PROGRESS',
    agreedAmount: '₹75,000',
    deadline: 'Nov 15, 2026',
    deliverablesCount: 2,
    completedDeliverables: 1,
    nextDeliverable: 'Dedicated 12-min YouTube video tutorial',
    deliverableLinks: ['Draft script reviewed by Acme team'],
  },
  {
    id: 'collab_2',
    brand: {
      name: 'TechFlow',
      avatar: 'TF',
      category: 'AI Software',
    },
    campaignTitle: 'AI Vector Database Integration Series',
    status: 'IN_PROGRESS',
    agreedAmount: '₹95,000',
    deadline: 'Nov 28, 2026',
    deliverablesCount: 3,
    completedDeliverables: 2,
    nextDeliverable: 'Pinned comment code snippet + GitHub gist',
    deliverableLinks: ['Video rough cut approved', 'Intro benchmark recorded'],
  },
  {
    id: 'collab_3',
    brand: {
      name: 'Veloce AI',
      avatar: 'VA',
      category: 'Developer Platform',
    },
    campaignTitle: 'Fullstack Next.js Deployment Benchmark',
    status: 'COMPLETED',
    agreedAmount: '₹85,000',
    deadline: 'Oct 02, 2026',
    deliverablesCount: 2,
    completedDeliverables: 2,
    nextDeliverable: 'All deliverables verified & payment released',
    deliverableLinks: ['YouTube Video (48K views)', 'Community Post'],
  },
];

import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';

export default function CreatorCollaborationsPage() {
  const { user, token } = useAuth();
  const [dbCollabs, setDbCollabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadCreatorCollaborations() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchApi<{ data: any[] }>('/api/creators/me/collaborations', {}, token);
        if (res?.data) {
          setDbCollabs(res.data);
        }
      } catch (err) {
        console.warn('[CREATOR_COLLABORATIONS] Could not load live collaborations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCreatorCollaborations();
  }, [token]);

  const allCollabs: CollaborationItem[] = React.useMemo(() => {
    if (dbCollabs.length > 0) {
      const mapped: CollaborationItem[] = dbCollabs.map((c: any) => {
        const brandName = c.brand?.name || 'Partner Brand';
        const avatar = brandName.slice(0, 2).toUpperCase();
        const status: 'IN_PROGRESS' | 'CONTRACT_PENDING' | 'COMPLETED' =
          c.status === 'COMPLETED' ? 'COMPLETED' :
          c.status === 'PENDING' ? 'CONTRACT_PENDING' : 'IN_PROGRESS';

        return {
          id: c.id,
          brand: {
            name: brandName,
            avatar,
            category: c.brand?.category || 'Technology',
          },
          campaignTitle: c.campaign?.title || 'Brand Partnership',
          status,
          agreedAmount: `₹${(Number(c.agreedAmount) || c.campaign?.budgetMin || 50000).toLocaleString()}`,
          deadline: c.deadline
            ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Nov 30, 2026',
          deliverablesCount: 2,
          completedDeliverables: status === 'COMPLETED' ? 2 : 1,
          nextDeliverable: status === 'COMPLETED' ? 'All deliverables verified' : 'Submit creative draft for brand review',
          deliverableLinks: ['Application accepted & collaboration initiated'],
        };
      });

      const dbIds = new Set(mapped.map((m) => m.id));
      const extraMocks = COLLABORATIONS_DATA.filter((m) => !dbIds.has(m.id));
      return [...mapped, ...extraMocks];
    }
    return COLLABORATIONS_DATA;
  }, [dbCollabs]);

  const TABS = [
    { label: 'ALL', count: allCollabs.length },
    { label: 'IN_PROGRESS', count: allCollabs.filter((c) => c.status === 'IN_PROGRESS').length },
    { label: 'COMPLETED', count: allCollabs.filter((c) => c.status === 'COMPLETED').length },
  ];

  const filteredCollabs = allCollabs.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: CollaborationItem['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-[#FFF4EB] text-[#FF6B00] border-[#FF6B00]/40';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Active Partnerships"
          titlePrefix="Active and past"
          highlightText="collaborations."
          description="Manage contracted campaigns, milestone deliverables, asset submissions, and verified payouts."
        />

        {/* 2. Top Summary KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">In Progress</div>
            <div className="text-2xl font-bold text-[#FF6B00] mt-1">2</div>
            <div className="text-[11px] text-[#737373] mt-0.5">Active contracts</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">Completed</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">1</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% delivered</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">Total Contract Value</div>
            <div className="text-2xl font-bold text-[#171717] mt-1">₹2,55,000</div>
            <div className="text-[11px] text-[#737373] mt-0.5">Across partnerships</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">On-Time Rate</div>
            <div className="text-2xl font-bold text-[#171717] mt-1">100%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Reliable creator status</div>
          </div>
        </section>

        {/* 3. Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center gap-2 ${
                  activeTab === tab.label
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xs'
                    : 'bg-[#F8F6F2] text-[#525252] border-[#E7E1DA] hover:border-[#171717]/30 hover:text-[#171717]'
                }`}
              >
                <span>{tab.label.replace('_', ' ')}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.label
                      ? 'bg-white text-[#FF6B00]'
                      : 'bg-white/80 text-[#737373]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
            />
          </div>
        </div>

        {/* 4. Collaboration Cards List */}
        <div className="space-y-4">
          {filteredCollabs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E7E1DA] text-center text-xs text-[#737373]">
              No collaborations match your search criteria.
            </div>
          ) : (
            filteredCollabs.map((collab) => {
              const progressPct = Math.round(
                (collab.completedDeliverables / collab.deliverablesCount) * 100
              );

              return (
                <div
                  key={collab.id}
                  className="bg-white rounded-2xl border border-[#E7E1DA] p-6 shadow-xs hover:border-[#FF6B00]/40 transition space-y-5"
                >
                  {/* Top Bar: Brand, Title, Status, Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {collab.brand.avatar || collab.brand.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                            {collab.brand.name}
                          </span>
                          <StarRating rating={4.8} size="xs" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#171717] mt-0.5">
                          {collab.campaignTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[#737373] mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Deadline: {collab.deadline}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          collab.status
                        )}`}
                      >
                        {collab.status.replace('_', ' ')}
                      </span>
                      <div className="text-lg font-bold text-[#171717]">
                        {collab.agreedAmount}
                      </div>
                    </div>
                  </div>

                  {/* Deliverables Progress Section */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#171717]">
                        Deliverables Progress: {collab.completedDeliverables} of{' '}
                        {collab.deliverablesCount} completed
                      </span>
                      <span className="font-bold text-[#FF6B00]">{progressPct}%</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-[#F8F6F2] overflow-hidden border border-[#E7E1DA]">
                      <div
                        className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Step / Action Strip */}
                  <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-[#737373]">Current Step: </span>
                      <span className="font-semibold text-[#171717]">
                        {collab.nextDeliverable}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Link
                        href="/creator/inbox"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Chat Brand</span>
                      </Link>

                      {collab.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Submit Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
