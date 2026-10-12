'use client';

import React from 'react';
import { YouTubeIcon, InstagramIcon, TikTokIcon, XTwitterIcon } from './BrandIcons';

export interface PlatformStat {
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'X';
  name: string;
  count: string;
  growth: string;
  handle?: string;
  isConnected?: boolean;
}

export interface PlatformBreakdownProps {
  stats?: PlatformStat[];
}

export function PlatformBreakdown({ stats = [] }: PlatformBreakdownProps) {
  const getIcon = (platform: PlatformStat['platform']) => {
    switch (platform) {
      case 'YOUTUBE':
        return <YouTubeIcon className="w-4 h-4" />;
      case 'INSTAGRAM':
        return <InstagramIcon className="w-4 h-4" />;
      case 'TIKTOK':
        return <TikTokIcon className="w-4 h-4 text-black" />;
      case 'X':
        return <XTwitterIcon className="w-4 h-4 text-black" />;
    }
  };

  if (!stats || stats.length === 0) {
    return (
      <div className="pt-4 border-t border-[#E7E1DA] text-center py-3 text-xs text-[#737373] bg-[#F8F6F2]/40 rounded-xl">
        No platform accounts connected yet. Connect your YouTube channel or Instagram profile to display verified audience breakdowns.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E7E1DA]">
      {stats.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA]/60 hover:bg-[#F8F6F2] transition"
        >
          <div className="p-1 rounded-lg bg-white border border-[#E7E1DA]/80 shadow-2xs shrink-0">
            {getIcon(item.platform)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#171717] leading-tight truncate">
              {item.count}
            </div>
            <div className="text-[10px] text-neutral-600 truncate">
              {item.handle || item.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
