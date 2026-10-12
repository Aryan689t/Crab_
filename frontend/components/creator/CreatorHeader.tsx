'use client';

import React from 'react';
import Image from 'next/image';
import { Bell } from 'lucide-react';

interface CreatorHeaderProps {
  displayName?: string;
  avatarUrl?: string;
}

export function CreatorHeader({
  displayName = 'Alex Chen',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
}: CreatorHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
      {/* Left Editorial Heading */}
      <div className="space-y-1.5 max-w-2xl">
        <div className="text-[11px] font-mono font-semibold tracking-wider text-[#737373] uppercase">
          Creator Studio
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal tracking-tight text-[#171717] leading-[1.2]">
          Your <span className="text-[#FF6B00]">creative work,</span> in one place.
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] pt-0.5 leading-relaxed">
          Track your audience, find aligned partnerships, and keep every opportunity moving.
        </p>
      </div>

      {/* Right Top Status & Account Pill */}
      <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2.5 rounded-full hover:bg-white/80 border border-[#E7E1DA] bg-white text-[#171717] transition shadow-xs cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[#171717]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B00]" />
        </button>

        {/* User Account Capsule */}
        <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white/80 border border-[#E7E1DA] rounded-full shadow-xs">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#F4EFEA] border border-[#E7E1DA] shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#171717]">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-[#171717] leading-tight">
              {displayName}
            </div>
            <div className="text-[10px] text-[#737373] leading-tight">
              Creator Account
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
