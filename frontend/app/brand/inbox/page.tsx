'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface Message {
  id: string;
  senderId: 'brand' | 'creator';
  text: string;
  time: string;
  type: 'TEXT' | 'OFFER';
  offer?: {
    amount: string;
    deliverables: string[];
    status: string;
  };
}

const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    creator: {
      name: 'Alex Chen',
      avatar: 'AC',
      handle: '@alexchen_tech',
      niche: 'Fullstack Dev & Cloud',
    },
    campaign: {
      name: 'Cloud Infrastructure Launch & CLI Deep Dive',
      id: 'camp_1',
    },
    lastMessage: 'I can definitely highlight the new CLI tools in the tutorial.',
    time: '10:42 AM',
    unread: 2,
    status: 'NEGOTIATING',
  },
  {
    id: 'conv_2',
    creator: {
      name: 'Sarah Codes',
      avatar: 'SC',
      handle: '@sarahcodes',
      niche: 'AI & Vector Databases',
    },
    campaign: {
      name: 'AI Vector Database Integration Series',
      id: 'camp_2',
    },
    lastMessage: 'The contract looks good. Deliverable draft ready.',
    time: 'Yesterday',
    unread: 0,
    status: 'ACTIVE',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'brand',
    text: 'Hi Alex, we loved your recent technical video on container deployments. We are launching a developer CLI and think your channel is an ideal fit. Would you be open to collaborating?',
    time: '10:00 AM',
    type: 'TEXT',
  },
  {
    id: 'msg_2',
    senderId: 'creator',
    text: 'Hi! Yes, I actually use your current platform regularly. I would love to explore the new features and walk through a real-world demo.',
    time: '10:15 AM',
    type: 'TEXT',
  },
  {
    id: 'msg_3',
    senderId: 'brand',
    text: '',
    time: '10:20 AM',
    type: 'OFFER',
    offer: {
      amount: '₹75,000',
      deliverables: [
        '1× 12-min Dedicated YouTube Walkthrough Video',
        'Pinned comment with promo link & tracking code',
      ],
      status: 'OFFER_EXTENDED',
    },
  },
  {
    id: 'msg_4',
    senderId: 'creator',
    text: 'I can definitely highlight the new CLI tools and performance benchmarks in the tutorial.',
    time: '10:42 AM',
    type: 'TEXT',
  },
];

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { fetchApi } from '../../../lib/api';

function BrandInboxContent() {
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get('conversationId') || searchParams.get('id');
  const targetCreator = searchParams.get('creator');
  const { user, token, loading: authLoading } = useAuth();

  const [dbConversations, setDbConversations] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<any>(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 1. Fetch conversations list for brand
  const loadConversations = async () => {
    if (!token) return;
    try {
      const res = await fetchApi<{ data: any[] }>('/api/conversations', {}, token);
      if (res?.data && Array.isArray(res.data)) {
        setDbConversations(res.data);
      }
    } catch (err) {
      console.warn('[BRAND_INBOX] Backend conversations fetch fallback:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [token]);

  // Combine live PostgreSQL conversations with mock conversations
  useEffect(() => {
    if (dbConversations.length > 0) {
      const mappedDb = dbConversations.map((c: any) => {
        const creatorName = c.creator?.displayName || 'Creator Partner';
        const creatorAvatar = creatorName.slice(0, 2).toUpperCase();
        const lastMsg = c.messages?.[c.messages.length - 1];

        return {
          id: c.id,
          creator: {
            name: creatorName,
            avatar: creatorAvatar,
            handle: `@${creatorName.toLowerCase().replace(/\s+/g, '')}`,
            niche: 'Developer & Cloud Tech',
          },
          campaign: {
            name: c.campaign?.title || 'Brand Partnership',
            id: c.campaign?.id || '',
          },
          lastMessage: lastMsg?.messageText || 'Started conversation',
          time: lastMsg?.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Active',
          unread: 0,
          status: 'ACTIVE',
          messages: c.messages || [],
        };
      });

      const dbIds = new Set(mappedDb.map((d: any) => d.id));
      const extraMocks = MOCK_CONVERSATIONS.filter((m) => !dbIds.has(m.id));
      const combined = [...mappedDb, ...extraMocks];
      setConversations(combined);

      // Auto-select based on conversationId or creator
      if (targetConvId) {
        const found = combined.find((c: any) => c.id === targetConvId);
        if (found) setActiveConv(found);
        else if (combined.length > 0) setActiveConv(combined[0]);
      } else if (targetCreator) {
        const found = combined.find((c: any) => c.creator?.id === targetCreator || c.creator?.name?.toLowerCase().includes(targetCreator.toLowerCase()));
        if (found) setActiveConv(found);
        else if (combined.length > 0) setActiveConv(combined[0]);
      } else if (combined.length > 0 && (!activeConv || !combined.some((c: any) => c.id === activeConv.id))) {
        setActiveConv(combined[0]);
      }
    }
  }, [dbConversations, targetConvId, targetCreator]);

  // 2. Load messages for active conversation
  const loadActiveMessages = async () => {
    if (!token || !activeConv) return;
    if (activeConv.id.includes('-')) {
      try {
        const res = await fetchApi<{ data: any }>(`/api/conversations/${activeConv.id}`, {}, token);
        if (res?.data?.messages) {
          const mapped: Message[] = res.data.messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderUserId === user?.id ? 'brand' : 'creator',
            text: m.messageText,
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now',
            type: 'TEXT',
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.warn('[BRAND_INBOX] Failed to poll messages:', err);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  };

  useEffect(() => {
    loadActiveMessages();
  }, [activeConv?.id, token]);

  // 3. Periodic polling (every 3.5 seconds) for live thread updates
  useEffect(() => {
    if (!token || !activeConv || !activeConv.id.includes('-')) return;
    const interval = setInterval(() => {
      loadActiveMessages();
    }, 3500);
    return () => clearInterval(interval);
  }, [activeConv?.id, token]);

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sending) return;

    setInputText('');

    const optimisticMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'brand',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TEXT',
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    // Send to live API if database conversation
    if (token && activeConv.id.includes('-')) {
      setSending(true);
      try {
        await fetchApi(
          `/api/conversations/${activeConv.id}/messages`,
          {
            method: 'POST',
            body: JSON.stringify({ messageText: textToSend }),
          },
          token
        );
        loadConversations();
      } catch (err) {
        console.warn('[BRAND_INBOX] Backend message persistence error:', err);
      } finally {
        setSending(false);
      }
    } else {
      // Simulate reply for demo mock threads
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            senderId: 'creator',
            text: 'Thanks for the details! I will incorporate this into the draft script.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'TEXT',
          },
        ]);
      }, 1800);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaign?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <PortalPageHeader
          eyebrow="Direct Messages"
          titlePrefix="Creator"
          highlightText="conversations & offers."
          description="Coordinate deliverables, negotiate sponsorship agreements, and chat with partner creators in real-time."
        />

        {/* 2. Two-Pane Messaging Interface */}
        <div className="bg-white rounded-2xl border border-[#E7E1DA] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
          {/* Left Pane: Conversations List (4 cols) */}
          <div className="md:col-span-4 border-r border-[#E7E1DA] flex flex-col justify-between">
            <div>
              {/* Header & Search */}
              <div className="p-4 border-b border-[#E7E1DA] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171717]">Conversations</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF4EB] text-[#FF6B00] text-[11px] font-bold">
                    {MOCK_CONVERSATIONS.length} Active
                  </span>
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

              {/* Conversations List */}
              <div className="divide-y divide-[#E7E1DA]/60">
                {filteredConversations.map((conv) => {
                  const isSelected = activeConv.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveConv(conv)}
                      className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#FFF4EB]/40'
                          : 'hover:bg-[#F8F6F2]'
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isSelected && (
                        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-[#FF6B00]" />
                      )}

                      <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {conv.creator.avatar}
                      </div>

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

                      {conv.unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold shrink-0 self-center">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper footer */}
            <div className="p-3 border-t border-[#E7E1DA] bg-[#F8F6F2]/40 text-center text-[11px] text-[#737373]">
              Real-time messaging with instant quote generator
            </div>
          </div>

          {/* Right Pane: Active Thread (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between">
            {/* Thread Header */}
            <div className="p-4 border-b border-[#E7E1DA] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
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

              <span className="text-xs font-semibold text-[#737373]">
                Status: <strong className="text-[#171717]">{activeConv.status}</strong>
              </span>
            </div>

            {/* Messages Thread Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
              {messages.map((msg) => {
                const isBrand = msg.senderId === 'brand';

                if (msg.type === 'OFFER' && msg.offer) {
                  return (
                    <div key={msg.id} className="max-w-md mx-auto my-2">
                      <div className="p-5 rounded-2xl bg-white border border-[#FF6B00]/40 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E7E1DA]">
                          <span className="font-bold text-[#FF6B00] uppercase tracking-wider text-[10px]">
                            Official Campaign Offer
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
                            Offer Sent
                          </span>
                          <span className="text-[11px] text-[#737373]">Awaiting creator review</span>
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
                      className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
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
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#737373] italic">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce" />
                  <span>{activeConv.creator.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#E7E1DA] bg-white flex items-center gap-3"
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
                className="flex-1 py-2.5 px-4 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-40 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
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
          <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrandInboxContent />
    </Suspense>
  );
}
