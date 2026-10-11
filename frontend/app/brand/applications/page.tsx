'use client';

import React, { useState } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
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
} from 'lucide-react';

export default function BrandApplicationsPage() {
  const { applications, updateApplicationStatus } = useMockStore();
  const [filter, setFilter] = useState<string>('ALL');

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  return (
    <AppShell
      title="Creator Applications & Inbound Proposals"
      subtitle="Review creator proposals, evaluate AI match evidence, and accept collaborations."
    >
      <div className="flex items-center space-x-2 border-b border-[#E7E8F0] pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          All Incoming ({applications.length})
        </button>
        <button
          onClick={() => setFilter('SUBMITTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            filter === 'SUBMITTED'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {applications.filter((a) => a.status === 'SUBMITTED').length}
          </span>
        </button>
        <button
          onClick={() => setFilter('ACCEPTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filter === 'ACCEPTED'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          Accepted & Signed
        </button>
      </div>

      <section className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E7E8F0] space-y-3">
            <Users className="w-8 h-8 mx-auto text-[#8B90A5]" />
            <p className="text-sm font-bold text-[#17182B]">No applications in this category</p>
            <p className="text-xs text-[#626782]">Find creators and send direct invitations.</p>
            <Link
              href="/brand/creators"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F4511E] text-white text-xs font-semibold"
            >
              <span>Discover Creators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#8580E8]/40 transition"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={app.creatorAvatar}
                  alt={app.creatorName}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E7E8F0]"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-[#17182B]">{app.creatorName}</h3>
                    <span className="text-xs text-[#8B90A5]">{app.creatorHandle}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8580E8]/15 to-[#F4511E]/15 text-xs font-bold text-[#17182B]">
                      {app.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#17182B]">Campaign: {app.campaignTitle}</p>
                  <p className="text-xs text-[#626782]">{app.deliverablesSummary}</p>

                  {app.note && (
                    <p className="text-[11px] text-[#8580E8] italic bg-[#F8F9FC] p-2 rounded-lg border border-[#E7E8F0] mt-1">
                      Creator pitch: "{app.note}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 self-start md:self-center">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-[#17182B] block">
                    ₹{app.proposedRate.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8B90A5]">Proposed Fee</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                    app.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'OFFER_RECEIVED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {app.status.replace('_', ' ')}
                </span>

                {app.status === 'SUBMITTED' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      Accept Proposal
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'DECLINED')}
                      className="px-3 py-2 rounded-xl bg-[#F5F6FA] hover:bg-red-50 hover:text-red-600 text-[#626782] text-xs font-semibold border border-[#E7E8F0]"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
