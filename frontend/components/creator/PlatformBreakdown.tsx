'use client';

import React from 'react';
import { YouTubeIcon, InstagramIcon, TikTokIcon, XTwitterIcon } from './BrandIcons';

interface PlatformStat {
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'X';
  name: string;
  count: string;
  growth: string;
}

interface PlatformBreakdownProps {
  stats?: PlatformStat[];
}

const DEFAULT_PLATFORM_STATS: PlatformStat[] = [
  { platform: 'YOUTUBE', name: 'YouTube', count: '72.1K', growth: '+11.3%' },
  { platform: 'INSTAGRAM', name: 'Instagram', count: '48.6K', growth: '+14.2%' },
  { platform: 'TIKTOK', name: 'TikTok', count: '28.4K', growth: '+18.1%' },
  { platform: 'X', name: 'X / Twitter', count: '12.3K', growth: '+6.4%' },
];

export function PlatformBreakdown({ stats = DEFAULT_PLATFORM_STATS }: PlatformBreakdownProps) {
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
            <div className="text-[10px] text-emerald-600 font-semibold leading-tight">
              {item.growth}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
