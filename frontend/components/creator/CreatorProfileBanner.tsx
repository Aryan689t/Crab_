'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Sliders, Edit3 } from 'lucide-react';
import { YouTubeIcon, InstagramIcon, TikTokIcon, XTwitterIcon } from './BrandIcons';
import { StarRating } from '../ui/StarRating';

interface CreatorProfileBannerProps {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  niches?: string[];
  totalFollowers?: number | string;
  engagementRate?: number | string;
  isVerified?: boolean;
}

export function CreatorProfileBanner({
  displayName = 'Alex Chen',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  bio = 'Fullstack software engineer breaking down cloud, AI and developer tools.',
  niches = ['Technology', 'AI & Machine Learning', 'Software Engineering'],
  totalFollowers = '124.5K',
  engagementRate = '8.4%',
  isVerified = true,
}: CreatorProfileBannerProps) {
  // Format followers display
  const displayFollowers =
    typeof totalFollowers === 'number'
      ? `${(totalFollowers / 1000).toFixed(1)}K`
      : totalFollowers;

  const displayEngagement =
    typeof engagementRate === 'number'
      ? `${engagementRate}%`
      : engagementRate;

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      {/* Left Profile Info */}
      <div className="flex items-start gap-5">
        {/* Avatar with Online Dot */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#F4EFEA] border-2 border-white shadow-xs">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#171717]">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {/* Active Status Dot */}
          <span
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] ring-2 ring-white"
            title="Active on CRAB"
          />
        </div>

        {/* Name, Verification, Bio & Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
              {displayName}
            </h2>
            <StarRating rating={4.9} size="sm" />
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Creator</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#525252] max-w-2xl leading-relaxed">
            {bio}
          </p>

          {/* Niche Tags */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {niches.map((niche) => (
              <span
                key={niche}
                className="px-3 py-1 rounded-lg bg-[#F8F6F2] text-[#525252] text-xs font-medium border border-[#E7E1DA]"
              >
                {niche}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Stats, Social Icons & Actions */}
      <div className="flex flex-wrap sm:flex-nowrap items-center lg:items-end justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E7E1DA]">
        {/* Social Platforms & Metrics Group */}
        <div className="space-y-3">
          {/* Social Icons Row */}
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded bg-[#F8F6F2] hover:bg-neutral-100 transition border border-[#E7E1DA]/60 cursor-pointer" title="YouTube">
              <YouTubeIcon className="w-4 h-4" />
            </span>
            <span className="p-1 rounded bg-[#F8F6F2] hover:bg-neutral-100 transition border border-[#E7E1DA]/60 cursor-pointer" title="Instagram">
              <InstagramIcon className="w-4 h-4" />
            </span>
            <span className="p-1 rounded bg-[#F8F6F2] hover:bg-neutral-100 transition border border-[#E7E1DA]/60 cursor-pointer" title="TikTok">
              <TikTokIcon className="w-4 h-4 text-black" />
            </span>
            <span className="p-1 rounded bg-[#F8F6F2] hover:bg-neutral-100 transition border border-[#E7E1DA]/60 cursor-pointer" title="X">
              <XTwitterIcon className="w-4 h-4 text-black" />
            </span>
          </div>

          {/* Metrics Summary Pill Group */}
          <div className="flex items-center gap-5">
            <div>
              <div className="text-base sm:text-lg font-bold text-[#171717] leading-none">
                {displayFollowers}
              </div>
              <div className="text-[11px] text-[#737373] mt-1">
                Total Followers
              </div>
            </div>
            <div className="h-6 w-px bg-[#E7E1DA]" />
            <div>
              <div className="text-base sm:text-lg font-bold text-[#171717] leading-none">
                {displayEngagement}
              </div>
              <div className="text-[11px] text-[#737373] mt-1">
                Engagement Rate
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Action */}
        <Link
          href="/creator/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs font-semibold transition shadow-xs shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Link>
      </div>
    </section>
  );
}
