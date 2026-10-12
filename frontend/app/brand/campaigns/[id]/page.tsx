'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalPageHeader } from '../../../../components/creator/PortalPageHeader';
import { useMockStore } from '../../../../mock/store';
import { useAuth } from '../../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../../lib/api';
import {
  Layers,
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  FileCheck,
  Check,
  X,
  Send,
  Eye,
  TrendingUp,
  ShieldCheck,
  Building2,
  Plus,
  Loader2,
} from 'lucide-react';

export default function CampaignWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const campaignId = unwrappedParams?.id || 'cmp_aws_01';
  const { campaigns, applications, updateApplicationStatus } = useMockStore();

  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'deliverables' | 'aiInsights' | 'payments'>('overview');
  const [apiCampaign, setApiCampaign] = useState<any>(null);
  const [apiApps, setApiApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCampaignData = async () => {
      if (!token || !campaignId) return;
      setLoading(true);
      try {
        const [campRes, appsRes] = await Promise.allSettled([
          fetchApi<{ data: any }>(`/api/campaigns/${campaignId}`, {}, token),
          fetchApi<{ data: any[] }>(`/api/campaigns/${campaignId}/applications`, {}, token),
        ]);
        if (mounted && campRes.status === 'fulfilled' && campRes.value?.data) {
          setApiCampaign(campRes.value.data);
        }
        if (mounted && appsRes.status === 'fulfilled' && appsRes.value?.data) {
          setApiApps(appsRes.value.data);
        }
      } catch (err) {
        console.warn('[CAMPAIGN DETAIL] API fetch fallback to local store:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCampaignData();

    return () => {
      mounted = false;
    };
  }, [campaignId, token]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      if (token) {
        await fetchApi(`/api/applications/${appId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        }, token);
        invalidateApiCache('/applications');
        invalidateApiCache('/brands');
      }
      setApiApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      updateApplicationStatus(appId, newStatus as any);
    } catch (err) {
      console.warn('[CAMPAIGN_WORKSPACE] update status fallback:', err);
      updateApplicationStatus(appId, newStatus as any);
    } finally {
      setUpdatingId(null);
    }
  };

  const mockFallback =
    campaigns.find((c) => c.id === campaignId) ||
    campaigns[0] || {
      id: campaignId,
      title: 'AWS Developer Cloud Acceleration Sprint',
      brandName: 'Amazon Web Services',
      budgetMin: 30000,
      budgetMax: 75000,
      status: 'ACTIVE',
      timeline: 'Nov 1 - Nov 20, 2026',
      objective: 'Drive developer adoption and hands-on tutorials for serverless AI deployments.',
      deliverables: ['1 Dedicated YouTube Video', 'Pinned comment link', 'GitHub sample repo'],
      aiBriefSummary: 'Technical brief targeting developers with high intent in cloud hosting.',
    };

  const campaign = apiCampaign
    ? {
        id: apiCampaign.id,
        title: apiCampaign.title,
        brandName: apiCampaign.brand?.name || mockFallback.brandName,
        budgetMin: Number(apiCampaign.budgetMin) || mockFallback.budgetMin,
        budgetMax: Number(apiCampaign.budgetMax) || mockFallback.budgetMax,
        status: apiCampaign.status || mockFallback.status,
        coverImage: apiCampaign.coverImage || apiCampaign.cover_image || mockFallback.coverImage,
        timeline:
          typeof apiCampaign.timeline === 'object' && apiCampaign.timeline?.display
            ? apiCampaign.timeline.display
            : typeof apiCampaign.timeline === 'object' && apiCampaign.timeline?.start
            ? `${apiCampaign.timeline.start} - ${apiCampaign.timeline.end}`
            : mockFallback.timeline,
        objective: apiCampaign.objective || apiCampaign.description || mockFallback.objective,
        deliverables:
          typeof apiCampaign.timeline === 'object' && Array.isArray(apiCampaign.timeline?.deliverables)
            ? apiCampaign.timeline.deliverables
            : mockFallback.deliverables,
        requiredReach: apiCampaign.requiredReach || mockFallback.requiredReach || 40000,
        aiBriefSummary:
          apiCampaign.aiProfile?.semanticSummary ||
          `AI brief targeting ${apiCampaign.creatorNiche || 'qualified creators'}.`,
      }
    : mockFallback;

  const campaignApplications = React.useMemo(() => {
    if (apiApps.length > 0) {
      const mapped = apiApps.map((a: any) => ({
        id: a.id,
        creatorId: a.creator?.id || 'creator_01',
        creatorName: a.creator?.displayName || 'Creator Partner',
        creatorHandle: a.creator?.socialAccounts?.[0]?.username || '@verifiedcreator',
        creatorAvatar: a.creator?.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        status: a.status || 'SUBMITTED',
        proposedRate: Number(a.proposedRate) || campaign.budgetMin,
        matchScore: 92,
        deliverablesSummary: '1 Dedicated Video + Social Integration',
        note: a.pitch || '',
      }));
      const dbIds = new Set(mapped.map((m: any) => m.id));
      const extraMocks = applications.filter((a) => (a.campaignId === campaign.id || a.campaignTitle === campaign.title) && !dbIds.has(a.id));
      return [...mapped, ...extraMocks];
    }
    return applications.filter(
      (a) => a.campaignId === campaign.id || a.campaignTitle === campaign.title
    );
  }, [apiApps, applications, campaign.id, campaign.title, campaign.budgetMin]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Status Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#737373] hover:text-[#171717] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Campaigns</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Sprint</span>
            </span>
            <Link
              href="/brand/creators"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite More Creators</span>
            </Link>
          </div>
        </div>

        {/* Unified Page Header */}
        <PortalPageHeader
          eyebrow="Campaign Workspace"
          titlePrefix={campaign.title}
          description={`${campaign.brandName} • Budget: ₹${campaign.budgetMin?.toLocaleString()} - ₹${campaign.budgetMax?.toLocaleString()}`}
        />

        {/* Campaign Workspace Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#E7E1DA] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          Workspace Overview
        </button>
        <button
          onClick={() => setActiveTab('creators')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'creators'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Creators in Pipeline</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{campaignApplications.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'deliverables'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Deliverables & Approvals</span>
        </button>
        <button
          onClick={() => setActiveTab('aiInsights')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'aiInsights'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8580E8]" />
          <span>AI Campaign Vector</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'payments'
              ? 'bg-[#17182B] text-white shadow-sm'
              : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Budget & Payments</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#8B90A5]">
                <span className="text-xs font-medium">Budget Max</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-[#17182B]">
                ₹{campaign.budgetMax?.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#626782]">Escrow balance ready</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#8B90A5]">
                <span className="text-xs font-medium">Target Reach</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[#17182B]">
                {campaign.requiredReach?.toLocaleString() || '40,000'}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Est. 120k actual impressions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#8B90A5]">
                <span className="text-xs font-medium">Active Collaborations</span>
                <Users className="w-4 h-4 text-[#8580E8]" />
              </div>
              <div className="text-2xl font-bold text-[#17182B]">
                {campaignApplications.filter((a) => a.status === 'ACCEPTED').length} / 3
              </div>
              <p className="text-[11px] text-[#626782]">Creators signed</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#8B90A5]">
                <span className="text-xs font-medium">Campaign Timeline</span>
                <Calendar className="w-4 h-4 text-[#F4511E]" />
              </div>
              <div className="text-sm font-bold text-[#17182B] pt-1">{campaign.timeline}</div>
              <p className="text-[11px] text-emerald-600 font-medium">On Track</p>
            </div>
          </div>

          {/* Campaign Poster & AI Brief Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {campaign.coverImage && (
              <div className="bg-white rounded-2xl p-4 border border-[#E7E1DA] shadow-xs space-y-2">
                <div className="text-xs font-bold text-[#171717]">Campaign Poster</div>
                <div className="w-full h-48 rounded-xl overflow-hidden bg-black/5 border border-[#E7E1DA]">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className={`bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-3 ${campaign.coverImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                <span className="text-xs font-bold text-[#171717] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <span>AI Brief Interpretation</span>
                </span>
                <span className="text-[11px] text-[#737373]">pgvector campaign ID: {campaign.id}</span>
              </div>
              <p className="text-xs text-[#525252] leading-relaxed">{campaign.aiBriefSummary || campaign.objective}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Creators in Pipeline */}
      {activeTab === 'creators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17182B]">Creators In Review & Accepted</h2>
            <span className="text-xs text-[#8B90A5]">{campaignApplications.length} creators in this sprint</span>
          </div>

          <div className="space-y-3">
            {campaignApplications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E7E8F0] space-y-3">
                <Users className="w-8 h-8 mx-auto text-[#8B90A5]" />
                <p className="text-sm font-bold text-[#17182B]">No creators in pipeline yet</p>
                <p className="text-xs text-[#626782]">Invite high-alignment creators from the Discovery tab.</p>
                <Link
                  href="/brand/creators"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F4511E] text-white text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Matching Creators</span>
                </Link>
              </div>
            ) : (
              campaignApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 border border-[#E7E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={app.creatorAvatar}
                      alt={app.creatorName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E7E8F0]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-[#17182B]">{app.creatorName}</h3>
                        <span className="text-xs text-[#8B90A5]">{app.creatorHandle}</span>
                      </div>
                      <p className="text-xs text-[#626782] mt-0.5">{app.deliverablesSummary}</p>
                      {app.note && <p className="text-[11px] text-[#8580E8] mt-1 italic">"{app.note}"</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#17182B] block">
                        ₹{app.proposedRate?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#8B90A5]">{app.matchScore}% Match Score</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'OFFER_RECEIVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>

                    {app.status !== 'ACCEPTED' && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          disabled={updatingId === app.id}
                          onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center space-x-1"
                        >
                          {updatingId === app.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={updatingId === app.id}
                          onClick={() => handleUpdateStatus(app.id, 'DECLINED')}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F6FA] hover:bg-red-50 hover:text-red-600 disabled:opacity-50 text-[#626782] text-xs font-semibold border border-[#E7E8F0] transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Deliverables & Approvals */}
      {activeTab === 'deliverables' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#17182B]">Deliverables Milestone Tracker</h2>
          <div className="space-y-3">
            {campaign.deliverables?.map((item: string, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#17182B]">{item}</h3>
                    <p className="text-[11px] text-[#626782]">Review window: 48 hours upon submission</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Approved & In Production
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Insights */}
      {activeTab === 'aiInsights' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E7E8F0]">
            <Sparkles className="w-5 h-5 text-[#8580E8]" />
            <h2 className="text-base font-bold text-[#17182B]">AI Campaign Vector Intelligence</h2>
          </div>
          <div className="space-y-3 text-xs text-[#626782] leading-relaxed">
            <p>
              <strong className="text-[#17182B]">Normalized Intent:</strong> Developer education around serverless container deployments and AI SDK integrations.
            </p>
            <p>
              <strong className="text-[#17182B]">Ideal Audience Matrix:</strong> Software engineers (70%), DevOps architects (20%), Technical founders (10%).
            </p>
            <p>
              <strong className="text-[#17182B]">Vector Index:</strong> Embedded in 768-dimensional space matching creators in the Technology and Software Engineering clusters.
            </p>
          </div>
        </div>
      )}
      {/* Tab 5: Budget & Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E8F0]">
            <div>
              <h2 className="text-base font-bold text-[#17182B]">Budget & Payments (Test Mode)</h2>
              <p className="text-xs text-[#626782]">Manage escrow balances and payout milestones via Razorpay Test Integration.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              SANDBOX MODE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#8B90A5] uppercase tracking-wider">Total Allocated</span>
              <p className="text-xl font-bold text-[#17182B]">₹{campaign.budgetMax?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#8B90A5] uppercase tracking-wider">In Escrow</span>
              <p className="text-xl font-bold text-[#17182B]">₹15,000</p>
            </div>
            <div className="p-4 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#8B90A5] uppercase tracking-wider">Paid Out</span>
              <p className="text-xl font-bold text-[#17182B]">₹0</p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-bold text-[#17182B]">Pending Transactions</h3>
            <div className="p-4 border border-[#E7E8F0] rounded-xl flex items-center justify-between hover:bg-[#F5F6FA] transition">
              <div>
                <p className="text-sm font-bold text-[#17182B]">Creator Advance Payment — Alex Developer</p>
                <p className="text-xs text-[#626782] mt-0.5">Fund escrow account to initiate contract.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#17182B]">₹15,000</span>
                <button className="px-4 py-2 rounded-xl bg-[#F4511E] text-white text-xs font-semibold hover:bg-[#D94316] transition">
                  Fund Escrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
