'use client';

import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  MessageSquare,
  Calendar,
  Clock,
  Video,
  FileText,
  MoreVertical,
  ArrowRight,
  XCircle,
  Download,
  ExternalLink,
  Target,
  Zap
} from 'lucide-react';

const MOCK_REQUESTS = [
  {
    id: '1',
    brand: 'AWS',
    title: 'Cloud Creator Program',
    logoBg: '#232F3E',
    logoText: '#FF9900',
    status: 'New',
    statusColor: 'text-brand-orange',
    statusBg: 'bg-brand-peach/10',
    isNew: true,
    timeAgo: '2 hours ago',
    snippet: '"Hi Aryan! We\'ve been following your content and would love to collaborate on an educational..."'
  },
  {
    id: '2',
    brand: 'Cursor',
    title: 'AI Coding Tools Campaign',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'New',
    statusColor: 'text-brand-orange',
    statusBg: 'bg-brand-peach/10',
    isNew: true,
    timeAgo: '5 hours ago',
    snippet: '"We think your tutorials are a great fit for our audience. Let\'s discuss a potential collaboration..."'
  },
  {
    id: '3',
    brand: 'Notion',
    title: 'Productivity for Creators',
    logoBg: '#000000',
    logoText: '#FFFFFF',
    status: 'In Discussion',
    statusColor: 'text-blue-600',
    statusBg: 'bg-blue-50',
    isNew: false,
    timeAgo: '1 day ago',
    snippet: '"We\'d love to feature you in our upcoming creator campaign. Are you available for a quick call..."'
  },
  {
    id: '4',
    brand: 'Logitech',
    title: 'Tech Gear Review Series',
    logoBg: '#00B8FC',
    logoText: '#FFFFFF',
    status: 'Offer Received',
    statusColor: 'text-status-success',
    statusBg: 'bg-status-success/10',
    isNew: false,
    timeAgo: '2 days ago',
    snippet: '"Your content style aligns perfectly with our product line. We\'re interested in a long-term..."'
  },
  {
    id: '5',
    brand: 'JetBrains',
    title: 'Developer Tools Campaign',
    logoBg: '#000000',
    logoText: '#FF318C',
    status: 'In Discussion',
    statusColor: 'text-blue-600',
    statusBg: 'bg-blue-50',
    isNew: false,
    timeAgo: '3 days ago',
    snippet: '"We\'re running a campaign for our IDE and would love to work with you. Let us know your thoughts..."'
  }
];

export default function CreatorRequestsPage() {
  const [activeTab, setActiveTab] = useState('All Requests');
  const [activeReq, setActiveReq] = useState(MOCK_REQUESTS[0].id);
  const [activeInnerTab, setActiveInnerTab] = useState('Campaign Details');

  const TABS = [
    { label: 'All Requests', count: 5 },
    { label: 'New', count: 2 },
    { label: 'In Discussion', count: 2 },
    { label: 'Offer Received', count: 1 },
    { label: 'Closed', count: 0 }
  ];

  const INNER_TABS = ['Campaign Details', 'Why You Were Chosen', 'Deliverables', 'Brand Info'];

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 min-h-screen bg-background text-text-strong font-inter">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-text-strong tracking-tight font-jakarta">Brand Requests</h1>
        <p className="text-[15px] text-text-muted mt-1">Brands have approached you for collaboration. Review the opportunities below.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar border-b border-border-warm pb-0 mb-6">
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

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left List */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3">
          {MOCK_REQUESTS.map(req => {
            const isActive = activeReq === req.id;
            return (
              <div 
                key={req.id} 
                onClick={() => setActiveReq(req.id)}
                className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                  isActive 
                    ? 'border-brand-orange bg-white shadow-sm' 
                    : 'border-border-warm bg-surface-card hover:border-brand-orange/40 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: req.logoBg, color: req.logoText }}
                    >
                      {req.brand.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] leading-none">{req.brand}</h3>
                      <p className="text-[13px] font-medium text-text-muted mt-1">{req.title}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border border-border-warm ${req.statusBg} ${req.statusColor} whitespace-nowrap`}>
                    {req.isNew && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                    {req.status}
                  </span>
                </div>
                <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2 italic mb-2">{req.snippet}</p>
                <p className="text-[11px] font-semibold text-text-muted/80">{req.timeAgo}</p>
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
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[14px] font-bold text-text-strong uppercase tracking-wider">AWS</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">Direct Request</span>
                  </div>
                  <h1 className="text-[22px] font-bold font-jakarta text-text-strong">Cloud Creator Program</h1>
                  <p className="text-[14px] text-text-muted mt-1">Educational content series about cloud technologies for developers.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button className="p-2.5 rounded-xl border border-border-strong text-text-muted hover:text-text-strong hover:bg-surface-tint transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white text-[13px] font-bold shadow-sm hover:bg-[#E05A18] transition-colors">
                  <MessageSquare className="w-4 h-4" /> Reply to Brand
                </button>
                <button className="p-2.5 rounded-xl text-text-muted hover:text-text-strong hover:bg-surface-tint transition-colors">
                  <MoreVertical className="w-4 h-4" />
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

          {/* Middle Section (Message & Actions) */}
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Message from Brand */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold mb-3">Message from AWS</h3>
              <div className="bg-surface-tint border border-border-warm rounded-[20px] p-6 shadow-sm relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#232F3E] text-[#FF9900] flex items-center justify-center text-[10px] font-bold">
                      AWS
                    </div>
                    <span className="text-[13px] font-bold">Hi Aryan,</span>
                  </div>
                  <span className="text-[12px] text-text-muted font-medium">2 hours ago</span>
                </div>
                <div className="text-[14px] leading-relaxed text-text-strong font-medium space-y-4">
                  <p>
                    We've been following your content and love how you explain complex topics in a simple way. We're running an educational campaign to showcase AWS services for developers and would love to collaborate with you.
                  </p>
                  <p>
                    Let us know if you're interested!
                  </p>
                  <p className="text-text-muted">
                    Best,<br/>
                    The AWS Creator Team
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="w-full xl:w-[300px] shrink-0 pt-7">
              <h3 className="text-[14px] font-bold mb-3 text-center">Interested in working together?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-orange text-white text-[14px] font-bold shadow-sm hover:bg-[#E05A18] transition-colors">
                  Accept Request <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-card border border-border-strong text-text-strong text-[14px] font-bold shadow-sm hover:bg-surface-tint transition-colors">
                  <MessageSquare className="w-4 h-4" /> Discuss Further
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-card border border-status-danger/30 text-status-danger text-[14px] font-bold shadow-sm hover:bg-status-danger/5 transition-colors">
                  <XCircle className="w-4 h-4" /> Decline Request
                </button>
              </div>
            </div>
          </div>

          {/* Inner Tabs for Details */}
          <div className="flex items-center gap-8 border-b border-border-warm mt-2">
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

          {/* Tab Content (Campaign Details) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
            
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              
              <div>
                <h3 className="text-[16px] font-bold mb-2">Campaign Overview</h3>
                <p className="text-[14px] leading-relaxed text-text-muted font-medium">
                  AWS is looking to partner with creators to produce educational content that helps developers learn and build with cloud technologies. The goal is to create high-quality, informative content that showcases real-world use cases of AWS services.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border-warm rounded-[16px] p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-peach/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-text-strong mb-1">Target Audience</h4>
                    <p className="text-[12px] text-text-muted font-medium">Developers, CS Students, Tech Enthusiasts</p>
                  </div>
                </div>
                <div className="border border-border-warm rounded-[16px] p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-text-strong mb-1">Content Goals</h4>
                    <p className="text-[12px] text-text-muted font-medium">Create awareness and educate on AWS services</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Sidebar Assets */}
            <div>
              <h3 className="text-[16px] font-bold mb-4">Campaign Assets</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border-warm rounded-xl hover:bg-surface-tint transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-peach/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-text-strong">Campaign Brief (PDF)</h4>
                      <p className="text-[11px] text-text-muted">2.4 MB</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-text-muted" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border-warm rounded-xl hover:bg-surface-tint transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-peach/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-text-strong">Brand Guidelines (PDF)</h4>
                      <p className="text-[11px] text-text-muted">1.8 MB</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-text-muted" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border-warm rounded-xl hover:bg-surface-tint transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-text-strong">Example References</h4>
                      <p className="text-[11px] text-text-muted">Drive Folder</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            </div>

          </div>

          {/* Key Details Bottom Row */}
          <div className="mt-4">
            <h3 className="text-[16px] font-bold mb-4">Key Details</h3>
            <div className="border border-border-warm rounded-[16px] p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="text-[12px] text-text-muted font-medium mb-1">Budget Range</div>
                <div className="text-[14px] font-bold">₹45K - ₹65K</div>
              </div>
              <div>
                <div className="text-[12px] text-text-muted font-medium mb-1">Timeline</div>
                <div className="text-[14px] font-bold">2-4 weeks</div>
              </div>
              <div>
                <div className="text-[12px] text-text-muted font-medium mb-1">Platform</div>
                <div className="text-[14px] font-bold">YouTube</div>
              </div>
              <div>
                <div className="text-[12px] text-text-muted font-medium mb-1">Content Type</div>
                <div className="text-[14px] font-bold">Tutorial / Educational</div>
              </div>
              <div>
                <div className="text-[12px] text-text-muted font-medium mb-1">No. of Videos</div>
                <div className="text-[14px] font-bold">2-3 videos</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
