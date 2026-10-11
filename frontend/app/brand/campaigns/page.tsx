'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/layout/AppShell';
import { useMockStore } from '../../../mock/store';
import { PlaceCard } from '../../../components/ui/place-card';
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
} from 'lucide-react';

export default function BrandCampaignsListPage() {
  const { campaigns } = useMockStore();

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
            <span className="text-xs font-medium">Total Active Campaigns</span>
            <Layers className="w-4 h-4 text-[#F4511E]" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">{campaigns.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium">All running on schedule</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8B90A5]">
            <span className="text-xs font-medium">Creators in Pipeline</span>
            <Users className="w-4 h-4 text-[#8580E8]" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">
            {campaigns.reduce((acc, c) => acc + c.appliedCount + c.invitedCount, 0)}
          </div>
          <p className="text-[11px] text-[#626782]">Applications and active invitations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8B90A5]">
            <span className="text-xs font-medium">Allocated Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[#17182B]">
            ₹{campaigns.reduce((acc, c) => acc + c.budgetMax, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-[#626782]">Escrow protected</p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#17182B]">Active & Draft Campaigns</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((cmp) => {
            return (
              <PlaceCard
                key={cmp.id}
                images={[
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1531297172867-4f50fccbd236?q=80&w=2070&auto=format&fit=crop",
                ]}
                tags={cmp.niches}
                rating={4.9}
                title={cmp.title}
                dateRange={cmp.timeline || "Active"}
                hostType={cmp.brandName}
                isTopRated={true}
                description={cmp.objective}
                pricePerNight={cmp.budgetMax}
                buttonText="Open Workspace"
                onApply={() => window.location.href = `/brand/campaigns/${cmp.id}`}
              />
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
