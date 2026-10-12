'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  FileText,
  DollarSign,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface ApplicationItem {
  id: string;
  brand: string;
  title: string;
  logoBg: string;
  logoText: string;
  status: 'Under Review' | 'In Discussion' | 'Offer Received' | 'Accepted' | 'Rejected' | 'Expired';
  submittedAt: string;
  payout: string;
  deliverables: string;
  message: string;
  deadline: string;
  stage: number; // 1 to 4
}

const APPLICATIONS_DATA: ApplicationItem[] = [
  {
    id: 'app_1',
    brand: 'AWS',
    title: 'Cloud Creator Program',
    logoBg: '#232F3E',
    logoText: '#FF9900',
    status: 'Under Review',
    submittedAt: '3 days ago',
    payout: '₹45,000',
    deliverables: '1 YouTube video + 1 social post',
    message: 'Looking forward to showcasing serverless container workflows to my developer audience.',
    deadline: 'Oct 28, 2026',
    stage: 2,
  },
  {
    id: 'app_2',
    brand: 'Cursor',
    title: 'AI Coding Tools Campaign',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'In Discussion',
    submittedAt: '5 days ago',
    payout: '₹60,000',
    deliverables: '2 YouTube tutorials with workflow demo',
    message: 'Excited about collaborating! I use Cursor daily and can present deep product demos.',
    deadline: 'Nov 04, 2026',
    stage: 3,
  },
  {
    id: 'app_3',
    brand: 'Notion',
    title: 'Productivity for Creators',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'Offer Received',
    submittedAt: '1 week ago',
    payout: '₹35,000',
    deliverables: '1 Template walk-through + Community link',
    message: 'Shared my custom content calendar template structure.',
    deadline: 'Nov 12, 2026',
    stage: 4,
  },
  {
    id: 'app_4',
    brand: 'JetBrains',
    title: 'Developer Tools Campaign',
    logoBg: '#000000',
    logoText: '#FF318C',
    status: 'Accepted',
    submittedAt: '3 weeks ago',
    payout: '₹55,000',
    deliverables: 'Dedicated IDE extension tutorial',
    message: 'Proposal approved by technical marketing team.',
    deadline: 'Completed',
    stage: 4,
  },
  {
    id: 'app_5',
    brand: 'Logitech',
    title: 'Tech Gear Review Series',
    logoBg: '#00B8FC',
    logoText: '#FFFFFF',
    status: 'Rejected',
    submittedAt: '2 weeks ago',
    payout: '₹25,000',
    deliverables: 'Desk setup integration reel',
    message: 'Thank you for applying. Currently focused on US-specific creators for this round.',
    deadline: 'Closed',
    stage: 1,
  },
];

export default function CreatorApplicationsPage() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedAppId, setSelectedAppId] = useState<string>(APPLICATIONS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const TABS = [
    { label: 'All', count: APPLICATIONS_DATA.length },
    { label: 'Under Review', count: APPLICATIONS_DATA.filter((a) => a.status === 'Under Review').length },
    { label: 'In Discussion', count: APPLICATIONS_DATA.filter((a) => a.status === 'In Discussion').length },
    { label: 'Offer Received', count: APPLICATIONS_DATA.filter((a) => a.status === 'Offer Received').length },
    { label: 'Accepted', count: APPLICATIONS_DATA.filter((a) => a.status === 'Accepted').length },
  ];

  const filteredApps = APPLICATIONS_DATA.filter((app) => {
    const matchesTab = activeTab === 'All' || app.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedApp =
    APPLICATIONS_DATA.find((a) => a.id === selectedAppId) || filteredApps[0] || APPLICATIONS_DATA[0];

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Accepted':
      case 'Offer Received':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'In Discussion':
        return 'bg-[#FFF4EB] text-[#FF6B00] border-[#FF6B00]/40';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-[#F8F6F2] text-[#737373] border-[#E7E1DA]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* 1. Page Header */}
        <PortalPageHeader
          titlePrefix="Track your"
          highlightText="brand applications."
          action={
            <Link
              href="/creator/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-semibold transition shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore More Campaigns</span>
            </Link>
          }
        />

        {/* 2. Search and Tabs Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
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
                  <span>{tab.label}</span>
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

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 4. Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Applications List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredApps.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E1DA] text-center text-xs text-[#737373]">
                No applications match your filter.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3.5 shadow-xs ${
                      isSelected
                        ? 'bg-white border-[#FF6B00] ring-1 ring-[#FF6B00]/40'
                        : 'bg-white border-[#E7E1DA] hover:border-[#171717]/30'
                    }`}
                  >
                    {/* Brand Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: app.logoBg, color: app.logoText }}
                    >
                      {app.brand.slice(0, 3).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#737373] tracking-wide truncate">
                          {app.brand}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#171717] truncate mt-0.5">
                        {app.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-[#737373] mt-2 pt-2 border-t border-[#E7E1DA]/60">
                        <span>{app.payout}</span>
                        <span>{app.submittedAt}</span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 self-center transition ${
                        isSelected ? 'text-[#FF6B00]' : 'text-[#737373]'
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed View (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E1DA] p-6 shadow-xs space-y-6">
            {/* Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E7E1DA]">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 shadow-xs"
                  style={{
                    backgroundColor: selectedApp.logoBg,
                    color: selectedApp.logoText,
                  }}
                >
                  {selectedApp.brand.slice(0, 3).toUpperCase()}
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                    {selectedApp.brand}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#171717] mt-0.5">
                    {selectedApp.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        selectedApp.status
                      )}`}
                    >
                      {selectedApp.status}
                    </span>
                    <span className="text-xs text-[#737373]">
                      Submitted {selectedApp.submittedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/creator/inbox"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#FF6B00] text-white text-xs font-semibold transition shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Brand</span>
                </Link>
              </div>
            </div>

            {/* Application Progress Stepper */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#171717]">Proposal Status Tracker</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Submitted', done: true },
                  { label: 'In Review', done: selectedApp.stage >= 2 },
                  { label: 'Discussion', done: selectedApp.stage >= 3 },
                  { label: 'Final Offer', done: selectedApp.stage >= 4 },
                ].map((st, i) => (
                  <div key={st.label} className="space-y-1.5">
                    <div
                      className={`h-1.5 rounded-full transition ${
                        st.done ? 'bg-[#FF6B00]' : 'bg-[#E7E1DA]'
                      }`}
                    />
                    <div
                      className={`text-[10px] font-medium ${
                        st.done ? 'text-[#171717] font-semibold' : 'text-[#737373]'
                      }`}
                    >
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]">
              <div>
                <div className="text-[11px] text-[#737373]">Agreed Payout / Budget</div>
                <div className="text-base font-bold text-[#171717] mt-0.5">
                  {selectedApp.payout}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#737373]">Campaign Deadline</div>
                <div className="text-base font-bold text-[#171717] mt-0.5">
                  {selectedApp.deadline}
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-[#E7E1DA]/80">
                <div className="text-[11px] text-[#737373]">Deliverables</div>
                <div className="text-xs font-semibold text-[#171717] mt-0.5">
                  {selectedApp.deliverables}
                </div>
              </div>
            </div>

            {/* Proposal Message */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#171717]">Submitted Creator Pitch</div>
              <p className="text-xs text-[#525252] p-4 rounded-xl bg-white border border-[#E7E1DA] leading-relaxed">
                "{selectedApp.message}"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
