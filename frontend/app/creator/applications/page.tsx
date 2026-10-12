'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  Video,
  FileText,
  Check,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Inbox
} from 'lucide-react';

interface ApplicationItem {
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
    description: string;
    productOrService: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    platform: string | null;
    contentType: string | null;
    status: string;
    timeline: any;
    brand: {
      id: string;
      name: string;
      category: string | null;
      website: string | null;
    };
  };
}

export default function CreatorApplicationsPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const INNER_TABS = ['Application Details', 'Messages', 'Brand Info', 'Similar Opportunities'];
  const [activeInnerTab, setActiveInnerTab] = useState('Application Details');

  const fetchApplications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ data: ApplicationItem[] }>('/api/creators/me/applications', {}, token);
      if (res?.data) {
        setApplications(res.data);
        if (res.data.length > 0 && !selectedAppId) {
          setSelectedAppId(res.data[0].id);
        }
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

  // Ensure selectedAppId is valid if list updates
  useEffect(() => {
    if (applications.length > 0) {
      if (!selectedAppId || !applications.some(a => a.id === selectedAppId)) {
        setSelectedAppId(applications[0].id);
      }
    } else {
      setSelectedAppId(null);
    }
  }, [applications, selectedAppId]);

  const handleWithdraw = async (applicationId: string) => {
    if (!token || withdrawingId) return;
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw this application?');
    if (!confirmWithdraw) return;

    setWithdrawingId(applicationId);
    try {
      await fetchApi(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      }, token);

      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? { ...app, status: 'WITHDRAWN' } : app))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          color: 'text-amber-700',
          bg: 'bg-amber-100',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          color: 'text-brand-orange',
          bg: 'bg-brand-peach/20',
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          color: 'text-emerald-700',
          bg: 'bg-emerald-100',
        };
      case 'DECLINED':
        return {
          label: 'Declined',
          color: 'text-slate-600',
          bg: 'bg-slate-100',
        };
      case 'WITHDRAWN':
        return {
          label: 'Withdrawn',
          color: 'text-gray-500',
          bg: 'bg-gray-100',
        };
      default:
        return {
          label: status,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
    }
  };

  const counts = useMemo(() => {
    return {
      all: applications.length,
      submitted: applications.filter(a => a.status === 'SUBMITTED').length,
      underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      declined: applications.filter(a => a.status === 'DECLINED').length,
      withdrawn: applications.filter(a => a.status === 'WITHDRAWN').length,
    };
  }, [applications]);

  const TABS = [
    { label: 'All', count: counts.all },
    { label: 'Submitted', count: counts.submitted },
    { label: 'Under Review', count: counts.underReview },
    { label: 'Accepted', count: counts.accepted },
    { label: 'Declined', count: counts.declined },
    { label: 'Withdrawn', count: counts.withdrawn },
  ];

  const filteredApps = useMemo(() => {
    if (activeTab === 'All') return applications;
    if (activeTab === 'Submitted') return applications.filter(a => a.status === 'SUBMITTED');
    if (activeTab === 'Under Review') return applications.filter(a => a.status === 'UNDER_REVIEW');
    if (activeTab === 'Accepted') return applications.filter(a => a.status === 'ACCEPTED');
    if (activeTab === 'Declined') return applications.filter(a => a.status === 'DECLINED');
    if (activeTab === 'Withdrawn') return applications.filter(a => a.status === 'WITHDRAWN');
    return applications;
  }, [applications, activeTab]);

  const activeApp = applications.find(a => a.id === selectedAppId);

  const formatTimeline = (timeline: any) => {
    if (!timeline) return 'Flexible';
    if (typeof timeline === 'string') return timeline;
    if (timeline.display) return timeline.display;
    if (timeline.start && timeline.end) return `${timeline.start} - ${timeline.end}`;
    return '2-4 weeks';
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 min-h-screen bg-background text-text-strong font-inter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text-strong tracking-tight font-jakarta">My Applications</h1>
        <p className="text-[15px] text-text-muted mt-1">Track the status of opportunities you've applied to and view brand decisions.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-warm pb-0 mb-6 gap-4">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 pb-3 font-semibold text-[14px] transition-colors relative border-b-2 cursor-pointer ${
                activeTab === tab.label ? 'border-brand-orange text-text-strong' : 'border-transparent text-text-muted hover:text-text-strong'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === tab.label ? 'bg-brand-peach/30 text-brand-orange' : 'bg-surface-tint text-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface-card rounded-[20px] border border-border-warm">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange mb-3" />
          <p className="text-[14px] font-semibold text-text-muted">Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface-card rounded-[20px] border border-border-warm text-center p-6">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-[17px] font-bold text-text-strong">Failed to load applications</h3>
          <p className="text-[14px] text-text-muted mt-1 max-w-md mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-5 py-2.5 rounded-xl bg-brand-crimson text-white font-bold text-[13px] hover:bg-brand-orange transition-colors"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface-card rounded-[20px] border border-border-warm text-center p-6">
          <Inbox className="w-12 h-12 text-text-muted mb-3" />
          <h3 className="text-[18px] font-bold text-text-strong">No applications submitted yet</h3>
          <p className="text-[14px] text-text-muted mt-1 max-w-sm mb-6">
            Explore active brand campaigns and submit your first pitch!
          </p>
          <a
            href="/creator/opportunities"
            className="px-5 py-2.5 rounded-xl bg-brand-crimson text-white font-bold text-[14px] hover:bg-brand-orange transition-colors shadow-sm"
          >
            Discover Campaigns
          </a>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Applications List */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3">
            {filteredApps.length === 0 ? (
              <div className="p-8 text-center bg-surface-card rounded-[16px] border border-border-warm">
                <p className="text-[13px] text-text-muted">No applications in this category.</p>
              </div>
            ) : (
              filteredApps.map(app => {
                const isActive = selectedAppId === app.id;
                const badge = getStatusBadge(app.status);
                const brandInitials = (app.campaign.brand.name || 'BR').substring(0, 3).toUpperCase();
                const submittedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 rounded-[16px] border cursor-pointer transition-all flex gap-4 ${
                      isActive
                        ? 'border-brand-orange bg-brand-peach/5 shadow-sm'
                        : 'border-border-warm bg-surface-card hover:border-brand-orange/40 hover:shadow-sm'
                    }`}
                  >
                    {/* Brand Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#17182B] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                      {brandInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[15px] truncate">{app.campaign.brand.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.bg} ${badge.color} whitespace-nowrap ml-2`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-text-strong truncate">{app.campaign.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">Submitted on {submittedDate}</p>
                      {app.pitch && (
                        <p className="text-[12px] text-text-muted mt-2 line-clamp-1 italic">
                          "{app.pitch}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center text-text-muted shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail View */}
          {activeApp && (
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* Header Card */}
              <div className="bg-surface-card border border-border-warm rounded-[20px] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-[14px] bg-[#17182B] text-brand-orange flex items-center justify-center font-bold text-xl shrink-0">
                      {(activeApp.campaign.brand.name || 'BR').substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-[14px] font-bold text-text-strong uppercase tracking-wider mb-0.5">
                        {activeApp.campaign.brand.name}
                      </h2>
                      <h1 className="text-[22px] font-bold font-jakarta text-text-strong">{activeApp.campaign.title}</h1>
                      <p className="text-[14px] text-text-muted mt-1 leading-relaxed">
                        {activeApp.campaign.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {activeApp.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleWithdraw(activeApp.id)}
                        disabled={withdrawingId === activeApp.id}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {withdrawingId === activeApp.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white text-[13px] font-bold shadow-sm hover:bg-[#E05A18] transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" /> Message Brand
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-border-warm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-text-muted" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">
                        {activeApp.campaign.budgetMin && activeApp.campaign.budgetMax
                          ? `₹${Number(activeApp.campaign.budgetMin).toLocaleString()} - ₹${Number(activeApp.campaign.budgetMax).toLocaleString()}`
                          : 'Negotiable'}
                      </div>
                      <div className="text-[11px] text-text-muted font-medium">Budget Range</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center">
                      <Clock className="w-4 h-4 text-text-muted" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{formatTimeline(activeApp.campaign.timeline)}</div>
                      <div className="text-[11px] text-text-muted font-medium">Timeline</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center">
                      <Video className="w-4 h-4 text-text-muted" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{activeApp.campaign.platform || 'YOUTUBE'}</div>
                      <div className="text-[11px] text-text-muted font-medium">Platform</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center">
                      <FileText className="w-4 h-4 text-text-muted" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{activeApp.campaign.contentType || 'Dedicated Video'}</div>
                      <div className="text-[11px] text-text-muted font-medium">Content Type</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inner Tabs */}
              <div className="flex items-center gap-8 border-b border-border-warm">
                {INNER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveInnerTab(tab)}
                    className={`pb-3 text-[14px] font-semibold transition-colors border-b-2 cursor-pointer ${
                      activeInnerTab === tab ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted hover:text-text-strong'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-[15px] font-bold">Your Submitted Proposal</h3>
                    <p className="text-[13px] text-text-muted">
                      Submitted on {new Date(activeApp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Pitch Message */}
                  <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 text-[14px] leading-relaxed font-medium text-text-strong shadow-sm whitespace-pre-wrap">
                    {activeApp.pitch || 'No custom pitch provided.'}
                  </div>

                  {/* Brand Response Note if present */}
                  {activeApp.brandNote && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-[16px] p-5 shadow-sm space-y-1">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-amber-800 block">
                        Response from Brand
                      </span>
                      <p className="text-[14px] text-amber-950 font-medium leading-relaxed">
                        "{activeApp.brandNote}"
                      </p>
                    </div>
                  )}

                  {/* Financial & Alignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold mb-3">Proposed Rate</h4>
                      <div className="text-[26px] font-extrabold text-brand-orange">
                        {activeApp.proposedRate
                          ? `₹${Number(activeApp.proposedRate).toLocaleString()}`
                          : 'Budget As Stated'}
                      </div>
                      <p className="text-[12px] text-text-muted mt-1 font-medium">
                        Submitted proposal fee for required campaign deliverables.
                      </p>
                    </div>

                    <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold mb-3">Deliverables Requirement</h4>
                      <ul className="space-y-2 text-[13px] text-text-muted font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>1 Dedicated Video breakdown</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Link in description & social amplification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Status Timeline */}
                <div className="space-y-6">
                  <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                    <h4 className="text-[14px] font-bold mb-4">Application Lifecycle</h4>

                    <div className="bg-surface-tint border border-border-warm rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-brand-orange" />
                        <span className="text-[14px] font-bold text-text-strong">
                          Current: {getStatusBadge(activeApp.status).label}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-muted font-medium ml-5">
                        {activeApp.status === 'ACCEPTED'
                          ? 'Congratulations! The brand has accepted your proposal.'
                          : activeApp.status === 'DECLINED'
                          ? 'The brand declined this proposal.'
                          : activeApp.status === 'WITHDRAWN'
                          ? 'You withdrew this application.'
                          : 'The brand is currently reviewing your application.'}
                      </p>
                    </div>

                    <div className="relative pl-3 space-y-6 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-border-warm">
                      <div className="relative z-10 flex gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0 ml-[3px]" />
                        <div>
                          <h5 className="text-[13px] font-bold">Application Submitted</h5>
                          <p className="text-[11px] text-text-muted">
                            {new Date(activeApp.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ml-[3px] ${
                          activeApp.status !== 'SUBMITTED' ? 'bg-brand-orange' : 'bg-border-strong'
                        }`} />
                        <div>
                          <h5 className="text-[13px] font-bold text-text-strong">Brand Review</h5>
                          <p className="text-[11px] text-text-muted">
                            {activeApp.status !== 'SUBMITTED' ? 'Completed / In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ml-[3px] ${
                          activeApp.status === 'ACCEPTED'
                            ? 'bg-emerald-600'
                            : activeApp.status === 'DECLINED'
                            ? 'bg-red-500'
                            : 'bg-border-strong'
                        }`} />
                        <div>
                          <h5 className="text-[13px] font-bold text-text-strong">
                            {activeApp.status === 'ACCEPTED'
                              ? 'Accepted & Collaboration Initiated'
                              : activeApp.status === 'DECLINED'
                              ? 'Declined'
                              : 'Final Decision'}
                          </h5>
                          {activeApp.updatedAt && (
                            <p className="text-[11px] text-text-muted">
                              {new Date(activeApp.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
