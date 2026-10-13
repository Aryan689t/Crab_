'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  Paperclip,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  DollarSign,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface ConversationItem {
  id: string;
  brand: {
    id?: string;
    name: string;
    avatar: string;
    category?: string;
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
    amount: number;
    deliverables: string[];
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  };
}

function CreatorInboxContent() {
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get('conversationId') || searchParams.get('id');
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

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations from PostgreSQL
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
          const brandName = c.brand?.name || 'Partner Brand';
          const brandAvatar = brandName.slice(0, 2).toUpperCase();
          const lastMsg = c.lastMessage || c.messages?.[c.messages.length - 1];

          return {
            id: c.id,
            brand: {
              id: c.brand?.id,
              name: brandName,
              avatar: brandAvatar,
              category: c.brand?.category,
            },
            campaign: {
              id: c.campaign?.id || '',
              name: c.campaign?.title || 'Collaboration Sprint',
            },
            lastMessage: lastMsg?.messageText || 'Conversation started',
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

        // Auto-select conversation
        if (targetConvId) {
          const matched = mapped.find((item) => item.id === targetConvId);
          if (matched) {
            setActiveConv(matched);
            setMobileChatOpen(true);
          } else if (mapped.length > 0 && !activeConv) {
            setActiveConv(mapped[0]);
          }
        } else if (mapped.length > 0 && (!activeConv || !mapped.some((item) => item.id === activeConv.id))) {
          setActiveConv(mapped[0]);
        } else if (mapped.length === 0) {
          setActiveConv(null);
        }
      }
    } catch (err: any) {
      console.error('[CREATOR_INBOX] Failed to load conversations:', err);
      if (!silent) {
        setErrorConversations(err.message || 'Unable to load conversations. Please try again.');
      }
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [token, targetConvId]);

  // 2. Load messages for active conversation and mark as read
  const loadActiveMessages = async (silent = false) => {
    if (!token || !activeConv) return;
    if (!silent) setLoadingMessages(true);

    try {
      const res = await fetchApi<{ data: any }>(`/api/conversations/${activeConv.id}`, {}, token);
      if (res?.data?.messages && Array.isArray(res.data.messages)) {
        const mapped: MessageItem[] = res.data.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderUserId === user?.id ? 'creator' : 'brand',
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
                amount: Number(offer.amount),
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
              // Reset local unread badge count
              setConversations((prev) =>
                prev.map((c) => (c.id === activeConv.id ? { ...c, unread: 0 } : c))
              );
            })
            .catch(() => null);
        }
      }
    } catch (err: any) {
      console.warn('[CREATOR_INBOX] Error loading thread messages:', err);
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
          senderId: 'creator',
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
      console.error('[CREATOR_INBOX] Send message failed:', err);
      setSendError(err.message || 'Failed to send message. Please retry.');
    } finally {
      setSending(false);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (c) =>
      searchFilter.trim() === '' ||
      c.brand.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.campaign.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Header */}
        <PortalPageHeader
          titlePrefix="Brand"
          highlightText="conversations & offers."
        />

        {/* 2. Main Two-Pane Chat Container */}
        <div className="bg-white rounded-2xl border border-[#E7E1DA] shadow-xs overflow-hidden h-[720px] flex relative">
          {/* Left Column: Conversation List */}
          <aside
            className={`transition-all duration-300 ease-in-out border-r border-[#E7E1DA] flex flex-col shrink-0 bg-white relative ${
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

            {/* Header Area */}
            <div className="border-b border-[#E7E1DA] overflow-hidden">
              {!sidebarCollapsed ? (
                <div className="p-4 space-y-3 min-w-[320px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#171717]">Conversations</h3>
                    <span className="text-[11px] font-semibold text-[#FF6B00] bg-[#FFF4EB] px-2 py-0.5 rounded-full">
                      {conversations.length} Active
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
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

            {/* Conversation Items List */}
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
                        ? 'Conversations start when you apply to campaign opportunities or accept brand invitations.'
                        : 'No conversations matched your search filter.'}
                    </p>
                  </div>
                  {conversations.length === 0 && (
                    <Link
                      href="/creator/discover"
                      className="inline-block px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition"
                    >
                      Discover Opportunities
                    </Link>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConv(conv);
                        setMobileChatOpen(true);
                      }}
                      title={sidebarCollapsed ? `${conv.brand.name} • ${conv.campaign.name}` : undefined}
                      className={`cursor-pointer transition-colors relative ${
                        sidebarCollapsed
                          ? 'p-3 flex items-center justify-center'
                          : 'p-4 flex items-start gap-3'
                      } ${
                        isSelected ? 'bg-[#FFF4EB]' : 'hover:bg-[#F8F6F2]'
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {isSelected && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF6B00] rounded-r-md" />
                      )}

                      {/* Brand Avatar */}
                      <div className="relative w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {conv.brand.avatar}
                        {sidebarCollapsed && conv.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF6B00] ring-2 ring-white" />
                        )}
                      </div>

                      {/* Details */}
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-[#171717] truncate">
                              {conv.brand.name}
                            </span>
                            <span className="text-[10px] text-[#737373] shrink-0">
                              {conv.time}
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-[#FF6B00] truncate mt-0.5">
                            {conv.campaign.name}
                          </div>

                          <p className="text-xs text-[#737373] truncate mt-1">
                            {conv.lastMessage}
                          </p>
                        </div>
                      )}

                      {!sidebarCollapsed && conv.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[9px] font-bold flex items-center justify-center shrink-0 self-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Column: Chat View */}
          {activeConv ? (
            <section
              className={`flex-1 flex flex-col h-full bg-[#FAF9F6] transition-all duration-300 ease-in-out ${
                mobileChatOpen ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* Top Header */}
              <div className="h-16 px-6 border-b border-[#E7E1DA] bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileChatOpen(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-[#F8F6F2] text-[#737373]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {activeConv.brand.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#171717]">
                        {activeConv.brand.name}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified Brand
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737373] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#FF6B00]" />
                      <span>{activeConv.campaign.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live sync active</span>
                  </div>
                  <div className="text-xs text-[#737373] hidden sm:block border-l border-[#E7E1DA] pl-3">
                    Status: <span className="font-semibold text-[#171717]">{activeConv.status}</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-[#171717]">Conversation Started</h4>
                    <p className="text-xs text-[#737373] max-w-sm">
                      Send a message below to start aligning on deliverables, timelines, and collaboration terms.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCreator = msg.senderId === 'creator';

                    if (msg.type === 'OFFER' && msg.offer) {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div className="max-w-md w-full bg-white rounded-2xl p-5 border border-[#FF6B00]/40 shadow-xs space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF6B00]">
                                Campaign Collaboration Offer
                              </span>
                              <span className="text-xs text-[#737373]">{msg.time}</span>
                            </div>

                            <div>
                              <div className="text-[11px] text-[#737373]">Agreed Compensation</div>
                              <div className="text-xl font-bold text-[#171717]">
                                ₹{msg.offer.amount.toLocaleString()}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="text-xs font-semibold text-[#171717]">
                                Required Deliverables:
                              </div>
                              <ul className="space-y-1">
                                {msg.offer.deliverables.map((d, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-[#525252] flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {msg.offer.status === 'ACCEPTED' ? (
                              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                                ✓ Offer Accepted & Contract Initialized
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-[#FFF4EB] text-[#FF6B00] text-xs font-bold text-center border border-[#FF6B00]/20">
                                Pending Terms Agreement
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCreator ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl p-4 shadow-2xs space-y-1 text-xs leading-relaxed ${
                            isCreator
                              ? 'bg-[#171717] text-white rounded-tr-xs'
                              : 'bg-white text-[#171717] border border-[#E7E1DA] rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`text-[10px] text-right ${
                              isCreator ? 'text-white/60' : 'text-[#737373]'
                            }`}
                          >
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="p-4 bg-white border-t border-[#E7E1DA] space-y-2">
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
                  className="flex items-center gap-2.5"
                >
                  <button
                    type="button"
                    className="p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2] transition"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type your reply or proposal..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className={`p-2.5 rounded-xl font-bold transition shadow-xs ${
                      inputText.trim() && !sending
                        ? 'bg-[#FF6B00] hover:bg-[#e05e00] text-white cursor-pointer'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </section>
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
                  ? 'Active discussions with partner brands will appear here once you apply to campaigns or accept incoming collaboration invitations.'
                  : 'Choose a thread from the list on the left to review messages and coordinate deliverables.'}
              </p>
              {conversations.length === 0 && (
                <Link
                  href="/creator/discover"
                  className="mt-4 px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E56000] transition shadow-xs"
                >
                  Explore Opportunities
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CreatorInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
        </div>
      }
    >
      <CreatorInboxContent />
    </Suspense>
  );
}
