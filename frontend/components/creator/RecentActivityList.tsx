'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Megaphone, ChevronRight } from 'lucide-react';
import { NotionLogo, AwsLogo } from './BrandIcons';

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  iconType: 'notion' | 'campaign' | 'aws';
  href?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Application viewed by Notion',
    time: '2 hours ago',
    iconType: 'notion',
    href: '/creator/applications',
  },
  {
    id: 'act-2',
    title: 'New campaign matches available',
    time: '5 hours ago',
    iconType: 'campaign',
    href: '/creator/opportunities',
  },
  {
    id: 'act-3',
    title: 'AWS Developer Campaign added to your matches',
    time: '1 day ago',
    iconType: 'aws',
    href: '/creator/opportunities',
  },
];

export function RecentActivityList({
  activities = DEFAULT_ACTIVITIES,
}: {
  activities?: ActivityItem[];
}) {
  const renderIcon = (type: ActivityItem['iconType']) => {
    switch (type) {
      case 'notion':
        return <NotionLogo className="w-8 h-8 rounded-lg shrink-0" />;
      case 'campaign':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FF6B00] border border-[#FFE2D1] flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
        );
      case 'aws':
        return <AwsLogo className="w-8 h-8 rounded-lg shrink-0" />;
    }
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFF2E8] text-[#FF6B00]">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              Recent activity
            </h3>
          </div>
          <Link
            href="/creator/applications"
            className="text-xs text-[#FF6B00] font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {/* Activity Feed Items */}
        <div className="space-y-2.5 mt-1">
          {activities.map((item) => (
            <Link
              key={item.id}
              href={item.href || '/creator/dashboard'}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E1DA] hover:border-[#FF6B00]/40 hover:bg-[#FDFBF7] transition group shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {renderIcon(item.iconType)}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#171717] group-hover:text-[#FF6B00] transition truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#737373]">
                    {item.time}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
