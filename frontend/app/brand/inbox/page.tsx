'use client';

import React, { useState, useEffect } from 'react';
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
  XCircle,
  AlertCircle,
  Briefcase,
  User,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    creator: {
      name: 'Alex Developer',
      avatar: 'AD',
      handle: '@alexdev',
    },
    campaign: {
      name: 'Cloud Infrastructure Launch',
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
    },
    campaign: {
      name: 'AI Database Integration',
      id: 'camp_2',
    },
    lastMessage: 'The contract looks good. I have signed it.',
    time: 'Yesterday',
    unread: 0,
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

export default function BrandInboxPage() {
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
      if (user.role !== 'BRAND') {
        router.push('/creator/inbox');
        return;
      }
    }
  }, [user, authLoading, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'brand',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TEXT',
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    
    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        senderId: 'creator',
        text: 'Thanks for the update. Let me review and get back to you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'TEXT',
      }]);
    }, 2000);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col">
        
        <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#F4511E]" />
          Loading Inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col h-screen">
      

      <main className="w-full px-4 md:px-6 lg:px-8 py-6 flex-1 w-full flex overflow-hidden gap-6">
        
        {/* Sidebar / Conversation List */}
        <aside className="w-1/3 max-w-[320px] bg-white rounded-2xl border border-[#E7E8F0] shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E7E8F0] space-y-4">
            <h1 className="text-lg font-bold text-[#17182B]">Inbox</h1>
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B90A5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 bg-[#F5F6FA] border border-transparent focus:bg-white focus:border-[#F4511E] rounded-xl text-sm transition outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 border-b border-[#E7E8F0] cursor-pointer transition hover:bg-[#F8F9FC] ${activeConv.id === conv.id ? 'bg-[#FFF5F2]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F3F3FC] text-[#8580E8] flex items-center justify-center font-bold flex-shrink-0">
                    {conv.creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#17182B] truncate">{conv.creator.name}</h3>
                      <span className="text-[10px] text-[#8B90A5] whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-[#F4511E] font-medium truncate mb-1">
                      {conv.campaign.name}
                    </p>
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-[#17182B] font-semibold' : 'text-[#626782]'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#F4511E] text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 bg-white rounded-2xl border border-[#E7E8F0] shadow-sm flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="h-16 border-b border-[#E7E8F0] flex items-center justify-between px-6 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F3F3FC] text-[#8580E8] flex items-center justify-center font-bold">
                {activeConv.creator.avatar}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#17182B]">{activeConv.creator.name}</h2>
                <div className="flex items-center text-[11px] text-[#626782] gap-2">
                  <Briefcase className="w-3 h-3" />
                  <span>{activeConv.campaign.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FFF5F2] text-[#F4511E] font-medium">
                    {activeConv.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#8B90A5] hover:bg-[#F5F6FA] rounded-lg transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FC] space-y-6">
            {messages.map((msg) => {
              const isBrand = msg.senderId === 'brand';
              
              if (msg.type === 'OFFER') {
                return (
                  <div key={msg.id} className="flex flex-col items-center my-6">
                    <div className="w-full max-w-md bg-white border border-[#E7E8F0] rounded-2xl shadow-sm p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#E7E8F0] pb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#F4511E]" />
                          <span className="font-bold text-[#17182B] text-sm">Official Offer Sent</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-orange-50 text-orange-600 rounded-lg">
                          PENDING
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-[#8B90A5] uppercase font-bold tracking-wider">Amount</span>
                          <p className="text-lg font-bold text-[#17182B]">${msg.offer?.amount}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[#8B90A5] uppercase font-bold tracking-wider">Deliverables</span>
                          <ul className="mt-1 space-y-1">
                            {msg.offer?.deliverables.map((del, i) => (
                              <li key={i} className="text-sm text-[#626782] flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#E7E8F0] flex gap-2">
                        <button className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[#E7E8F0] text-[#17182B] hover:bg-[#F5F6FA] transition">
                          Revoke Offer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isBrand ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isBrand ? 'bg-[#F4511E] text-white rounded-br-sm' : 'bg-white border border-[#E7E8F0] text-[#17182B] rounded-bl-sm shadow-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${isBrand ? 'text-white/70 text-right' : 'text-[#8B90A5]'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E7E8F0] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#8B90A5] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#8B90A5] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#8B90A5] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* AI Smart Reply Suggestion */}
          <div className="px-6 py-2 bg-white border-t border-[#E7E8F0] flex items-center gap-2 overflow-x-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#F4511E] flex-shrink-0" />
            <span className="text-[11px] font-semibold text-[#8B90A5] uppercase tracking-wider">AI Suggestions:</span>
            <button 
              onClick={() => setInputText("That sounds perfect. I'll send over the updated brief.")}
              className="px-3 py-1.5 rounded-full bg-[#FFF5F2] hover:bg-[#FFEAE3] text-[#F4511E] text-xs font-medium transition whitespace-nowrap border border-[#F4511E]/20"
            >
              "That sounds perfect. I'll send over the updated brief."
            </button>
            <button 
              onClick={() => setInputText("Could we schedule a quick call to align on the timeline?")}
              className="px-3 py-1.5 rounded-full bg-[#FFF5F2] hover:bg-[#FFEAE3] text-[#F4511E] text-xs font-medium transition whitespace-nowrap border border-[#F4511E]/20"
            >
              "Could we schedule a quick call?"
            </button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#E7E8F0]">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <button type="button" className="p-2.5 text-[#8B90A5] hover:bg-[#F5F6FA] rounded-xl transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-[#F5F6FA] rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#F4511E] transition overflow-hidden">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message..." 
                  className="w-full max-h-32 p-3 bg-transparent outline-none resize-none text-sm"
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-[#F4511E] text-white rounded-xl hover:bg-[#D94316] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}
