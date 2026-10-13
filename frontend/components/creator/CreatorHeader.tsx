'use client';

import React from 'react';
import { NotificationBell } from '../notifications/NotificationBell';

interface CreatorHeaderProps {
  displayName?: string;
  avatarUrl?: string;
}

export function CreatorHeader({}: CreatorHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      {/* Editorial Title */}
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal tracking-tight text-[#171717] leading-[1.2]">
        Your <span className="text-[#FF6B00]">creative work,</span> in one place.
      </h1>

      {/* Right Top Notification Button */}
      <div className="flex items-center self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
        <NotificationBell />
      </div>
    </header>
  );
}
