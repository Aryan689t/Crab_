'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface BrandApplicationItem {
  id: string;
  campaignId: string;
  creatorId: string;
  pitch: string | null;
  proposedRate: number | string | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
  brandNote: string | null;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: string;
    title: string;
    budgetMin: number | null;
    budgetMax: number | null;
    platform: string | null;
    contentType: string | null;
    status: string;
  };
  creator: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    bio: string | null;
    location: string | null;
    socialAccounts?: Array<{
      platform: string;
      username: string;
      status: string;
    }>;
    metricSnapshots?: Array<{
      followers: number | null;
      averageViews: number | null;
      engagementRate: number | null;
    }>;
  };
}

export default function BrandApplicationsPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<BrandApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchApplications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ data: BrandApplicationItem[] }>('/api/brands/me/applications', {}, token);
      if (res?.data) {
        setApplications(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const handleUpdateStatus = async (applicationId: string, newStatus: 'ACCEPTED' | 'DECLINED') => {
    if (!token || processingId) return;

    setProcessingId(applicationId);
    setActionError(null);

    // Save previous state for rollback if needed
    const prevApplications = [...applications];

    // Optimistic UI update
    setApplications(prev =>
      prev.map(app => (app.id === applicationId ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await fetchApi<{ message: string; data: BrandApplicationItem }>(
        `/api/applications/${applicationId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        },
        token
      );

      // Confirm with server response
      if (res?.data) {
        setApplications(prev =>
          prev.map(app => (app.id === applicationId ? res.data : app))
        );
      }
    } catch (err: any) {
      // Rollback on error
      setApplications(prevApplications);
      setActionError(err.message || `Failed to update application status to ${newStatus}.`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = useMemo(() => {
    if (filter === 'ALL') return applications;
    return applications.filter((app) => app.status === filter);
  }, [applications, filter]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      submitted: applications.filter(a => a.status === 'SUBMITTED').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      declined: applications.filter(a => a.status === 'DECLINED').length,
    };
  }, [applications]);

  return (
    <AppShell
      title="Creator Applications & Inbound Proposals"
      subtitle="Review creator proposals, evaluate creator alignment, and accept collaborations."
    >
      {/* Error banner if action failed */}
      {actionError && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-800 underline font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs / Filter bar */}
      <div className="flex items-center space-x-2 border-b border-[#E7E8F0] pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'ALL'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          All Incoming ({counts.all})
        </button>
        <button
          onClick={() => setFilter('SUBMITTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
            filter === 'SUBMITTED'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
            {counts.submitted}
          </span>
        </button>
        <button
          onClick={() => setFilter('ACCEPTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'ACCEPTED'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          Accepted & Signed ({counts.accepted})
        </button>
        <button
          onClick={() => setFilter('DECLINED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'DECLINED'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          Declined ({counts.declined})
        </button>
      </div>

      {/* Applications content */}
      <section className="space-y-4 pt-2">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-[#E7E8F0] space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-orange" />
            <p className="text-xs font-semibold text-[#626782]">Loading campaign proposals...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E7E8F0] space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-sm font-bold text-[#17182B]">Unable to load applications</p>
            <p className="text-xs text-[#626782]">{error}</p>
            <button
              onClick={fetchApplications}
              className="px-4 py-2 rounded-xl bg-brand-crimson text-white text-xs font-semibold hover:bg-brand-orange transition"
            >
              Retry
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E7E8F0] space-y-3">
            <Users className="w-8 h-8 mx-auto text-[#8B90A5]" />
            <p className="text-sm font-bold text-[#17182B]">No applications in this category</p>
            <p className="text-xs text-[#626782]">Find creators and review published campaigns.</p>
            <Link
              href="/brand/creators"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F4511E] text-white text-xs font-semibold"
            >
              <span>Discover Creators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          filteredApps.map((app) => {
            const handle = app.creator.socialAccounts?.[0]?.username || '@creator';
            const metrics = app.creator.metricSnapshots?.[0];
            const followerStr = metrics?.followers
              ? `${(metrics.followers / 1000).toFixed(0)}k followers`
              : null;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#8580E8]/40 transition"
              >
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  {app.creator.profileImageUrl ? (
                    <img
                      src={app.creator.profileImageUrl}
                      alt={app.creator.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E7E8F0] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-brand-peach/30 text-brand-crimson font-bold flex items-center justify-center shrink-0 text-sm">
                      {app.creator.displayName.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-bold text-base text-[#17182B]">{app.creator.displayName}</h3>
                      <span className="text-xs text-[#8B90A5]">{handle}</span>
                      {followerStr && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {followerStr}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#17182B]">
                      Campaign: {app.campaign.title}
                    </p>
                    <p className="text-xs text-[#626782]">
                      Platform: {app.campaign.platform || 'YOUTUBE'} • Format: {app.campaign.contentType || 'Video'}
                    </p>

                    {app.pitch && (
                      <p className="text-[12px] text-[#17182B] bg-[#F8F9FC] p-3 rounded-lg border border-[#E7E8F0] mt-2 whitespace-pre-wrap leading-relaxed">
                        <span className="font-bold text-[#8580E8] block mb-0.5">Creator Pitch:</span>
                        "{app.pitch}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 self-start md:self-center shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-[#17182B] block">
                      {app.proposedRate
                        ? `₹${Number(app.proposedRate).toLocaleString()}`
                        : app.campaign.budgetMin
                        ? `₹${Number(app.campaign.budgetMin).toLocaleString()} (Standard)`
                        : 'Proposed'}
                    </span>
                    <span className="text-[10px] text-[#8B90A5]">Fee</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                      app.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'DECLINED'
                        ? 'bg-slate-100 text-slate-700'
                        : app.status === 'WITHDRAWN'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status === 'SUBMITTED' ? 'Pending Review' : app.status}
                  </span>

                  {app.status === 'SUBMITTED' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                        disabled={processingId === app.id}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        {processingId === app.id ? 'Updating...' : 'Accept Proposal'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'DECLINED')}
                        disabled={processingId === app.id}
                        className="px-3 py-2 rounded-xl bg-[#F5F6FA] hover:bg-red-50 hover:text-red-600 text-[#626782] text-xs font-semibold border border-[#E7E8F0] transition disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
