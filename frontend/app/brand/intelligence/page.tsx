'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';

import {
  Sparkles,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CHART_DATA = [
  { name: 'Jan', roi: 2.1 },
  { name: 'Feb', roi: 2.4 },
  { name: 'Mar', roi: 3.2 },
  { name: 'Apr', roi: 2.8 },
  { name: 'May', roi: 3.9 },
  { name: 'Jun', roi: 4.5 },
];

export default function BrandIntelligencePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'BRAND') {
        router.push('/creator/dashboard');
        return;
      }
      
      // Simulate data loading
      setTimeout(() => setLoading(false), 800);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        
        <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#F4511E]" />
          Analyzing Brand Intelligence...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      

      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#17182B]">Brand Intelligence</h1>
            <p className="text-sm text-[#626782] mt-1">Cross-campaign strategy and creator insights analyzed by CRAB AI.</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E7E8F0] text-sm font-semibold text-[#17182B] shadow-sm hover:bg-[#F5F6FA] transition">
            <RefreshCw className="w-4 h-4 text-[#8B90A5]" />
            <span>Regenerate Insights</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Insights */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E8F0] shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-[#E7E8F0]">
                <Sparkles className="w-5 h-5 text-[#F4511E]" />
                <h2 className="font-bold text-lg text-[#17182B]">Strategic Learnings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#F4511E] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#17182B]">Technical Deep Dives Outperform Casual Mentions</h3>
                    <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                      Creators who integrate your product into a 10+ minute tutorial drive 3x more conversions than those doing 60-second integrations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#8580E8] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#17182B]">Untapped Niche: DevOps Engineers</h3>
                    <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                      Recent campaigns showed a 15% higher CTR among creators with a DevOps focus compared to general web development.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-[#17182B]">Creator Economics: Estimated ROI Trend</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                  +114% YoY
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F7" vertical={false} />
                    <XAxis dataKey="name" stroke="#8B90A5" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8B90A5" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#F8F9FC'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="roi" fill="#F4511E" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-[#FFF5F2] p-5 rounded-2xl border border-[#F4511E]/20 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#F4511E]" />
                <h3 className="font-bold text-[#17182B]">Audience Fit</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#626782]">Primary Age Demo</span>
                  <span className="font-semibold text-[#17182B]">25-34 (42%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#626782]">Top Geo</span>
                  <span className="font-semibold text-[#17182B]">North America</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#626782]">Interests</span>
                  <span className="font-semibold text-[#17182B]">Cloud, AI, SaaS</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E8F0] shadow-sm space-y-4">
              <h3 className="font-bold text-[#17182B]">Ask CRAB</h3>
              <p className="text-xs text-[#626782]">Get specific insights based on your campaign history.</p>
              
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-xl bg-[#F5F6FA] hover:bg-[#E7E8F0] transition flex items-center justify-between text-xs font-medium text-[#17182B]">
                  <span>Which creator generated the most leads?</span>
                  <ChevronRight className="w-4 h-4 text-[#8B90A5]" />
                </button>
                <button className="w-full text-left p-3 rounded-xl bg-[#F5F6FA] hover:bg-[#E7E8F0] transition flex items-center justify-between text-xs font-medium text-[#17182B]">
                  <span>What is a good CPM for AI tools?</span>
                  <ChevronRight className="w-4 h-4 text-[#8B90A5]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
