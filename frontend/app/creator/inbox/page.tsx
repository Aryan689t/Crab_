'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface Conversation {
  id: string;
  brand: {
    name: string;
    avatar: string;
  };
  campaign: {
    name: string;
    id: string;
  };
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
}

interface Message {
  id: string;
  senderId: 'brand' | 'creator';
  text: string;
  time: string;
  type: 'TEXT' | 'OFFER';
  offer?: {
    amount: number;
    deliverables: string[];
    status: 'PENDING' | 'ACCEPTED';
  };
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    brand: {
      name: 'Acme Cloud',
      avatar: 'AC',
    },
    campaign: {
      name: 'Cloud Infrastructure Launch',
      id: 'camp_1',
    },
    lastMessage: 'I can definitely highlight the new CLI tools in the tutorial.',
    time: '10:42 AM',
    unread: 0,
    status: 'NEGOTIATING',
  },
  {
    id: 'conv_2',
    brand: {
      name: 'TechFlow',
      avatar: 'TF',
    },
    campaign: {
      name: 'AI Database Integration',
      id: 'camp_2',
    },
    lastMessage: 'The contract looks good. Deliverable draft submitted.',
    time: 'Yesterday',
    unread: 1,
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
      amount: 75000,
      deliverables: [
        '1x 12-min Dedicated YouTube Walkthrough Video',
        'Pinned comment with promo link & tracking code',
      ],
      status: 'PENDING',
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

export default function CreatorInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<Conversation>(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'creator',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TEXT',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          senderId: 'brand',
          text: 'Thanks for the update Alex. The marketing lead will review this by tomorrow morning!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'TEXT',
        },
      ]);
    }, 1800);
  };

  const acceptOffer = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.type === 'OFFER' && m.offer
          ? { ...m, offer: { ...m.offer, status: 'ACCEPTED' } }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Direct Messages"
          titlePrefix="Brand"
          highlightText="conversations & offers."
          description="Coordinate deliverables, negotiate sponsorship agreements, and chat with partner brands in real-time."
        />

        {/* 2. Main Two-Pane Chat Container */}
        <div className="bg-white rounded-2xl border border-[#E7E1DA] shadow-xs overflow-hidden h-[720px] flex">
          {/* Left Column: Conversation List */}
          <aside
            className={`w-full md:w-[360px] border-r border-[#E7E1DA] flex flex-col shrink-0 bg-white ${
              mobileChatOpen ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-[#E7E1DA] space-y-3">
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
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E7E1DA]/60">
              {conversations.map((conv) => {
                const isSelected = activeConv.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConv(conv);
                      setMobileChatOpen(true);
                    }}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 relative ${
                      isSelected ? 'bg-[#FFF4EB]' : 'hover:bg-[#F8F6F2]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF6B00] rounded-r-md" />
                    )}

                    <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {conv.brand.avatar}
                    </div>

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

                    {conv.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[9px] font-bold flex items-center justify-center shrink-0 self-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Chat View */}
          <section
            className={`flex-1 flex flex-col h-full bg-[#FAF9F6] ${
              mobileChatOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Chat Top Header */}
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

              <div className="text-xs text-[#737373] hidden sm:block">
                Status: <span className="font-semibold text-[#171717]">{activeConv.status}</span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isCreator = msg.senderId === 'creator';

                if (msg.type === 'OFFER' && msg.offer) {
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-md w-full bg-white rounded-2xl p-5 border border-[#FF6B00]/40 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF6B00]">
                            Official Campaign Offer
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
                          <button
                            type="button"
                            onClick={() => acceptOffer(msg.id)}
                            className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            Accept Offer Terms
                          </button>
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
                      <p>{msg.text}</p>
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
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-3 border border-[#E7E1DA] text-xs text-[#737373] animate-pulse">
                    {activeConv.brand.name} is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-[#E7E1DA] flex items-center gap-2.5"
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-xl font-bold transition shadow-xs ${
                  inputText.trim()
                    ? 'bg-[#FF6B00] hover:bg-[#e05e00] text-white cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
