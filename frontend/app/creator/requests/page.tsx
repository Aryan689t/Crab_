'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Search,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Check,
  X,
  IndianRupee,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';

interface RequestItem {
  id: string;
  brand: string;
  title: string;
  logoBg: string;
  logoText: string;
  status: 'New' | 'In Discussion' | 'Offer Received' | 'Closed';
  isNew: boolean;
  timeAgo: string;
  budget: string;
  deliverables: string;
  snippet: string;
}

const REQUESTS_DATA: RequestItem[] = [
  {
    id: 'req_1',
    brand: 'AWS',
    title: 'Cloud Creator Program',
    logoBg: '#232F3E',
    logoText: '#FF9900',
    status: 'New',
    isNew: true,
    timeAgo: '2 hours ago',
    budget: '₹50,000',
    deliverables: '1 Dedicated YouTube Video breakdown',
    snippet:
      'Hi Alex, we reviewed your recent cloud architecture videos and would love to partner on an educational developer series.',
  },
  {
    id: 'req_2',
    brand: 'Cursor',
    title: 'AI Coding Tools Campaign',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'New',
    isNew: true,
    timeAgo: '5 hours ago',
    budget: '₹65,000',
    deliverables: '2 Workflow demo tutorials + Social posts',
    snippet:
      'We think your coding tutorials are an ideal fit for our engineer audience. Let us know if you have availability this month!',
  },
  {
    id: 'req_3',
    brand: 'Notion',
    title: 'Productivity for Creators',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'In Discussion',
    isNew: false,
    timeAgo: '1 day ago',
    budget: '₹40,000',
    deliverables: '1 Template walk-through video',
    snippet:
      'We received your response on the deliverable schedule. Can we schedule a quick chat to align on publishing dates?',
  },
  {
    id: 'req_4',
    brand: 'Logitech',
    title: 'Tech Gear Review Series',
    logoBg: '#00B8FC',
    logoText: '#FFFFFF',
    status: 'Offer Received',
    isNew: false,
    timeAgo: '2 days ago',
    budget: '₹35,000',
    deliverables: 'Desk setup integration + YouTube Short',
    snippet:
      'Official agreement draft sent. Please review the compensation terms and deliverable dates.',
  },
  {
    id: 'req_5',
    brand: 'JetBrains',
    title: 'Developer Tools Campaign',
    logoBg: '#000000',
    logoText: '#FF318C',
    status: 'Closed',
    isNew: false,
    timeAgo: '1 week ago',
    budget: '₹55,000',
    deliverables: 'IDE extension tutorial',
    snippet:
      'Collaboration successfully completed and deliverables verified by marketing team.',
  },
];

export default function CreatorRequestsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('All Requests');
  const [selectedReqId, setSelectedReqId] = useState<string>(REQUESTS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  const handleAcceptAndOpenThread = async (reqItem: RequestItem) => {
    if (acceptingId) return;
    setAcceptingId(reqItem.id);
    setErrorMessage(null);

    try {
      if (!token) {
        throw new Error('Please sign in to accept invitations.');
      }

      const res = await fetchApi<{
        data: {
          conversationId: string;
          status: string;
        };
      }>(
        `/api/requests/${reqItem.id}/accept`,
        {
          method: 'POST',
          body: JSON.stringify({
            snippet: reqItem.snippet,
            budget: reqItem.budget,
            deliverables: reqItem.deliverables,
          }),
        },
        token
      );

      setAcceptedIds((prev) => [...prev, reqItem.id]);
      const convId = res?.data?.conversationId;
      if (convId) {
        router.push(`/creator/inbox?conversationId=${convId}`);
      } else {
        router.push('/creator/inbox');
      }
    } catch (err: any) {
      console.error('[REQUESTS] Failed to accept invitation:', err);
      setErrorMessage(err.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const TABS = [
    { label: 'All Requests', count: REQUESTS_DATA.length },
    { label: 'New', count: REQUESTS_DATA.filter((r) => r.status === 'New').length },
    { label: 'In Discussion', count: REQUESTS_DATA.filter((r) => r.status === 'In Discussion').length },
    { label: 'Offer Received', count: REQUESTS_DATA.filter((r) => r.status === 'Offer Received').length },
  ];

  const filteredRequests = REQUESTS_DATA.filter((req) => {
    const matchesTab = activeTab === 'All Requests' || req.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      req.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedReq =
    REQUESTS_DATA.find((r) => r.id === selectedReqId) || filteredRequests[0] || REQUESTS_DATA[0];

  const handleAction = (type: 'accept' | 'decline') => {
    if (type === 'accept') {
      handleAcceptAndOpenThread(selectedReq);
    } else {
      setActionFeedback(`Declined invitation from ${selectedReq.brand}.`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Direct Inquiries"
          titlePrefix="Review collaboration"
          highlightText="invitations."
          description="Brands that evaluated your AI intelligence profile and invited you directly to sponsor their campaigns."
        />

        {/* Action Toast Feedback */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs transition animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Top Summary Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">New Invitations</div>
            <div className="text-2xl font-bold text-[#FF6B00] mt-1">2</div>
            <div className="text-[11px] text-[#FF6B00] font-semibold mt-0.5">Awaiting your response</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">In Discussion</div>
            <div className="text-2xl font-bold text-[#171717] mt-1">1</div>
            <div className="text-[11px] text-[#737373] mt-0.5">Active conversations</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">Offers Received</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">1</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Ready for signature</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs">
            <div className="text-[11px] text-[#737373] font-medium">Average Budget</div>
            <div className="text-2xl font-bold text-[#171717] mt-1">₹51,000</div>
            <div className="text-[11px] text-[#737373] mt-0.5">Per dedicated video</div>
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

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invitations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
            />
          </div>
        </div>

        {/* 4. Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Request Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E1DA] text-center text-xs text-[#737373]">
                No requests match your filter.
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedReq.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3.5 shadow-xs ${
                      isSelected
                        ? 'bg-white border-[#FF6B00] ring-1 ring-[#FF6B00]/40'
                        : 'bg-white border-[#E7E1DA] hover:border-[#171717]/30'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: req.logoBg, color: req.logoText }}
                    >
                      {req.brand.slice(0, 3).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-xs text-[#737373]">
                            {req.brand}
                          </span>
                          <StarRating rating={4.8} size="xs" />
                          {req.isNew && (
                            <span className="w-2 h-2 rounded-full bg-[#FF6B00]" title="New invitation" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#737373]">{req.timeAgo}</span>
                      </div>

                      <h4 className="font-bold text-sm text-[#171717] truncate mt-0.5">
                        {req.title}
                      </h4>

                      <p className="text-xs text-[#737373] line-clamp-1 mt-1 leading-relaxed">
                        {req.snippet}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#171717] mt-2.5 pt-2 border-t border-[#E7E1DA]/60">
                        <span>{req.budget}</span>
                        <span className="text-[#FF6B00] text-[11px]">View Brief →</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Request Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E1DA] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E7E1DA]">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedReq.logoBg, color: selectedReq.logoText }}
                >
                  {selectedReq.brand.slice(0, 3).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                      {selectedReq.brand}
                    </span>
                    <StarRating rating={4.8} size="xs" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#171717] mt-0.5">
                    {selectedReq.title}
                  </h2>
                  <div className="text-xs text-[#737373] mt-1">
                    Invited {selectedReq.timeAgo}
                  </div>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold self-start border ${
                  selectedReq.status === 'New'
                    ? 'bg-[#FFF4EB] text-[#FF6B00] border-[#FF6B00]/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {selectedReq.status}
              </span>
            </div>

            {/* Brand Invitation Note */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#171717]">Brand Invitation Note</div>
              <p className="text-xs sm:text-sm text-[#383838] p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] leading-relaxed">
                "{selectedReq.snippet}"
              </p>
            </div>

            {/* Campaign Offer Details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-[#E7E1DA]">
              <div>
                <div className="text-[11px] text-[#737373]">Proposed Budget</div>
                <div className="text-lg font-bold text-[#171717] mt-0.5">
                  {selectedReq.budget}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#737373]">Required Deliverables</div>
                <div className="text-xs font-semibold text-[#171717] mt-1">
                  {selectedReq.deliverables}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E7E1DA] flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={acceptingId === selectedReq.id || acceptedIds.includes(selectedReq.id)}
                onClick={() => handleAcceptAndOpenThread(selectedReq)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {acceptingId === selectedReq.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accepting & Opening Thread...</span>
                  </>
                ) : acceptedIds.includes(selectedReq.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accepted (Opening Inbox...)</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Accept & Open Thread</span>
                  </>
                )}
              </button>

              <Link
                href="/creator/inbox"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-[#171717] text-xs font-bold transition text-center"
              >
                Discuss Terms
              </Link>

              <button
                type="button"
                onClick={() => handleAction('decline')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-[#737373] hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
