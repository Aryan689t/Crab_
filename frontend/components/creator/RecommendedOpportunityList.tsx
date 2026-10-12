'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AwsLogo, NotionLogo, GitHubLogo } from './BrandIcons';

export interface OpportunityItem {
  id: string;
  brand: string;
  title: string;
  category: string;
  platforms: string;
  matchScore: number;
  logoType: 'aws' | 'notion' | 'github';
  href?: string;
}

const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp-1',
    brand: 'AWS',
    title: 'AWS Developer Cloud Campaign',
    category: 'Developer Tools',
    platforms: 'YouTube',
    matchScore: 94,
    logoType: 'aws',
    href: '/creator/opportunities',
  },
  {
    id: 'opp-2',
    brand: 'Notion',
    title: 'Notion for Creators',
    category: 'Productivity',
    platforms: 'YouTube, Instagram',
    matchScore: 89,
    logoType: 'notion',
    href: '/creator/opportunities',
  },
  {
    id: 'opp-3',
    brand: 'GitHub',
    title: 'GitHub Copilot Series',
    category: 'AI Tools',
    platforms: 'YouTube',
    matchScore: 86,
    logoType: 'github',
    href: '/creator/opportunities',
  },
];

export function RecommendedOpportunityList({
  opportunities = DEFAULT_OPPORTUNITIES,
}: {
  opportunities?: OpportunityItem[];
}) {
  const renderLogo = (type: OpportunityItem['logoType']) => {
    switch (type) {
      case 'aws':
        return <AwsLogo className="w-8 h-8 rounded-lg shrink-0" />;
      case 'notion':
        return <NotionLogo className="w-8 h-8 rounded-lg shrink-0" />;
      case 'github':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center p-1.5 shrink-0">
            <GitHubLogo className="w-full h-full" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-2.5">
      {opportunities.map((opp) => (
        <Link
          key={opp.id}
          href={opp.href || '/creator/opportunities'}
          className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E1DA] hover:border-[#FF6B00]/40 hover:bg-[#FDFBF7] transition group shadow-2xs"
        >
          {/* Left Brand + Details */}
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {renderLogo(opp.logoType)}
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
