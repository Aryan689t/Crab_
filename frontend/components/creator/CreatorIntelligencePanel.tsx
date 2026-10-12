'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Lightbulb } from 'lucide-react';
import { RecommendedOpportunityList, OpportunityItem } from './RecommendedOpportunityList';

interface CreatorIntelligencePanelProps {
  insightTitle?: string;
  insightBody?: string;
  hasIntelligence?: boolean;
  opportunities?: OpportunityItem[];
  isLoading?: boolean;
}

export function CreatorIntelligencePanel({
  insightTitle,
  insightBody,
  hasIntelligence = false,
  opportunities = [],
  isLoading = false,
}: CreatorIntelligencePanelProps) {
  const displayTitle = insightTitle || (hasIntelligence 
    ? 'Creator positioning ready' 
    : 'Insufficient content history for intelligence');

  const displayBody = insightBody || (hasIntelligence
    ? 'Review your brand readiness and profile strengths.'
    : 'Connect your active social channels so Gemini AI can evaluate your content themes, audience engagement patterns, and brand alignment.');

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              CRAB intelligence
            </h3>
          </div>
          <Link
            href="/creator/intelligence"
            className="text-xs text-[#FF6B00] font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {/* AI Insight Callout Card */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 mt-1 ${
          hasIntelligence 
            ? 'bg-[#FFF5ED] border-[#FFE2D1]' 
            : 'bg-[#F8F6F2] border-[#E7E1DA]'
        }`}>
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            hasIntelligence 
              ? 'bg-[#FF6B00]/10 text-[#FF6B00]' 
              : 'bg-neutral-200 text-neutral-600'
          }`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#171717] leading-tight">
              {displayTitle}
            </div>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              {displayBody}
            </p>
          </div>
        </div>

        {/* Recommended Opportunities Header */}
        <div className="mt-5 mb-2.5">
          <div className="text-[11px] font-semibold text-[#737373] tracking-wide uppercase">
            Recommended opportunities
          </div>
        </div>

        {/* Opportunities List */}
        <RecommendedOpportunityList opportunities={opportunities} isLoading={isLoading} />
      </div>
    </section>
  );
}
