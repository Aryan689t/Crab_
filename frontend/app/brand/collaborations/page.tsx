'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../lib/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Youtube,
  Play,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';

interface DeliverableItem {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'AWAITING_VIDEO' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedVideo?: {
    videoId: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    publishedAt: string;
    submittedAt: string;
  } | null;
  feedback?: string | null;
}

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
  deliverables: DeliverableItem[];
}

const DEFAULT_BRAND_COLLABS: BrandCollaborationItem[] = [
  {
    id: 'collab_acme_cloud',
    creator: {
      name: 'Alex Chen',
      handle: '@alexchen_tech',
      avatar: 'AC',
      niche: 'Fullstack Dev & Cloud Infrastructure',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
    category: 'Cloud Infrastructure',
    status: 'IN_PROGRESS',
    agreedAmount: '₹75,000',
    deadline: 'Nov 15, 2026',
    deliverables: [
      {
        id: 'deliv_yt_01',
        type: 'YOUTUBE_VIDEO',
        title: 'Dedicated 12-minute YouTube video tutorial',
        description: 'Hands-on technical tutorial, code demonstration, and CLI deep dive with dedicated brand mention.',
        status: 'AWAITING_VIDEO',
        submittedVideo: null,
      },
      {
        id: 'deliv_yt_02',
        type: 'PINNED_COMMENT',
        title: 'Pinned comment code snippet & resource link',
        description: 'Pinned comment with direct resource link, documentation, and promotional UTM code.',
        status: 'AWAITING_VIDEO',
        submittedVideo: null,
      },
    ],
  },
];

export default function BrandCollaborationsPage() {
  const { user, token } = useAuth();
  const [collabs, setCollabs] = useState<BrandCollaborationItem[]>(DEFAULT_BRAND_COLLABS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Load Brand Collaborations
  const loadBrandCollaborations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchApi<{ data: any[] }>('/api/brands/me/collaborations', {}, token);
      if (res?.data && res.data.length > 0) {
        const mapped: BrandCollaborationItem[] = res.data.map((c: any) => {
          const creatorName = c.creator?.displayName || 'Creator Partner';
          const handle = c.creator?.socialAccounts?.[0]?.username || `@${creatorName.toLowerCase().replace(/\s+/g, '')}`;
          const initials = creatorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

          return {
            id: c.id,
            creator: {
              name: creatorName,
              handle,
              avatar: initials || 'CP',
              niche: c.creator?.bio || 'Verified Tech Creator',
            },
            campaignTitle: c.campaign?.title || 'Brand Partnership',
            category: c.campaign?.platform || 'Developer Platform',
            status: c.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
            agreedAmount: `₹${(Number(c.agreedAmount) || c.campaign?.budgetMin || 75000).toLocaleString()}`,
            deadline: c.deadline
              ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Nov 15, 2026',
            deliverables: Array.isArray(c.deliverables) && c.deliverables.length > 0
              ? c.deliverables
              : DEFAULT_BRAND_COLLABS[0].deliverables,
          };
        });
        setCollabs(mapped);
      } else {
        setCollabs(DEFAULT_BRAND_COLLABS);
      }
    } catch (err: any) {
      console.warn('[BRAND_COLLABORATIONS] Failed to load live data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandCollaborations();
  }, [token]);

  // Brand Reviews Deliverable (Approve or Reject)
  const handleReviewDeliverable = async (
    collabId: string,
    deliverableId: string,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    if (!token) return;
    setReviewingId(deliverableId);

    try {
      const res = await fetchApi<{
        success: boolean;
        message: string;
        data: any;
      }>(
        `/api/collaborations/${collabId}/review-deliverable`,
        {
          method: 'POST',
          body: JSON.stringify({
            deliverableId,
            decision,
            feedback: decision === 'APPROVED' ? 'Approved by Acme Cloud brand team.' : 'Revision requested.',
          }),
        },
        token
      );

      if (res?.success) {
        // Optimistically update deliverable in state
        setCollabs((prev) =>
          prev.map((c) => {
            if (c.id !== collabId) return c;
            const updatedDeliverables = c.deliverables.map((d) => {
              if (d.id !== deliverableId) return d;
              return {
                ...d,
                status: decision,
                feedback: decision === 'APPROVED' ? 'Approved by brand.' : 'Revision requested.',
              };
            });
            const allApproved = updatedDeliverables.every((d) => d.status === 'APPROVED');
            return {
              ...c,
              deliverables: updatedDeliverables,
              status: allApproved ? 'COMPLETED' : c.status,
            };
          })
        );

        setActionNotice(
          decision === 'APPROVED'
            ? 'Deliverable approved! Progress updated.'
            : 'Revision feedback sent to creator.'
        );
        invalidateApiCache('/api/collaborations');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to review deliverable.');
    } finally {
      setReviewingId(null);
    }
  };

  const filteredCollabs = collabs.filter((c) => {
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
        {/* Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Active Partnerships"
            titlePrefix="Active & contracted"
            highlightText="creator partnerships."
            description="Inspect submitted YouTube tutorial videos, approve deliverables, and manage milestone disbursements."
          />

          <Link
            href="/brand/creators"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] text-xs font-semibold shadow-xs transition self-start md:self-center shrink-0"
          >
            <span>Discover Creators</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {['ALL', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  activeTab === tab
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xs'
                    : 'bg-[#F8F6F2] text-[#525252] border-[#E7E1DA] hover:border-[#171717]/30 hover:text-[#171717]'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

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

        {/* Collaborations List */}
        <section className="space-y-6">
          {filteredCollabs.map((collab) => {
            const completedCount = collab.deliverables.filter((d) => d.status === 'APPROVED').length;
            const progressPct = Math.round((completedCount / collab.deliverables.length) * 100);

            return (
              <div
                key={collab.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-xs space-y-6 hover:shadow-sm transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E7E1DA] pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {collab.creator.avatar}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                          {collab.category}
                        </span>
                        <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                          <span>Creator: {collab.creator.name}</span>
                          <StarRating rating={4.9} size="xs" />
                          <span className="text-[#737373] font-normal">({collab.creator.handle})</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-[#171717]">{collab.campaignTitle}</h3>

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
                    <div className="text-xl font-extrabold text-[#171717]">{collab.agreedAmount}</div>
                  </div>
                </div>

                {/* Deliverables Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <span>Deliverable Verification: {completedCount} of {collab.deliverables.length} Approved</span>
                    <span className="font-bold text-[#FF6B00]">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F6F2] border border-[#E7E1DA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Deliverables Review Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Contracted Deliverables & Submission Review
                  </h4>

                  <div className="space-y-4">
                    {collab.deliverables.map((deliv) => {
                      const isSubmitted = deliv.status === 'SUBMITTED';
                      const isApproved = deliv.status === 'APPROVED';
                      const isAwaiting = deliv.status === 'AWAITING_VIDEO';

                      return (
                        <div
                          key={deliv.id}
                          className="p-5 rounded-2xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <Youtube className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-bold text-sm text-neutral-900">{deliv.title}</span>
                                <p className="text-xs text-neutral-500 mt-0.5">{deliv.description}</p>
                              </div>
                            </div>

                            <div>
                              {isAwaiting && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-200/80 text-neutral-700">
                                  Pending Creator Upload
                                </span>
                              )}
                              {isSubmitted && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-blue-600" />
                                  Needs Brand Approval
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Approved by Brand
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Submitted Video Detail & Actions */}
                          {deliv.submittedVideo && (
                            <div className="p-4 rounded-xl bg-white border border-[#E7E1DA] flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-24 h-14 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative">
                                  <img
                                    src={deliv.submittedVideo.thumbnailUrl}
                                    alt={deliv.submittedVideo.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-neutral-900 truncate">
                                    {deliv.submittedVideo.title}
                                  </h5>
                                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                    <span className="font-mono">ID: {deliv.submittedVideo.videoId}</span>
                                    <span>•</span>
                                    <span>Submitted {new Date(deliv.submittedVideo.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={deliv.submittedVideo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 rounded-xl border border-[#E7E1DA] hover:bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center gap-1.5"
                                >
                                  <span>Watch Video</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                                </a>

                                {isSubmitted && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={reviewingId === deliv.id}
                                      onClick={() => handleReviewDeliverable(collab.id, deliv.id, 'APPROVED')}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve Deliverable</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Chat Link */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    Creator: <span className="font-semibold text-neutral-800">{collab.creator.name}</span>
                  </div>
                  <Link
                    href="/brand/inbox"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8F6F2] hover:bg-neutral-200 text-xs font-bold text-neutral-900 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Open Creator Chat</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
