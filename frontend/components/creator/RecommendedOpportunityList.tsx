'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { AwsLogo, NotionLogo, GitHubLogo } from './BrandIcons';

export interface OpportunityItem {
  id: string;
  brand: string;
  title: string;
  category: string;
  platforms: string;
  matchScore: number;
  logoType?: string;
  brandLogo?: string | null;
  href?: string;
}

export function RecommendedOpportunityList({
  opportunities = [],
  isLoading = false,
}: {
  opportunities?: OpportunityItem[];
  isLoading?: boolean;
}) {
  const renderLogo = (opp: OpportunityItem) => {
    if (opp.brandLogo) {
      return (
        <img
          src={opp.brandLogo}
          alt={opp.brand}
          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#E7E1DA]"
        />
      );
    }

    const type = (opp.logoType || opp.brand.toLowerCase()) as string;
    if (type.includes('aws')) {
      return <AwsLogo className="w-8 h-8 rounded-lg shrink-0" />;
    }
    if (type.includes('notion')) {
      return <NotionLogo className="w-8 h-8 rounded-lg shrink-0" />;
    }
    if (type.includes('git')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center p-1.5 shrink-0">
          <GitHubLogo className="w-full h-full" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] font-bold text-xs flex items-center justify-center shrink-0 border border-[#FF6B00]/20">
        {opp.brand.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-[#F8F6F2] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#F8F6F2]/60 border border-dashed border-[#E7E1DA] text-center space-y-1.5">
        <div className="flex justify-center">
          <Sparkles className="w-5 h-5 text-[#FF6B00]" />
        </div>
        <div className="text-xs font-semibold text-[#171717]">No opportunities yet</div>
        <p className="text-[11px] text-[#737373] leading-relaxed">
          Publish your first pieces of content and complete your creator profile so CRAB can assess your content, understand your niche, and identify relevant brand opportunities. We&apos;ll show matches when suitable campaigns and sufficient creator data are available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {opportunities.map((opp) => (
        <Link
          key={opp.id}
          href={opp.href || `/creator/opportunities?campaign=${opp.id}`}
          className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E1DA] hover:border-[#FF6B00]/40 hover:bg-[#FDFBF7] transition group shadow-2xs"
        >
          {/* Left Brand + Details */}
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {renderLogo(opp)}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#171717] group-hover:text-[#FF6B00] transition truncate">
                {opp.title}
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                {opp.category} • {opp.platforms}
              </div>
            </div>
          </div>

          {/* Right Match Pill + Chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              {opp.matchScore}% match
            </span>
            <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      ))}
    </div>
  );
}
