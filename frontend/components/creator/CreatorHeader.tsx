'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface CreatorHeaderProps {
  displayName?: string;
  avatarUrl?: string;
  onNotificationsClick?: () => void;
}

export function CreatorHeader({
  onNotificationsClick,
}: CreatorHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      {/* Editorial Title */}
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal tracking-tight text-[#171717] leading-[1.2]">
        Your <span className="text-[#FF6B00]">creative work,</span> in one place.
      </h1>

      {/* Right Top Notification Button */}
      <div className="flex items-center self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          aria-label="Notifications"
          onClick={onNotificationsClick}
          className="relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full hover:bg-white border border-[#E7E1DA] hover:border-[#FF6B00]/40 bg-white/95 text-[#171717] transition-all shadow-xs hover:shadow-sm cursor-pointer group"
        >
          <span className="relative flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#171717] group-hover:text-[#FF6B00] transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF6B00] ring-2 ring-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-[#171717] group-hover:text-[#FF6B00] transition-colors">
            Notifications
          </span>
        </button>
      </div>
    </header>
  );
}
