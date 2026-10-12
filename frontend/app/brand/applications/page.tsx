'use client';

import React, { useState } from 'react';
import { useMockStore } from '../../../mock/store';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  Search,
  MessageSquare,
  ChevronRight,
  Clock,
  DollarSign,
  Check,
  X,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

export default function BrandApplicationsPage() {
  const { applications, updateApplicationStatus } = useMockStore();
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = applications.filter((app) => {
    const matchFilter = filter === 'ALL' || app.status === filter;
    const matchSearch =
      searchQuery.trim() === '' ||
      app.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.creatorHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const submittedCount = applications.filter((a) => a.status === 'SUBMITTED').length;
  const inDiscussionCount = applications.filter((a) => a.status === 'OFFER_RECEIVED').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Proposal Inbound"
            titlePrefix="Review creator"
            highlightText="applications & proposals."
            description="Evaluate creator pitches, review explainable AI fit scores, negotiate deliverables, and approve partnerships."
          />

          <Link
            href="/brand/creators"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] text-xs font-semibold shadow-xs transition self-start md:self-center shrink-0"
          >
            <Users className="w-4 h-4 text-[#737373]" />
            <span>Discover More Creators</span>
          </Link>
        </div>

        {/* 2. Application Pipeline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Received</span>
              <FileText className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">{applications.length}</div>
            <p className="text-[11px] text-[#737373]">Across all campaigns</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{submittedCount}</div>
            <p className="text-[11px] text-amber-700 font-medium">Action required</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Negotiations</span>
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">{inDiscussionCount}</div>
            <p className="text-[11px] text-[#737373]">Offers under discussion</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E1DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#737373]">
              <span className="text-xs font-semibold uppercase tracking-wider">Accepted Deals</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{acceptedCount}</div>
            <p className="text-[11px] text-emerald-700 font-medium">Ready for production</p>
          </div>
        </div>

        {/* 3. Toolbar & Status Filter */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by creator name, handle or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filter === 'ALL'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              All Incoming ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filter === 'SUBMITTED'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <span>Pending Review</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-xs font-bold">
                {submittedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('ACCEPTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filter === 'ACCEPTED'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Accepted & Signed ({acceptedCount})
            </button>
          </div>
        </div>

        {/* 4. Applications List */}
        <section className="space-y-4">
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E7E1DA] space-y-3">
              <Users className="w-8 h-8 mx-auto text-[#737373] opacity-60" />
              <p className="text-sm font-bold text-[#171717]">No applications found</p>
              <p className="text-xs text-[#737373]">
                Try adjusting your search criteria or invite verified creators directly.
              </p>
              <Link
                href="/brand/creators"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-semibold"
              >
                <span>Discover Creators</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={app.creatorAvatar}
                    alt={app.creatorName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E7E1DA] shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-[#171717]">{app.creatorName}</h3>
                      <span className="text-xs text-[#737373]">{app.creatorHandle}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700">
                        {app.matchScore}% Fit
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#171717]">
                      Campaign: <span className="font-normal text-[#737373]">{app.campaignTitle}</span>
                    </p>

                    <p className="text-xs text-[#737373]">
                      Deliverables: <strong className="text-[#171717]">{app.deliverablesSummary}</strong>
                    </p>

                    {app.note && (
                      <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-0.5">
                          Creator Proposal Pitch
                        </span>
                        <p className="text-xs text-[#171717] italic">"{app.note}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions & Payout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-start md:self-center shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-[#171717] block">
                      ₹{app.proposedRate.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">
                      Proposed Fee
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-center border ${
                      app.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : app.status === 'OFFER_RECEIVED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {app.status === 'SUBMITTED' ? 'Under Review' : app.status.replace('_', ' ')}
                  </span>

                  {app.status === 'SUBMITTED' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Proposal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicationStatus(app.id, 'DECLINED')}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-[#737373] text-xs font-semibold border border-[#E7E1DA] transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  <Link
                    href={`/brand/inbox?creator=${app.creatorId}`}
                    className="p-2 rounded-xl border border-[#E7E1DA] text-[#737373] hover:text-[#FF6B00] hover:bg-[#FFF4EB] transition"
                    title="Message Creator"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
