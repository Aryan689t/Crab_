'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Megaphone, ChevronRight, FileText, Handshake, Link as LinkIcon } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  iconType?: string;
  href?: string;
}

export function RecentActivityList({
  activities = [],
  isLoading = false,
}: {
  activities?: ActivityItem[];
  isLoading?: boolean;
}) {
  const renderIcon = (type?: string) => {
    switch (type) {
      case 'application':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'collaboration':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Handshake className="w-4 h-4" />
          </div>
        );
      case 'social':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
            <LinkIcon className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FF6B00] border border-[#FFE2D1] flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
        );
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
            href="/creator/opportunities"
            className="text-xs text-[#FF6B00] font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {/* Activity Feed Items or Empty State */}
        {isLoading ? (
          <div className="space-y-2.5 mt-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-[#F8F6F2] animate-pulse" />
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F8F6F2]/60 border border-dashed border-[#E7E1DA] text-center space-y-1 mt-1">
            <p className="text-xs text-[#737373] leading-relaxed">
              Your activity will appear here as you connect your accounts, explore campaigns, and interact with brands.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
