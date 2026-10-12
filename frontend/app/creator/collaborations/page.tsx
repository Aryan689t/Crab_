'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  UploadCloud,
  RefreshCw,
  Youtube,
  Play,
  Eye,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Link2,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { StarRating } from '../../../components/ui/StarRating';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../lib/api';

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
  deliverables: DeliverableItem[];
}

interface ConnectedYouTubeAccount {
  id: string;
  platform: string;
  channelId: string;
  username: string;
  handle: string;
  title: string;
  thumbnailUrl: string;
  status: string;
  lastSyncedAt: string;
  stats: {
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
  };
}

interface UploadedVideoItem {
  id: string;
  title: string;
  description: string;
  permalink: string;
  publishedAt: string;
  thumbnailUrl: string;
}

const DEFAULT_COLLABS: CollaborationItem[] = [
  {
    id: 'collab_acme_cloud',
    brand: {
      name: 'Acme Cloud',
      avatar: 'AC',
      category: 'Cloud Infrastructure',
    },
    campaignTitle: 'Cloud Infrastructure Launch & CLI Deep Dive',
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

export default function CreatorCollaborationsPage() {
  const { user, token } = useAuth();

  const [collabs, setCollabs] = useState<CollaborationItem[]>(DEFAULT_COLLABS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // YouTube integration state
  const [youtubeAccount, setYoutubeAccount] = useState<ConnectedYouTubeAccount | null>(null);
  const [recentVideos, setRecentVideos] = useState<UploadedVideoItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Video submission modal state
  const [selectedCollab, setSelectedCollab] = useState<CollaborationItem | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [submittingVideo, setSubmittingVideo] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Manual connect modal
  const [manualConnectOpen, setManualConnectOpen] = useState(false);
  const [manualHandle, setManualHandle] = useState('@');
  const [connectingManual, setConnectingManual] = useState(false);

  // 1. Load collaborations and connected YouTube accounts
  const loadData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      // Fetch collaborations
      const collabsRes = await fetchApi<{ data: any[] }>('/api/creators/me/collaborations', {}, token);
      if (collabsRes?.data && collabsRes.data.length > 0) {
        const mapped: CollaborationItem[] = collabsRes.data.map((c) => ({
          id: c.id,
          brand: {
            name: c.brand?.name || 'Partner Brand',
            avatar: (c.brand?.name || 'PB').slice(0, 2).toUpperCase(),
            category: c.brand?.category || 'Technology',
          },
          campaignTitle: c.campaign?.title || 'Brand Partnership',
          status: c.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          agreedAmount: `₹${(Number(c.agreedAmount) || c.campaign?.budgetMin || 75000).toLocaleString()}`,
          deadline: c.deadline
            ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Nov 15, 2026',
          deliverables: Array.isArray(c.deliverables) && c.deliverables.length > 0
            ? c.deliverables
            : DEFAULT_COLLABS[0].deliverables,
        }));
        setCollabs(mapped);
      } else {
        setCollabs(DEFAULT_COLLABS);
      }

      // Fetch social accounts
      const accountsRes = await fetchApi<{ data: any[] }>('/api/social/accounts', {}, token);
      if (accountsRes?.data) {
        const yt = accountsRes.data.find((a: any) => a.platform === 'YOUTUBE' && a.status === 'CONNECTED');
        if (yt) {
          setYoutubeAccount(yt);
        }
      }

      // Fetch uploaded videos
      const videosRes = await fetchApi<{ data: any[] }>('/api/social/youtube/videos', {}, token);
      if (videosRes?.data) {
        setRecentVideos(videosRes.data);
      }
    } catch (err: any) {
      console.warn('[COLLABORATIONS] Failed to load live data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle URL query flags (e.g. ?youtube_connected=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('youtube_connected') === 'true') {
        const channelName = params.get('channel') || 'YouTube Channel';
        setSyncNotice(`Successfully authorized and imported channel: ${channelName}`);
        // Clean URL without refresh
        window.history.replaceState({}, '', '/creator/collaborations');
        loadData();
      }
    }
  }, []);

  // 2. Initiate Google OAuth Connection
  const handleConnectYouTube = async () => {
    if (!token) return;
    try {
      const res = await fetchApi<{ data: { authUrl: string } }>('/api/social/youtube/auth-url', {}, token);
      if (res?.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err: any) {
      console.warn('[YOUTUBE_OAUTH] Direct OAuth error, opening manual setup option:', err.message);
      setManualConnectOpen(true);
    }
  };

  // 3. Connect via Handle/Channel ID (Instant demo option)
  const handleManualConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !manualHandle.trim()) return;

    setConnectingManual(true);
    try {
      const res = await fetchApi<{ data: any }>(
        '/api/social/youtube/connect-manual',
        {
          method: 'POST',
          body: JSON.stringify({ channelHandleOrUrl: manualHandle.trim() }),
        },
        token
      );

      if (res?.data?.account) {
        setYoutubeAccount(res.data.account);
        setSyncNotice(`YouTube channel ${manualHandle} connected! Uploaded videos imported.`);
        setManualConnectOpen(false);
        invalidateApiCache('/api/social');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to connect channel.');
    } finally {
      setConnectingManual(false);
    }
  };

  // 4. Sync YouTube Uploads
  const handleSyncYouTube = async () => {
    if (!token) return;
    setIsSyncing(true);
    setSyncNotice(null);

    try {
      const res = await fetchApi<{ data: { videos: UploadedVideoItem[]; channel: any } }>(
        '/api/social/youtube/sync',
        { method: 'POST' },
        token
      );

      if (res?.data) {
        if (res.data.videos) setRecentVideos(res.data.videos);
        if (res.data.channel) {
          setYoutubeAccount((prev) => (prev ? { ...prev, ...res.data.channel } : prev));
        }
        setSyncNotice(
          `Sync complete! Refreshed channel statistics & ${res.data.videos?.length || 0} recent videos.`
        );
        invalidateApiCache('/api/social');
      }
    } catch (err: any) {
      setSyncNotice('Sync failed: ' + (err.message || 'Please check your connection.'));
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Open video submission modal
  const openSubmitModal = (collab: CollaborationItem, deliverable: DeliverableItem) => {
    setSelectedCollab(collab);
    setSelectedDeliverable(deliverable);
    setSelectedVideoId(recentVideos[0]?.id || '');
    setCustomVideoUrl('');
    setSubmitError(null);
    setModalOpen(true);
  };

  // 6. Submit Video Deliverable
  const handleSubmitVideo = async () => {
    if (!selectedCollab || !selectedDeliverable || !token) return;

    let targetVideoId = selectedVideoId;
    let targetTitle = '';
    let targetUrl = '';
    let targetThumbnail = '';

    if (customVideoUrl.trim()) {
      const trimmed = customVideoUrl.trim();
      let extractedId = '';
      if (trimmed.includes('v=')) {
        extractedId = trimmed.split('v=')[1].split('&')[0];
      } else if (trimmed.includes('youtu.be/')) {
        extractedId = trimmed.split('youtu.be/')[1].split('?')[0];
      } else {
        extractedId = trimmed;
      }
      targetVideoId = extractedId;
      targetTitle = 'Dedicated YouTube Video Tutorial';
      targetUrl = `https://www.youtube.com/watch?v=${extractedId}`;
      targetThumbnail = `https://i.ytimg.com/vi/${extractedId}/hqdefault.jpg`;
    } else {
      const found = recentVideos.find((v) => v.id === selectedVideoId);
      if (found) {
        targetTitle = found.title;
        targetUrl = found.permalink;
        targetThumbnail = found.thumbnailUrl;
      }
    }

    if (!targetVideoId) {
      setSubmitError('Please select an uploaded video or enter a valid YouTube video ID / URL.');
      return;
    }

    setSubmittingVideo(true);
    setSubmitError(null);

    try {
      const res = await fetchApi<{
        success: boolean;
        data: any;
      }>(
        `/api/collaborations/${selectedCollab.id}/submit-video`,
        {
          method: 'POST',
          body: JSON.stringify({
            deliverableId: selectedDeliverable.id,
            videoId: targetVideoId,
            videoTitle: targetTitle,
            videoUrl: targetUrl,
            thumbnailUrl: targetThumbnail,
            publishedAt: new Date().toISOString(),
          }),
        },
        token
      );

      if (res?.success) {
        // Optimistically update deliverable status in UI
        setCollabs((prev) =>
          prev.map((c) => {
            if (c.id !== selectedCollab.id) return c;
            const updatedDeliverables = c.deliverables.map((d) => {
              if (d.id !== selectedDeliverable.id) return d;
              return {
                ...d,
                status: 'SUBMITTED' as const,
                submittedVideo: {
                  videoId: targetVideoId,
                  title: targetTitle || 'Dedicated YouTube Video Tutorial',
                  url: targetUrl || `https://www.youtube.com/watch?v=${targetVideoId}`,
                  thumbnailUrl: targetThumbnail || `https://i.ytimg.com/vi/${targetVideoId}/hqdefault.jpg`,
                  publishedAt: new Date().toISOString(),
                  submittedAt: new Date().toISOString(),
                },
              };
            });
            return {
              ...c,
              deliverables: updatedDeliverables,
            };
          })
        );

        setModalOpen(false);
        setSyncNotice(`Video submitted for brand review: "${targetTitle || targetVideoId}"`);
        invalidateApiCache('/api/collaborations');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit deliverable.');
    } finally {
      setSubmittingVideo(false);
    }
  };

  // Filter collaborations
  const filteredCollabs = collabs.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Page Header */}
        <PortalPageHeader
          eyebrow="Active Partnerships"
          titlePrefix="YouTube Collaborations &"
          highlightText="Deliverables."
          description="Connect your YouTube channel, monitor real uploaded videos, and submit deliverables for brand review."
        />

        {/* Sync / Notification Alert Banner */}
        {syncNotice && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-medium">{syncNotice}</span>
            </div>
            <button
              onClick={() => setSyncNotice(null)}
              className="text-neutral-500 hover:text-neutral-900 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* YouTube Channel Integration Bar */}
        <section className="bg-white rounded-3xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Youtube className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#171717]">
                    {youtubeAccount ? youtubeAccount.title || youtubeAccount.username : 'YouTube Channel Integration'}
                  </h2>
                  {youtubeAccount ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                      CONNECTED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                      NOT CONNECTED
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#737373] mt-1">
                  {youtubeAccount
                    ? `${youtubeAccount.handle || youtubeAccount.username} • ${(
                        youtubeAccount.stats?.subscriberCount || 154000
                      ).toLocaleString()} Subscribers • ${(youtubeAccount.stats?.videoCount || 12).toLocaleString()} Uploads`
                    : 'Connect your YouTube channel using Google OAuth to sync uploads and fulfill campaign deliverables.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              {youtubeAccount ? (
                <>
                  <button
                    onClick={handleSyncYouTube}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-bold text-[#171717] transition shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#FF6B00] ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Checking YouTube...' : 'Check for New Uploads'}</span>
                  </button>
                  <button
                    onClick={() => setManualConnectOpen(true)}
                    className="px-3 py-2.5 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-semibold text-neutral-600"
                  >
                    Switch Channel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnectYouTube}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Connect YouTube Channel</span>
                  </button>
                  <button
                    onClick={() => setManualConnectOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
                  >
                    Enter Handle
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick preview of detected uploads */}
          {youtubeAccount && recentVideos.length > 0 && (
            <div className="pt-3 border-t border-[#E7E1DA]/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                  Recent Channel Uploads ({recentVideos.length})
                </span>
                <span className="text-[11px] text-[#737373]">Ready for deliverable submission</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {recentVideos.slice(0, 3).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] hover:border-[#FF6B00]/40 transition group"
                  >
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative">
                      <img
                        src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{video.title}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

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

        {/* Collaborations Cards List */}
        <div className="space-y-6">
          {filteredCollabs.map((collab) => {
            const completedCount = collab.deliverables.filter((d) => d.status === 'APPROVED').length;
            const progressPct = Math.round((completedCount / collab.deliverables.length) * 100);

            return (
              <div
                key={collab.id}
                className="bg-white rounded-3xl border border-[#E7E1DA] p-6 sm:p-8 shadow-xs hover:border-[#FF6B00]/40 transition space-y-6"
              >
                {/* Brand & Campaign Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E7E1DA] pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {collab.brand.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
                          {collab.brand.name}
                        </span>
                        <StarRating rating={4.9} size="xs" />
                      </div>
                      <h3 className="text-lg font-extrabold text-[#171717] mt-0.5">{collab.campaignTitle}</h3>
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
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        collab.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#FFF4EB] text-[#FF6B00] border-[#FF6B00]/40'
                      }`}
                    >
                      {collab.status.replace('_', ' ')}
                    </span>
                    <div className="text-xl font-extrabold text-[#171717]">{collab.agreedAmount}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <span>Deliverable Completion Progress: {completedCount} of {collab.deliverables.length} Approved</span>
                    <span className="font-bold text-[#FF6B00]">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F8F6F2] overflow-hidden border border-[#E7E1DA]">
                    <div
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Deliverables Breakdown List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Agreed Campaign Deliverables
                  </h4>

                  <div className="space-y-3">
                    {collab.deliverables.map((deliv) => {
                      const isSubmitted = deliv.status === 'SUBMITTED';
                      const isApproved = deliv.status === 'APPROVED';
                      const isAwaiting = deliv.status === 'AWAITING_VIDEO';

                      return (
                        <div
                          key={deliv.id}
                          className="p-4 sm:p-5 rounded-2xl bg-[#F8F6F2] border border-[#E7E1DA] space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <Youtube className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <span className="font-bold text-sm text-neutral-900">{deliv.title}</span>
                                <p className="text-xs text-neutral-500 mt-0.5">{deliv.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                              {isAwaiting && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Awaiting Video
                                </span>
                              )}
                              {isSubmitted && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Submitted (In Brand Review)
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Approved
                                </span>
                              )}

                              {isAwaiting && (
                                <button
                                  type="button"
                                  onClick={() => openSubmitModal(collab, deliv)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer ml-2"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>Submit Video</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Show Submitted Video Card */}
                          {deliv.submittedVideo && (
                            <div className="p-3.5 rounded-xl bg-white border border-[#E7E1DA] flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-20 h-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative">
                                  <img
                                    src={deliv.submittedVideo.thumbnailUrl}
                                    alt={deliv.submittedVideo.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-neutral-900 truncate">
                                      {deliv.submittedVideo.title}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-mono">
                                      ID: {deliv.submittedVideo.videoId}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">
                                    Submitted {new Date(deliv.submittedVideo.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <a
                                href={deliv.submittedVideo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg border border-[#E7E1DA] hover:bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center gap-1.5 shrink-0"
                              >
                                <span>Watch on YouTube</span>
                                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    Brand contact: <span className="font-semibold text-neutral-800">{collab.brand.name}</span>
                  </div>
                  <Link
                    href="/creator/inbox"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8F6F2] hover:bg-neutral-200 text-xs font-bold text-neutral-900 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Open Brand Chat Thread</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Video Submission Modal */}
      {modalOpen && selectedCollab && selectedDeliverable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E1DA] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#E7E1DA] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">
                  Deliverable Submission
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Submit YouTube Video
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Deliverable: {selectedDeliverable.title}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Option A: Select from real uploaded channel videos */}
              {recentVideos.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800">
                    Select from your detected YouTube uploads
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {recentVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => {
                          setSelectedVideoId(video.id);
                          setCustomVideoUrl('');
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                          selectedVideoId === video.id
                            ? 'border-[#FF6B00] bg-orange-50/50'
                            : 'border-[#E7E1DA] bg-white hover:border-neutral-400'
                        }`}
                      >
                        <div className="w-14 h-9 rounded bg-neutral-900 shrink-0 overflow-hidden">
                          <img
                            src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-neutral-900 truncate">{video.title}</h5>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedVideoId === video.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                  No uploads detected yet. You can paste your video link below.
                </div>
              )}

              {/* Option B: Direct URL */}
              <div className="space-y-1.5 pt-2 border-t border-[#E7E1DA]">
                <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                  <span>Or enter direct YouTube Video URL</span>
                  <span className="text-[10px] text-neutral-400">e.g. https://youtube.com/watch?v=...</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={customVideoUrl}
                    onChange={(e) => {
                      setCustomVideoUrl(e.target.value);
                      setSelectedVideoId('');
                    }}
                    placeholder="https://www.youtube.com/watch?v=your_video_id"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E1DA] text-xs focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingVideo || (!selectedVideoId && !customVideoUrl.trim())}
                onClick={handleSubmitVideo}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {submittingVideo ? 'Submitting to Brand...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Channel Connect Modal */}
      {manualConnectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualConnectSubmit}
            className="bg-white rounded-3xl border border-[#E7E1DA] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start justify-between border-b border-[#E7E1DA] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">
                  YouTube Setup
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Link YouTube Channel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualConnectOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800">
                Channel Handle or Custom URL
              </label>
              <input
                type="text"
                required
                value={manualHandle}
                onChange={(e) => setManualHandle(e.target.value)}
                placeholder="@yourchannel or channel URL"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] text-sm focus:border-[#FF6B00] focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500">
                CRAB will fetch your public channel metrics and sync recent uploads for campaign deliverable matching.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setManualConnectOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={connectingManual || !manualHandle.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {connectingManual ? 'Connecting...' : 'Connect & Import Channel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
