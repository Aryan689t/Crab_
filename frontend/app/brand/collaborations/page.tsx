'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Search,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  UploadCloud,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface BrandCollaborationItem {
  id: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    niche: string;
  };
  campaignTitle: string;
  category: string;
  status: 'IN_PROGRESS' | 'CONTRACT_PENDING' | 'COMPLETED';
  agreedAmount: string;
  deadline: string;
  deliverablesCount: number;
  completedDeliverables: number;
  currentMilestone: string;
  deliverablesList: string[];
}

const BRAND_COLLABORATIONS: BrandCollaborationItem[] = [
  {
    id: 'collab_1',
    creator: {
      name: 'Alex Chen',
      handle: '@alexchen_tech',
      avatar: 'AC',
      niche: 'Fullstack Dev & Cloud',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
    category: 'Cloud Infrastructure',
    status: 'IN_PROGRESS',
    agreedAmount: '₹75,000',
    deadline: 'Nov 15, 2026',
    deliverablesCount: 2,
    completedDeliverables: 1,
    currentMilestone: '12-min YouTube Tutorial draft reviewed by Acme engineering team',
    deliverablesList: ['Draft script reviewed', 'Video draft approved', 'Final link pending'],
  },
  {
    id: 'collab_2',
    creator: {
      name: 'Sarah Codes',
      handle: '@sarahcodes',
      avatar: 'SC',
      niche: 'AI & Vector Databases',
    },
    campaignTitle: 'AI Vector Database Integration Series',
    category: 'AI Software',
    status: 'IN_PROGRESS',
    agreedAmount: '₹95,000',
    deadline: 'Nov 28, 2026',
    deliverablesCount: 3,
    completedDeliverables: 2,
    currentMilestone: 'Pinned comment code snippet + GitHub gist benchmark repository',
    deliverablesList: ['Rough cut approved', 'Intro benchmark recorded', 'Pinned gist pending'],
  },
  {
    id: 'collab_3',
    creator: {
      name: 'Dev Tips Daily',
      handle: '@devtips',
      avatar: 'DT',
      niche: 'Developer Platform & DevOps',
    },
    campaignTitle: 'Fullstack Next.js Deployment Benchmark',
    category: 'Developer Platform',
    status: 'COMPLETED',
    agreedAmount: '₹85,000',
    deadline: 'Oct 02, 2026',
    deliverablesCount: 2,
    completedDeliverables: 2,
    currentMilestone: 'All deliverables verified & final escrow payout released',
    deliverablesList: ['YouTube Video (48K views)', 'Community Post with UTM'],
  },
];

export default function BrandCollaborationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const TABS = [
    { label: 'ALL', count: BRAND_COLLABORATIONS.length },
    { label: 'IN_PROGRESS', count: BRAND_COLLABORATIONS.filter((c) => c.status === 'IN_PROGRESS').length },
    { label: 'COMPLETED', count: BRAND_COLLABORATIONS.filter((c) => c.status === 'COMPLETED').length },
  ];

  const filteredCollabs = BRAND_COLLABORATIONS.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Active Partnerships"
            titlePrefix="Active & contracted"
            highlightText="creator partnerships."
            description="Manage contracted campaigns, milestone deliverables, creative review, and verified escrow disbursements."
          />

          <Link
            href="/brand/creators"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] text-xs font-semibold shadow-xs transition self-start md:self-center shrink-0"
          >
            <span>Contract New Creator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Collaboration Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <Clock className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="text-2xl font-bold text-[#FF6B00]">2</div>
            <p className="text-[11px] text-[#737373]">Active contracted sprints</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">1</div>
            <p className="text-[11px] text-emerald-700 font-medium">100% delivered on-time</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Contract Value</span>
              <DollarSign className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">₹2,55,000</div>
            <p className="text-[11px] text-[#737373]">Escrow secured</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Delivery Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">100%</div>
            <p className="text-[11px] text-emerald-700 font-medium">Zero overdue milestones</p>
          </div>
        </div>

        {/* 3. Toolbar & Tabs */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] self-start sm:self-auto overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.label
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                <span>{tab.label.replace('_', ' ')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
            />
          </div>
        </div>

        {/* 4. Collaborations List Cards */}
        <section className="space-y-4">
          {filteredCollabs.map((collab) => {
            const percent = Math.round(
              (collab.completedDeliverables / collab.deliverablesCount) * 100
            );

            return (
              <div
                key={collab.id}
                className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5 hover:shadow-sm transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {collab.creator.avatar}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                          {collab.category}
                        </span>
                        <span className="text-xs text-[#737373]">•</span>
                        <span className="text-xs font-semibold text-[#171717]">
                          Creator: {collab.creator.name} ({collab.creator.handle})
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#171717]">
                        {collab.campaignTitle}
                      </h3>

                      <p className="text-xs text-[#737373] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: {collab.deadline}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1.5 ${
                        collab.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-orange-50 text-[#FF6B00] border-orange-200'
                      }`}
                    >
                      {collab.status.replace('_', ' ')}
                    </span>
                    <div className="text-xl font-extrabold text-[#171717]">
                      {collab.agreedAmount}
                    </div>
                  </div>
                </div>

                {/* Deliverables Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-[#737373]">
                    <span className="font-semibold text-[#171717]">
                      Deliverables Progress: {collab.completedDeliverables} of {collab.deliverablesCount} completed
                    </span>
                    <span className="font-bold text-[#FF6B00]">{percent}%</span>
                  </div>

                  <div className="w-full h-2 bg-[#F8F6F2] border border-[#E7E1DA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Detail & Action Footer */}
                <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
                      Current Deliverable State
                    </span>
                    <p className="text-xs font-medium text-[#171717] mt-0.5 truncate">
                      {collab.currentMilestone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Link
                      href="/brand/inbox"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#FFF4EB] hover:text-[#FF6B00] text-xs font-semibold shadow-2xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Creator</span>
                    </Link>

                    {collab.status === 'IN_PROGRESS' ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Review Asset</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Paid & Released</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
