'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Users,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface ConversationItem {
  id: string;
  creator: {
    id?: string;
    name: string;
    avatar: string;
    handle: string;
    niche?: string;
  };
  campaign: {
    id: string;
    name: string;
  };
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
  offers?: any[];
  messages?: any[];
  raw?: any;
}

interface MessageItem {
  id: string;
  senderId: 'brand' | 'creator';
  text: string;
  time: string;
  createdAt?: string;
  type: 'TEXT' | 'OFFER';
  offer?: {
    id?: string;
    amount: string;
    deliverables: string[];
    status: string;
  };
}

function BrandInboxContent() {
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get('conversationId') || searchParams.get('id');
  const targetCreator = searchParams.get('creator');
  const { user, token } = useAuth();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations list for authenticated brand from PostgreSQL
  const loadConversations = async (silent = false) => {
    if (!token) return;
    if (!silent) {
      setLoadingConversations(true);
      setErrorConversations(null);
    }

    try {
      const res = await fetchApi<{ data: any[] }>('/api/conversations', {}, token);
      if (res?.data && Array.isArray(res.data)) {
        const mapped: ConversationItem[] = res.data.map((c: any) => {
          const creatorName = c.creator?.displayName || 'Creator Partner';
          const creatorAvatar = creatorName.slice(0, 2).toUpperCase();
          const lastMsg = c.lastMessage || c.messages?.[c.messages.length - 1];

          return {
            id: c.id,
            creator: {
              id: c.creator?.id,
              name: creatorName,
              avatar: creatorAvatar,
              handle: `@${creatorName.toLowerCase().replace(/\s+/g, '')}`,
              niche: c.campaign?.creatorNiche || 'Aligned Creator',
            },
            campaign: {
              id: c.campaign?.id || '',
              name: c.campaign?.title || 'Brand Partnership',
            },
            lastMessage: lastMsg?.messageText || 'Started conversation',
            time: lastMsg?.createdAt
              ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Active',
            unread: c.unreadCount !== undefined ? c.unreadCount : 0,
            status: c.collaboration?.status || 'ACTIVE',
            offers: c.offers || [],
            messages: c.messages || [],
            raw: c,
          };
        });

        setConversations(mapped);

        // Auto-select based on conversationId or creator param
        if (targetConvId) {
          const found = mapped.find((item) => item.id === targetConvId);
          if (found) {
            setActiveConv(found);
            setMobileChatOpen(true);
          } else if (mapped.length > 0 && !activeConv) {
            setActiveConv(mapped[0]);
          }
        } else if (targetCreator) {
          const foundByCreator = mapped.find(
            (item) => item.creator.id === targetCreator || item.creator.name.toLowerCase().includes(targetCreator.toLowerCase())
          );
          if (foundByCreator) {
            setActiveConv(foundByCreator);
            setMobileChatOpen(true);
          } else {
            // Automatically initiate or find thread for this creator
            initiateThreadForCreator(targetCreator, mapped);
          }
        } else if (mapped.length > 0 && (!activeConv || !mapped.some((item) => item.id === activeConv.id))) {
          setActiveConv(mapped[0]);
        } else if (mapped.length === 0) {
          setActiveConv(null);
        }
      }
    } catch (err: any) {
      console.error('[BRAND_INBOX] Error fetching conversations:', err);
      if (!silent) {
        setErrorConversations(err.message || 'Unable to load conversations. Please try again.');
      }
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  // Helper to open/initiate thread when redirected from creator applications/discovery
  const initiateThreadForCreator = async (creatorId: string, currentList: ConversationItem[]) => {
    try {
      const res = await fetchApi<{ data: any }>(
        '/api/conversations/initiate',
        {
          method: 'POST',
          body: JSON.stringify({
            creatorId,
            initialMessage: 'Hi! We would love to discuss a collaboration partnership with you.',
          }),
        },
        token || undefined
      );

      if (res?.data?.id) {
        loadConversations();
      }
    } catch (err) {
      console.warn('[BRAND_INBOX] Could not auto-initiate thread for creator:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [token, targetConvId, targetCreator]);

  // 2. Load messages for active conversation
  const loadActiveMessages = async (silent = false) => {
    if (!token || !activeConv) return;
    if (!silent) setLoadingMessages(true);

    try {
      const res = await fetchApi<{ data: any }>(`/api/conversations/${activeConv.id}`, {}, token);
      if (res?.data?.messages && Array.isArray(res.data.messages)) {
        const mapped: MessageItem[] = res.data.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderUserId === user?.id ? 'brand' : 'creator',
          text: m.messageText,
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          createdAt: m.createdAt,
          type: 'TEXT',
        }));

        // Attach persisted offers if present
        if (res.data.offers && Array.isArray(res.data.offers) && res.data.offers.length > 0) {
          res.data.offers.forEach((offer: any) => {
            mapped.push({
              id: `offer_${offer.id}`,
              senderId: 'brand',
              text: '',
              time: offer.createdAt
                ? new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Offer',
              type: 'OFFER',
              offer: {
                id: offer.id,
                amount: `₹${Number(offer.amount).toLocaleString()}`,
                deliverables: Array.isArray(offer.deliverables)
                  ? offer.deliverables
                  : ['Campaign Deliverable Package'],
                status: offer.status,
              },
            });
          });
        }

        setMessages(mapped);

        // Mark incoming messages as read in database
        const hasUnread = res.data.messages.some(
          (m: any) => m.senderUserId !== user?.id && !m.readAt
        );
        if (hasUnread) {
          fetchApi(`/api/conversations/${activeConv.id}/read`, { method: 'POST' }, token)
            .then(() => {
              setConversations((prev) =>
                prev.map((c) => (c.id === activeConv.id ? { ...c, unread: 0 } : c))
              );
            })
            .catch(() => null);
        }
      }
    } catch (err: any) {
      console.warn('[BRAND_INBOX] Error fetching active thread messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeConv?.id) {
      loadActiveMessages();
    } else {
      setMessages([]);
    }
  }, [activeConv?.id, token]);

  // 3. Adaptive polling loop for live updates (every 3.5 seconds)
  useEffect(() => {
    if (!token || !activeConv?.id) return;

    const interval = setInterval(() => {
      loadActiveMessages(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConv?.id, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sending || !activeConv) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetchApi<{ data: any }>(
        `/api/conversations/${activeConv.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ messageText: textToSend }),
        },
        token || undefined
      );

      if (res?.data) {
        // Clear input only on confirmed success
        setInputText('');

        const newMsg: MessageItem = {
          id: res.data.id || `msg_${Date.now()}`,
          senderId: 'brand',
          text: res.data.messageText || textToSend,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'TEXT',
        };

        setMessages((prev) => [...prev, newMsg]);

        // Update local lastMessage in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? {
                  ...c,
                  lastMessage: textToSend,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('[BRAND_INBOX] Send message failed:', err);
      setSendError(err.message || 'Failed to send message. Please retry.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      searchQuery.trim() === '' ||
      c.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          titlePrefix="Creator"
          highlightText="conversations & offers."
        />

        {/* 2. Two-Pane Messaging Interface */}
        <div className="bg-white rounded-2xl border border-[#E7E1DA] shadow-xs overflow-hidden flex min-h-[640px] relative">
          {/* Left Pane: Conversations List */}
          <aside
            className={`transition-all duration-300 ease-in-out border-r border-[#E7E1DA] flex flex-col justify-between bg-white shrink-0 relative ${
              sidebarCollapsed
                ? 'w-full md:w-[72px]'
                : 'w-full md:w-[360px]'
            } ${mobileChatOpen ? 'hidden md:flex' : 'flex'}`}
          >
            {/* Seam Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white border border-[#E7E1DA] hover:border-[#FF6B00] text-[#737373] hover:text-[#FF6B00] shadow-md items-center justify-center transition-all hover:scale-110 cursor-pointer"
              title={sidebarCollapsed ? 'Expand conversations panel' : 'Collapse conversations panel'}
              aria-label={sidebarCollapsed ? 'Expand conversations panel' : 'Collapse conversations panel'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 ml-0.5" />
              ) : (
                <ChevronLeft className="w-4 h-4 mr-0.5" />
              )}
            </button>

            <div className="flex-1 flex flex-col min-h-0">
              {/* Header & Search */}
              <div className="border-b border-[#E7E1DA] overflow-hidden">
                {!sidebarCollapsed ? (
                  <div className="p-4 space-y-3 min-w-[320px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#171717]">Conversations</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF4EB] text-[#FF6B00] text-[11px] font-bold">
                          {conversations.length} Active
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1DA] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center" title="Conversations">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center shadow-2xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E7E1DA]/60 overflow-x-hidden">
                {loadingConversations ? (
                  <div className="p-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00] mx-auto" />
                    <p className="text-xs text-[#737373]">Loading conversations...</p>
                  </div>
                ) : errorConversations ? (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                    <p className="text-xs text-rose-600 font-medium">{errorConversations}</p>
                    <button
                      type="button"
                      onClick={() => loadConversations()}
                      className="px-3 py-1.5 rounded-lg bg-[#F8F6F2] text-xs font-semibold text-[#171717] hover:bg-[#E7E1DA] inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] text-[#737373] flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">No conversations found</h4>
                      <p className="text-[11px] text-[#737373] mt-1">
                        {conversations.length === 0
                          ? 'Start conversations by finding aligned creators or reviewing applicant proposals.'
                          : 'No conversations match your search filter.'}
                      </p>
                    </div>
                    {conversations.length === 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <Link
                          href="/brand/creators"
                          className="px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition"
                        >
                          Find Creators
                        </Link>
                        <Link
                          href="/brand/applications"
                          className="px-3 py-1.5 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-[#171717] hover:bg-[#F8F6F2] transition"
                        >
                          Review Applications
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = activeConv?.id === conv.id;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => {
                          setActiveConv(conv);
                          setMobileChatOpen(true);
                        }}
                        title={sidebarCollapsed ? `${conv.creator.name} • ${conv.campaign.name}` : undefined}
                        className={`w-full text-left transition relative cursor-pointer ${
                          sidebarCollapsed
                            ? 'p-3 flex items-center justify-center'
                            : 'p-4 flex items-start gap-3'
                        } ${
                          isSelected ? 'bg-[#FFF4EB]' : 'hover:bg-[#F8F6F2]'
                        }`}
                      >
                        {/* Active Indicator Bar */}
                        {isSelected && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#FF6B00]" />
                        )}

                        <div className="relative w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {conv.creator.avatar}
                          {sidebarCollapsed && conv.unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF6B00] ring-2 ring-white" />
                          )}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-[#171717] truncate">
                                {conv.creator.name}
                              </h4>
                              <span className="text-[10px] text-[#737373] shrink-0">{conv.time}</span>
                            </div>

                            <p className="text-[11px] text-[#FF6B00] font-medium truncate mt-0.5">
                              {conv.campaign.name}
                            </p>

                            <p className="text-xs text-[#737373] truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          </div>
                        )}

                        {!sidebarCollapsed && conv.unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold shrink-0 self-center">
                            {conv.unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Helper footer */}
            {!sidebarCollapsed && (
              <div className="p-3 border-t border-[#E7E1DA] bg-[#F8F6F2]/40 text-center text-[11px] text-[#737373]">
                Direct collaboration channels with verified talent
              </div>
            )}
          </aside>

          {/* Right Pane: Active Thread */}
          {activeConv ? (
            <div
              className={`flex-1 flex flex-col justify-between transition-all duration-300 ease-in-out ${
                mobileChatOpen ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* Thread Header */}
              <div className="p-4 border-b border-[#E7E1DA] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileChatOpen(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-[#F8F6F2] text-[#737373]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {activeConv.creator.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#171717]">
                        {activeConv.creator.name}
                      </h3>
                      <span className="text-xs text-[#737373]">{activeConv.creator.handle}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80">
                        Verified Creator
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] flex items-center gap-1 mt-0.5">
                      <span>Campaign:</span>
                      <strong className="text-[#171717]">{activeConv.campaign.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live sync active</span>
                  </div>
                  <span className="text-xs font-semibold text-[#737373] hidden sm:block border-l border-[#E7E1DA] pl-3">
                    Status: <strong className="text-[#171717]">{activeConv.status}</strong>
                  </span>
                </div>
              </div>

              {/* Messages Thread Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-[#171717]">Conversation Ready</h4>
                    <p className="text-xs text-[#737373] max-w-sm">
                      Send a proposal note or message below to start coordinating with {activeConv.creator.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isBrand = msg.senderId === 'brand';

                    if (msg.type === 'OFFER' && msg.offer) {
                      return (
                        <div key={msg.id} className="max-w-md mx-auto my-2">
                          <div className="p-5 rounded-2xl bg-white border border-[#FF6B00]/40 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E7E1DA]">
                              <span className="font-bold text-[#FF6B00] uppercase tracking-wider text-[10px]">
                                Campaign Collaboration Offer
                              </span>
                              <span className="text-[10px] text-[#737373]">{msg.time}</span>
                            </div>

                            <div>
                              <span className="text-xs text-[#737373] block">Agreed Compensation</span>
                              <strong className="text-2xl font-extrabold text-[#171717] block">
                                {msg.offer.amount}
                              </strong>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-[#171717] block">
                                Required Deliverables:
                              </span>
                              {msg.offer.deliverables.map((d, idx) => (
                                <p key={idx} className="text-xs text-[#737373] flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{d}</span>
                                </p>
                              ))}
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                                {msg.offer.status}
                              </span>
                              <span className="text-[11px] text-[#737373]">Collaboration proposal</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isBrand ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                            isBrand
                              ? 'bg-[#171717] text-white rounded-br-xs'
                              : 'bg-[#F8F6F2] text-[#171717] border border-[#E7E1DA] rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-[#737373] mt-1 px-1">{msg.time}</span>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Composer Footer */}
              <div className="p-4 border-t border-[#E7E1DA] bg-white space-y-2">
                {sendError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
                    <span>{sendError}</span>
                    <button
                      type="button"
                      onClick={() => setSendError(null)}
                      className="text-xs font-bold hover:underline ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3"
                >
                  <button
                    type="button"
                    className="p-2 text-[#737373] hover:text-[#171717] transition rounded-lg"
                    title="Attach proposal file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type your reply, terms, or proposal note..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sending}
                    className="flex-1 py-2.5 px-4 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-[#FAF9F6]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7E1DA] flex items-center justify-center text-[#737373] shadow-xs mb-4">
                <MessageSquare className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <h3 className="text-base font-bold text-[#171717]">
                {conversations.length === 0 ? 'Your Inbox is empty' : 'Select a conversation'}
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mt-1">
                {conversations.length === 0
                  ? 'Start direct collaboration conversations with creators through talent discovery or by accepting applications to your campaigns.'
                  : 'Choose a thread from the list on the left to review messages and coordinate deliverable packages.'}
              </p>
              {conversations.length === 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    href="/brand/creators"
                    className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition shadow-xs"
                  >
                    Find Creators
                  </Link>
                  <Link
                    href="/brand/applications"
                    className="px-4 py-2 rounded-xl border border-[#E7E1DA] bg-white text-xs font-semibold text-[#171717] hover:bg-[#F8F6F2] transition shadow-xs"
                  >
                    Review Applications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BrandInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
        </div>
      }
    >
      <BrandInboxContent />
    </Suspense>
  );
}
