'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Building2,
  Sparkles,
  Layers,
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export default function BrandDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'BRAND') {
        router.push('/creator/dashboard');
        return;
      }

      const loadData = async () => {
        setLoading(true);
        try {
          if (token) {
            const res = await fetchApi<any>('/api/brands/me', {}, token).catch(() => null);
            if (!mounted) return;
            if (res?.data) setBrandProfile(res.data);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, token, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          Loading Brand Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Brand Profile Header Card */}
        <section className="bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-[0_1px_3px_0_rgba(23,24,43,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F4511E] to-[#8580E8] p-0.5 shadow-sm flex-shrink-0">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center font-bold text-xl text-[#17182B]">
                {brandProfile?.name?.slice(0, 2).toUpperCase() || 'BR'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#17182B]">
                  {brandProfile?.name || user?.displayName || 'Brand Name'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-[#F4511E] flex items-center space-x-1">
                  <Building2 className="w-3 h-3" />
                  <span>{brandProfile?.category || 'Technology'}</span>
                </span>
              </div>
              <p className="text-xs text-[#626782] max-w-xl">
                {brandProfile?.description || 'Developer tools, cloud infrastructure, and AI engineering solutions.'}
              </p>
              <div className="flex items-center space-x-4 pt-1 text-xs text-[#8B90A5]">
                <span className="flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{brandProfile?.website || 'https://brand.example.com'}</span>
                </span>
                <span>•</span>
                <span>Target Markets: {(brandProfile?.targetMarkets || ['India', 'Global']).join(', ')}</span>
              </div>
            </div>
          </div>

          <button className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition self-start md:self-center">
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </section>

        {/* Brand Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B90A5]">
              <span className="text-xs font-medium">Active Campaigns</span>
              <Layers className="w-4 h-4 text-[#F4511E]" />
            </div>
            <div className="text-2xl font-bold text-[#17182B]">2</div>
            <p className="text-[11px] text-[#626782]">Developer Launch & Cloud Sprint</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B90A5]">
              <span className="text-xs font-medium">Matched Creators</span>
              <Users className="w-4 h-4 text-[#8580E8]" />
            </div>
            <div className="text-2xl font-bold text-[#17182B]">18</div>
            <p className="text-[11px] text-emerald-600 font-medium">Over 85% contextual match</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B90A5]">
              <span className="text-xs font-medium">Active Negotiations</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-[#17182B]">4</div>
            <p className="text-[11px] text-[#626782]">Offers & counteroffers pending</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8B90A5]">
              <span className="text-xs font-medium">Total Campaign Budget</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-[#17182B]">₹1,50,000</div>
            <p className="text-[11px] text-[#626782]">Razorpay Escrow Integration</p>
          </div>
        </section>

        {/* Discovery & AI Brief Normalization */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E7E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E8F0]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#F4511E]" />
                <h2 className="font-bold text-base text-[#17182B]">CRAB AI Campaign Intelligence</h2>
              </div>
              <span className="text-xs text-[#8B90A5]">Structured Brief Interpretation</span>
            </div>

            <div className="space-y-3 text-xs text-[#626782] leading-relaxed">
              <p>
                <strong className="text-[#17182B]">Explainable Matching:</strong> When creating a campaign, Gemini extracts normalized objectives, target audience requirements, and content style preferences into pgvector embeddings.
              </p>
              <p>
                <strong className="text-[#17182B]">Match Factor Breakdown:</strong> Creators are evaluated across semantic similarity (35%), audience alignment (25%), performance metrics (20%), platform fit (10%), and brand compatibility (10%).
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#8B90A5]">
                Phase 7 & 8: Campaign creation wizard & discovery engine
              </span>
              <button className="text-xs font-semibold text-[#F4511E] hover:underline flex items-center space-x-1">
                <span>Explore Creator Discovery</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-[#FFF5F2] rounded-2xl p-6 border border-[#F4511E]/20 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F4511E] text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#17182B]">Creator Discovery</h3>
              <p className="text-xs text-[#626782] leading-relaxed">
                Search high-signal creators with transparent fit explanations and historical deliverable reliability.
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-[#E7E8F0] text-xs text-[#17182B] space-y-1">
              <span className="font-semibold block">Brand Architecture Status</span>
              <span className="text-[#8B90A5]">Role verified. Ready for Phase 7 campaign builder.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
