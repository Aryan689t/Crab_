'use client';

import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  Video,
  FileText,
  Check,
  ChevronRight,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const MOCK_APPS = [
  {
    id: '1',
    brand: 'AWS',
    title: 'Cloud Creator Program',
    logoBg: '#232F3E',
    logoText: '#FF9900',
    status: 'Under Review',
    statusColor: 'text-brand-orange',
    statusBg: 'bg-brand-peach/20',
    submittedAt: '3 days ago',
    message: 'Looking forward to discussing this opportunity!'
  },
  {
    id: '2',
    brand: 'Cursor',
    title: 'AI Coding Tools Campaign',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'In Discussion',
    statusColor: 'text-blue-600',
    statusBg: 'bg-blue-50',
    submittedAt: '5 days ago',
    message: 'Excited about the possibility of collaborating!'
  },
  {
    id: '3',
    brand: 'Notion',
    title: 'Productivity for Creators',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'Offer Received',
    statusColor: 'text-status-success',
    statusBg: 'bg-status-success/10',
    submittedAt: '1 week ago',
    message: 'Would love to be part of this campaign.'
  },
  {
    id: '4',
    brand: 'Logitech',
    title: 'Tech Gear Review Series',
    logoBg: '#00B8FC',
    logoText: '#FFFFFF',
    status: 'Rejected',
    statusColor: 'text-text-muted',
    statusBg: 'bg-surface-tint',
    submittedAt: '2 weeks ago',
    message: 'Hope to hear from you soon!'
  },
  {
    id: '5',
    brand: 'JetBrains',
    title: 'Developer Tools Campaign',
    logoBg: '#000000',
    logoText: '#FF318C',
    status: 'Accepted',
    statusColor: 'text-status-success',
    statusBg: 'bg-status-success/10',
    submittedAt: '3 weeks ago',
    message: 'This aligns perfectly with my content!'
  },
  {
    id: '6',
    brand: 'Figma',
    title: 'Design Tools for Developers',
    logoBg: '#000000',
    logoText: '#F24E1E',
    status: 'Expired',
    statusColor: 'text-text-muted',
    statusBg: 'bg-surface-tint',
    submittedAt: '1 month ago',
    message: 'Let me know if you need any additional details.'
  }
];

export default function CreatorApplicationsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [activeApp, setActiveApp] = useState(MOCK_APPS[0].id);

  const TABS = [
    { label: 'All', count: 8 },
    { label: 'Under Review', count: 3 },
    { label: 'In Discussion', count: 2 },
    { label: 'Offer Received', count: 1 },
    { label: 'Accepted', count: 1 },
    { label: 'Rejected', count: 1 }
  ];

  const INNER_TABS = ['Application Details', 'Messages', 'Brand Info', 'Similar Opportunities'];
  const [activeInnerTab, setActiveInnerTab] = useState('Application Details');

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 min-h-screen bg-background text-text-strong font-inter">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text-strong tracking-tight font-jakarta">My Applications</h1>
        <p className="text-[15px] text-text-muted mt-1">Track the status of opportunities you've applied to and continue the conversation.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-warm pb-0 mb-6 gap-4">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 pb-3 font-semibold text-[14px] transition-colors relative border-b-2 ${
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
        <div className="flex items-center gap-2 text-[13px] text-text-muted font-medium pb-3">
          <span>Sort by</span>
          <select className="bg-transparent font-bold text-text-strong outline-none cursor-pointer">
            <option>Most Recent</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left List */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3">
          {MOCK_APPS.map(app => {
            const isActive = activeApp === app.id;
            return (
              <div 
                key={app.id} 
                onClick={() => setActiveApp(app.id)}
                className={`p-4 rounded-[16px] border cursor-pointer transition-all flex gap-4 ${
                  isActive 
                    ? 'border-brand-orange bg-brand-peach/5 shadow-sm' 
                    : 'border-border-warm bg-surface-card hover:border-brand-orange/40 hover:shadow-sm'
                }`}
              >
                {/* Logo */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{ backgroundColor: app.logoBg, color: app.logoText }}
                >
                  {app.brand.substring(0, 3).toUpperCase()}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[15px] truncate">{app.brand}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${app.statusBg} ${app.statusColor} whitespace-nowrap ml-2`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-text-strong truncate">{app.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Application submitted • {app.submittedAt}</p>
                  <p className="text-[12px] text-text-muted mt-2 line-clamp-1">{app.message}</p>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center justify-center text-text-muted shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Detail View */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Top Header Card */}
          <div className="bg-surface-card border border-border-warm rounded-[20px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-[14px] bg-[#232F3E] text-[#FF9900] flex items-center justify-center font-bold text-xl shrink-0">
                  AWS
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-text-strong uppercase tracking-wider mb-0.5">AWS</h2>
                  <h1 className="text-[22px] font-bold font-jakarta text-text-strong">Cloud Creator Program</h1>
                  <p className="text-[14px] text-text-muted mt-1">Educational content series about AWS cloud technologies for developers.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-strong text-[13px] font-bold text-text-strong hover:bg-surface-tint transition-colors">
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white text-[13px] font-bold shadow-sm hover:bg-[#E05A18] transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message Brand
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-border-warm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center"><Calendar className="w-4 h-4 text-text-muted" /></div>
                <div>
                  <div className="text-[13px] font-bold">₹45K - ₹65K</div>
                  <div className="text-[11px] text-text-muted font-medium">Budget Range</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center"><Clock className="w-4 h-4 text-text-muted" /></div>
                <div>
                  <div className="text-[13px] font-bold">2-4 weeks</div>
                  <div className="text-[11px] text-text-muted font-medium">Timeline</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center"><Video className="w-4 h-4 text-text-muted" /></div>
                <div>
                  <div className="text-[13px] font-bold">YouTube</div>
                  <div className="text-[11px] text-text-muted font-medium">Platform</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-tint flex items-center justify-center"><FileText className="w-4 h-4 text-text-muted" /></div>
                <div>
                  <div className="text-[13px] font-bold">Tutorial / Educational</div>
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
                className={`pb-3 text-[14px] font-semibold transition-colors border-b-2 ${
                  activeInnerTab === tab ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted hover:text-text-strong'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Content */}
            <div className="xl:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold">Your Application</h3>
                  <p className="text-[13px] text-text-muted">Submitted on Mar 12, 2026</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-strong text-[12px] font-bold hover:bg-surface-tint transition-colors">
                  View Application <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message Box */}
              <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 text-[14px] leading-relaxed font-medium text-text-muted shadow-sm">
                Hi,<br/><br/>
                I'm really excited about this opportunity. My channel focuses on developer education and cloud technologies, and I believe this campaign aligns perfectly with my content and audience.<br/><br/>
                Looking forward to discussing this further!<br/><br/>
                Best,<br/>
                Aaryan
              </div>

              {/* Grid 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                  <h4 className="text-[14px] font-bold mb-4">Match Score</h4>
                  <div className="flex items-center gap-6">
                    {/* Circle Progress Mock */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-surface-tint" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-status-success" strokeDasharray="93, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-[22px] font-extrabold text-text-strong">93%</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-[12px] font-bold">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-success"/> Audience Fit</span>
                        <span className="text-text-muted">95%</span>
                      </div>
                      <div className="flex justify-between text-[12px] font-bold">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-success"/> Content Fit</span>
                        <span className="text-text-muted">92%</span>
                      </div>
                      <div className="flex justify-between text-[12px] font-bold">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-orange"/> Niche Relevance</span>
                        <span className="text-text-muted">96%</span>
                      </div>
                      <div className="flex justify-between text-[12px] font-bold">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-orange"/> Commercial Fit</span>
                        <span className="text-text-muted">89%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                  <h4 className="text-[14px] font-bold mb-4">Why You're a Good Fit</h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2.5 text-[12px] font-medium text-text-muted">
                      <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>Your audience aligns with developer and tech enthusiasts</span>
                    </li>
                    <li className="flex gap-2.5 text-[12px] font-medium text-text-muted">
                      <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>Your tutorial content style fits the campaign goals</span>
                    </li>
                    <li className="flex gap-2.5 text-[12px] font-medium text-text-muted">
                      <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>Strong past performance with cloud and dev tools content</span>
                    </li>
                    <li className="flex gap-2.5 text-[12px] font-medium text-text-muted">
                      <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>Similar creators have performed well in AWS campaigns</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                <h4 className="text-[14px] font-bold mb-4">Current Status</h4>
                
                <div className="bg-brand-peach/10 border border-brand-peach/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </div>
                    <span className="text-[14px] font-bold text-brand-orange">Under Review</span>
                  </div>
                  <p className="text-[12px] text-text-muted font-medium ml-7">The brand is reviewing your application.</p>
                </div>

                <div className="relative pl-3 space-y-6 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-border-warm">
                  <div className="relative z-10 flex gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0 ml-[3px]" />
                    <div>
                      <h5 className="text-[13px] font-bold">Application Submitted</h5>
                      <p className="text-[11px] text-text-muted">Mar 12, 2026</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0 ml-[3px] ring-4 ring-brand-peach/20" />
                    <div>
                      <h5 className="text-[13px] font-bold text-text-strong">Under Review</h5>
                      <p className="text-[11px] text-text-muted">Since Mar 13, 2026</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex gap-4 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong mt-1.5 shrink-0 ml-[3px]" />
                    <div>
                      <h5 className="text-[13px] font-bold text-text-strong">In Discussion</h5>
                    </div>
                  </div>
                  <div className="relative z-10 flex gap-4 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong mt-1.5 shrink-0 ml-[3px]" />
                    <div>
                      <h5 className="text-[13px] font-bold text-text-strong">Offer Received</h5>
                    </div>
                  </div>
                  <div className="relative z-10 flex gap-4 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong mt-1.5 shrink-0 ml-[3px]" />
                    <div>
                      <h5 className="text-[13px] font-bold text-text-strong">Accepted / Rejected</h5>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card border border-border-warm rounded-[16px] p-6 shadow-sm">
                <h4 className="text-[14px] font-bold mb-4">Deal Insights</h4>
                <div className="mb-4">
                  <p className="text-[12px] text-text-muted font-medium mb-1">Suggested Rate (CRAB)</p>
                  <p className="text-[22px] font-extrabold tracking-tight">₹50K - ₹60K</p>
                </div>
                <div className="bg-surface-tint rounded-xl p-3 flex gap-3 items-start mb-4">
                  <TrendingUp className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-text-muted">This is 15% higher than your average brand deal rate.</p>
                </div>
                <button className="text-[13px] font-bold text-brand-orange hover:text-[#E05A18] transition-colors flex items-center gap-1.5">
                  View detailed analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
