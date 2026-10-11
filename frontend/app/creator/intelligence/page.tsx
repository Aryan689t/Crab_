'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  Sparkles,
  User,
  Users,
  Video,
  Target,
  Lightbulb,
  TrendingUp,
  Maximize2,
  MoreVertical,
  Send,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Instagram,
  Paperclip,
  Activity,
  FileText,
  Play
} from 'lucide-react';

export default function CreatorIntelligencePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const TABS = ['Overview', 'Audience', 'Content', 'Brand Suitability', 'Opportunity Signals', 'Performance', 'Past Collaborations'];

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 min-h-screen bg-background text-text-strong font-inter flex flex-col">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-text-strong tracking-tight font-jakarta">Creator Intelligence</h1>
          <p className="text-[14px] text-text-muted mt-1">Your personalized AI analysis based on your content, audience, performance and collaborations.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-card border border-status-success/20 p-3 rounded-[16px] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-status-success/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-status-success" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-text-muted">AI Profile Confidence</div>
            <div className="text-[16px] font-bold flex items-center gap-2">
              94% <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Last analyzed 2 hours ago</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar border-b border-border-warm pb-0 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 pb-3 font-semibold text-[13px] transition-colors relative border-b-2 whitespace-nowrap ${
              activeTab === tab ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted hover:text-text-strong'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* Main Content (Left) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Creator Profile Card */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-border-strong overflow-hidden shrink-0">
                <img src="https://ui-avatars.com/api/?name=Aaryan+Mehta&background=18181B&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-bold text-[15px] truncate">Aaryan Mehta</h3>
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                </div>
                <p className="text-[11px] text-text-muted font-medium truncate mb-2">Technical Educator • YouTuber</p>
                <p className="text-[11px] font-bold text-text-strong mb-2">1.2M followers across platforms</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold"><Play className="w-3.5 h-3.5 text-red-500 fill-red-500" /> 980K</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold"><Instagram className="w-3.5 h-3.5 text-pink-500" /> 220K</span>
                </div>
              </div>
            </div>

            {/* CRAB's Understanding */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-brand-peach/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <h3 className="font-bold text-[13px]">CRAB's Understanding</h3>
              </div>
              <p className="text-[12px] leading-relaxed text-text-muted font-medium">
                You are a technical educator who creates in-depth, practical content about programming, AI tools and cloud technologies. Your content is tutorial-driven, well-structured and highly valued by developers and students.
              </p>
            </div>

            {/* Your Creator Identity */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm relative">
              <button className="absolute top-4 right-4 px-2.5 py-1 rounded-lg border border-border-warm text-[10px] font-bold hover:bg-surface-tint">
                Edit
              </button>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-surface-tint flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-text-strong" />
                </div>
                <h3 className="font-bold text-[13px]">Your Creator Identity</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-text-muted w-24 shrink-0 pt-0.5">Primary Niche</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Developer Education</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-text-muted w-24 shrink-0 pt-0.5">Secondary Niches</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">AI Tools</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Cloud Computing</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Programming</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Productivity</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-text-muted w-24 shrink-0">Content Style</span>
                  <span className="text-[11px] font-semibold text-text-strong">Educational • Tutorial-driven • Technical Deep Dives</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-text-muted w-24 shrink-0">Creator Type</span>
                  <span className="text-[11px] font-semibold text-text-strong">Technical Educator</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Audience Intelligence */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-brand-orange" />
                <h3 className="font-bold text-[14px]">Audience Intelligence</h3>
              </div>
              <p className="text-[11px] text-text-muted mb-4">Who watches your content?</p>
              
              <div className="flex-1 flex items-center justify-between mb-4">
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8E4DF" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="48 52" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="27 73" strokeDashoffset="-48" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="17 83" strokeDashoffset="-75" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#D1D5DB" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="-92" />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <span className="text-[16px] font-extrabold text-text-strong leading-none mb-0.5">1.2M</span>
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Total Audience</span>
                  </div>
                </div>
                
                <div className="flex-1 pl-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10B981]"/> Developers</span>
                    <span>48%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8B5CF6]"/> CS Students</span>
                    <span>27%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"/> Tech Professionals</span>
                    <span>17%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#D1D5DB]"/> Other</span>
                    <span>8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1 text-blue-600">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Audience Insight</span>
                </div>
                <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                  Your audience has strong interest in developer tools, cloud platforms and AI products. 72% are aged 18-34.
                </p>
              </div>
            </div>

            {/* Content Intelligence */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-[14px]">Content Intelligence</h3>
              </div>
              <p className="text-[11px] text-text-muted mb-4">What performs best for you?</p>
              
              <div className="flex-1 space-y-3 mb-4">
                {[
                  { label: 'Programming Tutorials', val: 95, color: 'bg-blue-600' },
                  { label: 'AI Tool Reviews', val: 88, color: 'bg-blue-500' },
                  { label: 'Cloud Tutorials', val: 82, color: 'bg-blue-400' },
                  { label: 'Tech News / Updates', val: 56, color: 'bg-blue-300' },
                  { label: 'Personal / Lifestyle', val: 32, color: 'bg-border-strong' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold w-28 shrink-0 truncate">{item.label}</span>
                    <div className="flex-1 h-2 bg-surface-tint rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                    </div>
                    <span className="text-[11px] font-bold w-7 text-right">{item.val}%</span>
                  </div>
                ))}
              </div>

              <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2 text-status-success">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Topics gaining momentum</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>AI Coding Tools</span>
                    <span className="text-status-success font-bold">+34%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Cloud Development</span>
                    <span className="text-status-success font-bold">+21%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Developer Productivity</span>
                    <span className="text-status-success font-bold">+18%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Suitability */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-brand-orange" />
                <h3 className="font-bold text-[14px]">Brand Suitability</h3>
              </div>
              <p className="text-[11px] text-text-muted mb-4">Brands and categories you're a strong fit for.</p>
              
              <div className="flex-1 space-y-3 mb-4">
                {[
                  { label: 'Developer Tools', val: 96, color: 'bg-brand-orange' },
                  { label: 'AI Products', val: 94, color: 'bg-brand-orange/90' },
                  { label: 'Cloud Platforms', val: 92, color: 'bg-brand-orange/80' },
                  { label: 'Productivity Software', val: 87, color: 'bg-brand-orange/70' },
                  { label: 'Consumer Electronics', val: 71, color: 'bg-brand-peach' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold w-28 shrink-0 truncate">{item.label}</span>
                    <div className="flex-1 h-2 bg-surface-tint rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                    </div>
                    <span className="text-[11px] font-bold w-7 text-right">{item.val}%</span>
                  </div>
                ))}
              </div>

              <div className="bg-brand-peach/10 border border-brand-peach/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1 text-brand-crimson">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Why this matters</span>
                </div>
                <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                  Your audience, content topics and historical performance indicate strong compatibility with developer-focused software and technology brands.
                </p>
              </div>
            </div>

          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Opportunity Signals */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-brand-orange" />
                <h3 className="font-bold text-[14px]">Opportunity Signals</h3>
              </div>
              <p className="text-[11px] text-text-muted mb-4">CRAB sees strong potential in these categories.</p>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-surface-tint flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[12px] font-bold flex items-center gap-2">AI Developer Tools <span className="text-[9px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded border border-status-success/20 flex items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-status-success"/> High Potential</span></h4>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-text-muted font-medium">High audience overlap + growing content performance.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-surface-tint flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[12px] font-bold flex items-center gap-2">Cloud Platforms <span className="text-[9px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded border border-status-success/20 flex items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-status-success"/> High Potential</span></h4>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-text-muted font-medium">Strong engagement with cloud-related tutorials.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-surface-tint flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[12px] font-bold flex items-center gap-2">Developer Hardware <span className="text-[9px] font-bold text-brand-orange bg-brand-peach/20 px-1.5 py-0.5 rounded border border-brand-peach/30 flex items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-orange"/> Moderate</span></h4>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-text-muted font-medium">Good audience fit, but weaker conversion signals.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-surface-tint flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-status-danger" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[12px] font-bold flex items-center gap-2">Fashion & Lifestyle <span className="text-[9px] font-bold text-status-danger bg-status-danger/10 px-1.5 py-0.5 rounded border border-status-danger/20 flex items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-status-danger"/> Low</span></h4>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-text-muted font-medium">Low audience relevance based on your content.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Intelligence */}
            <div className="bg-surface-card border border-border-warm rounded-[20px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-brand-crimson" />
                <h3 className="font-bold text-[14px]">Performance Intelligence</h3>
              </div>
              <p className="text-[11px] text-text-muted mb-4">Your growth and engagement trends.</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-surface-tint border border-border-warm rounded-xl p-3">
                  <div className="text-[10px] text-text-muted font-bold mb-1">Avg. Views</div>
                  <div className="text-[15px] font-extrabold mb-1">420K</div>
                  <div className="text-[10px] font-bold text-status-success flex items-center gap-1">↑ 18%</div>
                </div>
                <div className="bg-surface-tint border border-border-warm rounded-xl p-3">
                  <div className="text-[10px] text-text-muted font-bold mb-1">Engagement Rate</div>
                  <div className="text-[15px] font-extrabold mb-1">8.4%</div>
                  <div className="text-[10px] font-bold text-status-success flex items-center gap-1">↑ 12%</div>
                </div>
                <div className="bg-surface-tint border border-border-warm rounded-xl p-3">
                  <div className="text-[10px] text-text-muted font-bold mb-1">Follower Growth</div>
                  <div className="text-[15px] font-extrabold mb-1">+18.2%</div>
                  <div className="text-[10px] text-text-muted font-medium">Last 90 days</div>
                </div>
                <div className="bg-surface-tint border border-border-warm rounded-xl p-3">
                  <div className="text-[10px] text-text-muted font-bold mb-1">Posting Frequency</div>
                  <div className="text-[15px] font-extrabold mb-1">4.2 / week</div>
                  <div className="text-[10px] font-bold text-status-success flex items-center gap-1">↑ 1.3x</div>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2 text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">AI Interpretation</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[11px] font-medium text-text-strong">
                    <Check className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                    <span>Your engagement rate is above the average for creators in your category.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] font-medium text-text-strong">
                    <Check className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                    <span>Tutorials between 8-14 minutes consistently outperform shorter content.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] font-medium text-text-strong">
                    <Check className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                    <span>Videos featuring practical projects generate 27% higher engagement.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>

        {/* CRAB Assistant (Right Sidebar) */}
        <div className="w-full xl:w-[380px] shrink-0 flex flex-col bg-surface-card border border-border-warm rounded-[24px] shadow-sm overflow-hidden h-[calc(100vh-140px)] sticky top-6">
          
          <div className="p-4 border-b border-border-warm flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                <img src="/logo.svg" alt="CRAB" className="w-full h-full object-contain" />
              </div>
              <h2 className="font-extrabold text-[15px] text-text-strong">CRAB Assistant <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-peach/30 text-brand-orange border border-brand-peach/50 uppercase">Beta</span></h2>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-text-muted hover:bg-surface-tint hover:text-text-strong transition-colors"><Maximize2 className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-text-muted hover:bg-surface-tint hover:text-text-strong transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="p-4 border-b border-border-warm bg-surface-tint shrink-0">
            <p className="text-[12px] text-text-muted font-medium text-center">Ask anything about your content, audience, opportunities or strategy.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar bg-white">
            
            {/* User Message 1 */}
            <div className="flex justify-end gap-3">
              <div className="bg-surface-tint border border-border-warm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-[12px] font-medium text-text-strong">What brands should I target next?</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-border-strong overflow-hidden shrink-0">
                <img src="https://ui-avatars.com/api/?name=Aaryan+Mehta&background=18181B&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Assistant Response 1 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 shrink-0 mt-0.5">
                <img src="/logo.svg" alt="CRAB" className="w-full h-full object-contain" />
              </div>
              <div className="max-w-[85%]">
                <p className="text-[12px] text-text-strong font-medium leading-relaxed mb-4">
                  Based on your audience, recent content performance and past collaborations, here are the top brand categories you should target next:
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    { rank: 1, logo: 'C', bg: '#000', name: 'Cursor', desc: 'AI Developer Tools', score: '94%' },
                    { rank: 2, logo: 'AWS', bg: '#232F3E', name: 'AWS', desc: 'Cloud Platforms', score: '93%' },
                    { rank: 3, logo: 'N', bg: '#000', name: 'Notion', desc: 'Productivity Software', score: '87%' },
                    { rank: 4, logo: 'G', bg: '#000', name: 'GitHub', desc: 'Developer Tools', score: '86%' },
                    { rank: 5, logo: 'L', bg: '#00B8FC', name: 'Logitech', desc: 'Tech Hardware', score: '81%' }
                  ].map(b => (
                    <div key={b.name} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-text-muted w-3 text-right">{b.rank}.</span>
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: b.bg }}>{b.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-text-strong truncate">{b.name}</div>
                        <div className="text-[10px] text-text-muted truncate">{b.desc}</div>
                      </div>
                      <span className="text-[12px] font-bold text-text-strong">{b.score}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-[12px] font-bold mb-1">Why these brands?</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li className="text-[11px] text-text-muted font-medium">Your AI-tool content is currently outperforming your channel average by 34%.</li>
                    <li className="text-[11px] text-text-muted font-medium">Your audience strongly overlaps with developer and cloud technology users.</li>
                    <li className="text-[11px] text-text-muted font-medium">These categories have high campaign activity on CRAB right now.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Message 2 */}
            <div className="flex justify-end gap-3">
              <div className="bg-surface-tint border border-border-warm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-[12px] font-medium text-text-strong">How can I improve my chances of getting brand deals?</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-border-strong overflow-hidden shrink-0">
                <img src="https://ui-avatars.com/api/?name=Aaryan+Mehta&background=18181B&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Assistant Response 2 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 shrink-0 mt-0.5">
                <img src="/logo.svg" alt="CRAB" className="w-full h-full object-contain" />
              </div>
              <div className="max-w-[85%]">
                <p className="text-[12px] text-text-strong font-medium leading-relaxed mb-3">
                  Here are a few personalized suggestions:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-surface-tint flex items-center justify-center text-[9px] font-bold text-text-strong shrink-0 mt-0.5">1</div>
                    <p className="text-[11px] text-text-muted font-medium">Create more practical, hands-on tutorials (8-14 minutes work best).</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-surface-tint flex items-center justify-center text-[9px] font-bold text-text-strong shrink-0 mt-0.5">2</div>
                    <p className="text-[11px] text-text-muted font-medium">Focus on AI tools and cloud technologies (these have the highest brand demand).</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-surface-tint flex items-center justify-center text-[9px] font-bold text-text-strong shrink-0 mt-0.5">3</div>
                    <p className="text-[11px] text-text-muted font-medium">Showcase real-world use cases and projects.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-surface-tint flex items-center justify-center text-[9px] font-bold text-text-strong shrink-0 mt-0.5">4</div>
                    <p className="text-[11px] text-text-muted font-medium">Keep a consistent posting schedule (4+ videos per week).</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border-warm bg-white shrink-0">
            <div className="relative">
              <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted cursor-pointer hover:text-text-strong transition-colors" />
              <input 
                type="text" 
                placeholder="Ask CRAB anything..." 
                className="w-full bg-surface-card border border-border-warm rounded-xl py-3 pl-10 pr-12 text-[12px] font-medium placeholder:text-text-muted focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-sm"
              />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center shadow-sm hover:bg-[#E05A18] transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
