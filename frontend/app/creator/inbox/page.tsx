'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  Paperclip,
  CheckCircle2,
  XCircle,
  Briefcase,
  User,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const MOCK_CONVERSATIONS = [
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
    lastMessage: 'The contract looks good. I have signed it.',
    time: 'Yesterday',
    unread: 1,
    status: 'ACTIVE',
  },
];

const MOCK_MESSAGES = [
  {
    id: 'msg_1',
    senderId: 'brand',
    text: 'Hi Alex, we loved your recent video on Docker. We are launching a new cloud CLI and think you would be a great fit. Are you interested?',
    time: '10:00 AM',
    type: 'TEXT',
  },
  {
    id: 'msg_2',
    senderId: 'creator',
    text: 'Hi! Yes, I actually use your current CLI a lot. I would love to hear more about the new features.',
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
      amount: 1500,
      deliverables: ['1x 10-min Dedicated YouTube Video', '1x Twitter Thread'],
      status: 'PENDING',
    }
  },
  {
    id: 'msg_4',
    senderId: 'creator',
    text: 'I can definitely highlight the new CLI tools in the tutorial.',
    time: '10:42 AM',
    type: 'TEXT',
  }
];

export default function CreatorInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'CREATOR') {
        router.push('/brand/inbox');
        return;
      }
    }
  }, [user, authLoading, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'creator',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TEXT',
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        senderId: 'brand',
        text: 'Sounds great. Let me check with the team.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'TEXT',
      }]);
    }, 2000);
  };

  const acceptOffer = (id: string) => {
    setMessages(messages.map(m => m.id === id && m.type === 'OFFER' && m.offer ? { ...m, offer: { ...m.offer, status: 'ACCEPTED' } } : m));
  };

  if (authLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-brand-orange" />
          Loading Inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full">
      
      <main className="w-full px-4 md:px-6 lg:px-8 py-6 flex-1 flex overflow-hidden gap-6 h-full">
        
        {/* Sidebar / Conversation List */}
        <aside className="w-1/3 max-w-[320px] bg-surface-card rounded-2xl border border-border-warm shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-border-warm space-y-4 bg-surface-card">
            <h1 className="text-[20px] font-extrabold text-text-strong tracking-tight">Inbox</h1>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-warm focus:bg-surface focus:border-brand-crimson focus:ring-1 focus:ring-brand-crimson rounded-xl text-sm transition-all outline-none text-text-strong"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 border-b border-border-warm cursor-pointer transition-colors hover:bg-surface-hover ${activeConv.id === conv.id ? 'bg-surface-tint border-l-4 border-l-brand-crimson pl-3' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-peach/30 text-brand-crimson border border-brand-peach/50 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-sm">
                    {conv.brand.avatar}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-text-strong truncate">{conv.brand.name}</h3>
                      <span className="text-[11px] font-medium text-text-muted whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className="text-[12px] text-brand-orange font-bold truncate mb-1">
                      {conv.campaign.name}
                    </p>
                    <p className={`text-[13px] truncate ${conv.unread > 0 ? 'text-text-strong font-semibold' : 'text-text-muted'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-brand-crimson text-white text-[10px] font-bold flex items-center justify-center mt-1">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 bg-surface-card rounded-2xl border border-border-warm shadow-sm flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="h-16 border-b border-border-warm flex items-center justify-between px-6 bg-surface-card z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-peach/30 text-brand-crimson border border-brand-peach/50 flex items-center justify-center font-bold shadow-sm text-sm">
                {activeConv.brand.avatar}
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-text-strong leading-tight">{activeConv.brand.name}</h2>
                <div className="flex items-center text-[12px] font-medium text-text-muted gap-2 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{activeConv.campaign.name}</span>
                  <span className="px-1.5 py-0.5 rounded-[4px] bg-brand-peach/20 text-brand-orange border border-brand-peach/30 font-bold text-[10px] uppercase tracking-wider">
                    {activeConv.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-text-muted hover:bg-surface-tint hover:text-brand-crimson rounded-lg transition-colors cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-background space-y-6">
            {messages.map((msg) => {
              const isCreator = msg.senderId === 'creator';
              
              if (msg.type === 'OFFER') {
                const isAccepted = msg.offer?.status === 'ACCEPTED';
                return (
                  <div key={msg.id} className="flex flex-col items-center my-8">
                    <div className="w-full max-w-md bg-surface-card border border-border-strong rounded-2xl shadow-sm p-6 space-y-5 relative overflow-hidden">
                      {isAccepted && <div className="absolute top-0 left-0 w-full h-1.5 bg-status-success"></div>}
                      <div className="flex justify-between items-center border-b border-border-warm pb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-brand-orange" />
                          <span className="font-bold text-text-strong text-[15px]">Official Offer Received</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${isAccepted ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'}`}>
                          {msg.offer?.status}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider mb-1 block">Amount</span>
                          <p className="text-[24px] font-extrabold text-text-strong tracking-tight">${msg.offer?.amount}</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider mb-2 block">Deliverables</span>
                          <ul className="space-y-2">
                            {msg.offer?.deliverables.map((del, i) => (
                              <li key={i} className="text-[13px] font-medium text-text-strong flex items-start gap-2.5 bg-surface-tint/50 p-2 rounded-lg border border-border-warm/50">
                                <CheckCircle2 className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
                                <span>{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {msg.offer?.status === 'PENDING' && (
                        <div className="pt-4 border-t border-border-warm flex gap-3">
                          <button className="flex-1 py-2.5 text-[13px] font-bold rounded-xl border border-border-warm text-text-muted hover:text-brand-crimson hover:bg-surface-tint transition-all cursor-pointer">
                            Decline
                          </button>
                          <button 
                            onClick={() => acceptOffer(msg.id)}
                            className="flex-1 py-2.5 text-[13px] font-bold rounded-xl bg-status-success text-white hover:bg-emerald-600 transition-all shadow-sm cursor-pointer"
                          >
                            Accept Offer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isCreator ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-[20px] px-5 py-3.5 ${isCreator ? 'bg-brand-crimson text-white rounded-br-[4px] shadow-sm' : 'bg-surface-card border border-border-strong text-text-strong rounded-bl-[4px] shadow-sm'}`}>
                    <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>
                    <span className={`text-[11px] font-semibold mt-1.5 block ${isCreator ? 'text-white/70 text-right' : 'text-text-muted'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-border-strong rounded-[20px] rounded-bl-[4px] px-5 py-4 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* AI Smart Reply Suggestion */}
          <div className="px-6 py-3 bg-surface border-t border-border-warm flex items-center gap-3 overflow-x-auto hide-scrollbar">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-peach/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0">AI Suggestions:</span>
            <button 
              onClick={() => setInputText("Thank you! I accept the offer.")}
              className="px-4 py-1.5 rounded-full bg-surface-card border border-brand-peach/40 hover:border-brand-orange hover:bg-brand-peach/10 text-text-strong text-[13px] font-medium transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              "Thank you! I accept the offer."
            </button>
            <button 
              onClick={() => setInputText("Could we negotiate the rate slightly for the extra thread?")}
              className="px-4 py-1.5 rounded-full bg-surface-card border border-brand-peach/40 hover:border-brand-orange hover:bg-brand-peach/10 text-text-strong text-[13px] font-medium transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              "Could we negotiate the rate?"
            </button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface border-t border-border-warm shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
              <button type="button" className="p-2.5 text-text-muted hover:bg-surface-tint hover:text-text-strong rounded-xl transition-colors cursor-pointer mb-0.5">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-surface-card rounded-2xl border border-border-strong focus-within:border-brand-crimson focus-within:ring-1 focus-within:ring-brand-crimson transition-all shadow-sm">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Message..." 
                  className="w-full max-h-32 p-3.5 bg-transparent outline-none resize-none text-[14px] text-text-strong font-medium placeholder:text-text-muted"
                  rows={1}
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3.5 bg-brand-crimson text-white rounded-2xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mb-0.5"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}
