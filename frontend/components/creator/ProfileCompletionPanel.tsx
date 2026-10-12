'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, FileText } from 'lucide-react';
import { InstagramIcon } from './BrandIcons';

interface ProfileCompletionPanelProps {
  completionPercentage?: number;
  onConnectSocial?: () => void;
}

export function ProfileCompletionPanel({
  completionPercentage = 80,
  onConnectSocial,
}: ProfileCompletionPanelProps) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
      {/* Top Header & Progress Stat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFF2E8] text-[#FF6B00]">
              <CheckSquare className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              Next steps
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373]">Profile completion</span>
            <span className="font-mono font-bold text-[#171717]">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#F2ECE5] overflow-hidden">
          <div
            className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Steps List */}
      <div className="space-y-3 pt-1">
        {/* Step 1: Connect Social */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white border border-[#E7E1DA] shrink-0">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#171717] truncate">
                Connect your remaining social account
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                Improve your visibility and get better matches
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onConnectSocial}
            className="px-3.5 py-1.5 rounded-xl border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs font-semibold transition shrink-0 cursor-pointer shadow-2xs"
          >
            Connect
          </button>
        </div>

        {/* Step 2: Add Niche & Interests */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white border border-[#E7E1DA] text-[#FF6B00] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#171717] truncate">
                Add niche & interests
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                Help brands find you for relevant campaigns
              </div>
            </div>
          </div>
          <Link
            href="/creator/profile"
            className="px-3.5 py-1.5 rounded-xl border border-[#E7E1DA] bg-white text-[#171717] hover:bg-[#F4EFEA] text-xs font-semibold transition shrink-0 shadow-2xs"
          >
            Add details
          </Link>
        </div>
      </div>
    </section>
  );
}
