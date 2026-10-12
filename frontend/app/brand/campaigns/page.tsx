'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/layout/AppShell';
import { PlaceCard } from '../../../components/ui/place-card';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Layers,
  Plus,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function BrandCampaignsListPage() {
  const { user, token } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadCampaigns = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{ data: any[] }>('/api/brands/me/campaigns', {}, token);
        if (mounted && res?.data) {
          setCampaigns(res.data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load brand campaigns.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, [token]);

  const totalBudget = campaigns.reduce((acc, c) => acc + (Number(c.budgetMax) || 0), 0);

  return (
    <AppShell
      title="Brand Campaigns"
      subtitle="Manage your active creator marketing campaigns, track deliverables, and review AI insights."
      actions={
        <Link
          href="/brand/campaigns/new"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      }
    >
      {/* Campaign Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8B90A5]">
            <span className="text-xs font-medium">Total Brand Campaigns</span>
            <Layers className="w-4 h-4 text-[#F4511E]" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">{campaigns.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Active in database</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8B90A5]">
            <span className="text-xs font-medium">Audience Reach Target</span>
            <Users className="w-4 h-4 text-[#8580E8]" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">
            {campaigns.reduce((acc, c) => acc + (c.requiredReach || 0), 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-[#626782]">Target qualified developer impressions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8B90A5]">
            <span className="text-xs font-medium">Allocated Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">
            ₹{totalBudget.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#626782]">Escrow protected</p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#17182B]">Active & Draft Campaigns</h2>
          <span className="text-xs text-[#8B90A5]">Showing {campaigns.length} campaigns</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#8B90A5] text-sm flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#F4511E]" />
            <span>Loading campaigns from database...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#E7E8F0] rounded-2xl bg-white p-8 space-y-3">
            <Layers className="w-10 h-10 text-[#8B90A5] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#17182B]">No Campaigns Created Yet</h3>
            <p className="text-xs text-[#626782] max-w-sm mx-auto">
              Launch your first campaign to discover aligned creators and match with AI.
            </p>
            <Link
              href="/brand/campaigns/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F4511E] text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((cmp) => {
              const niches = cmp.creatorNiche
                ? cmp.creatorNiche.split(',').map((s: string) => s.trim())
                : cmp.aiProfile?.inferredNiches || ['Technology', 'AI Tools'];
              const dateRange =
                typeof cmp.timeline === 'object' && cmp.timeline?.start && cmp.timeline?.end
                  ? `${cmp.timeline.start} - ${cmp.timeline.end}`
                  : 'Active';

              return (
                <PlaceCard
                  key={cmp.id}
                  images={[
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1531297172867-4f50fccbd236?q=80&w=2070&auto=format&fit=crop",
                  ]}
                  tags={niches}
                  rating={4.9}
                  title={cmp.title}
                  dateRange={dateRange}
                  hostType={cmp.brand?.name || 'Amazon Web Services'}
                  isTopRated={true}
                  description={cmp.objective || cmp.description}
                  pricePerNight={Number(cmp.budgetMax) || 50000}
                  buttonText="Open Workspace"
                  onApply={() => (window.location.href = `/brand/campaigns/${cmp.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
