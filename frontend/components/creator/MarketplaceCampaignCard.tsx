'use client';

import React, { useState } from 'react';
import { Bookmark, Clock, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { YouTubeIcon, InstagramIcon } from './BrandIcons';
import { StarRating } from '../ui/StarRating';

export interface CampaignData {
  id: string;
  title: string;
  brandName: string;
  brandLogo?: string;
  brandRating?: number;
  brandReviewCount?: number;
  category?: string;
  niches?: string[];
  budgetMin: number;
  budgetMax: number;
  currency?: string;
  platforms?: string[];
  timeline?: string;
  deadline?: string;
  matchScore?: number;
  aiBriefSummary?: string;
  objective?: string;
}

interface MarketplaceCampaignCardProps {
  campaign: CampaignData;
  applied?: boolean;
  onSelect: (campaign: CampaignData) => void;
  onRemove?: (campaignId: string) => Promise<void> | void;
}

const coverMap: Record<string, string> = {
  cmp_aws_01: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  cmp_veloce_02: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop',
  cmp_supadb_03: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
  cmp_vercel_04: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=600&auto=format&fit=crop',
  cmp_gymshark_05: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  cmp_notion_06: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  cmp_framer_07: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
  cmp_sony_08: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
  cmp_hellofresh_09: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=600&auto=format&fit=crop',
};

const defaultCover =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop';

export function MarketplaceCampaignCard({
  campaign,
  applied = false,
  onSelect,
  onRemove,
}: MarketplaceCampaignCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const coverUrl =
    (campaign as any).coverImage ||
    (campaign as any).imageUrl ||
    coverMap[campaign.id] ||
    defaultCover;
  const matchScore = campaign.matchScore ?? 90;
  const deadline = campaign.deadline || campaign.timeline || 'Closes in 5 days';
  const niches = campaign.niches || ['Technology', 'Creator Economy'];

  const formatBudget = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    return `₹${val}`;
  };

  return (
    <div
      onClick={() => onSelect(campaign)}
      className="group relative bg-white rounded-2xl border border-[#E7E1DA] hover:border-[#FF6B00]/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Remove Event Confirmation Overlay */}
      {confirmRemoveOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xl text-center space-y-3 max-w-xs w-full">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Remove Event?</h4>
            <p className="text-xs text-neutral-600">
              Are you sure you want to remove the event?
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmRemoveOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                Nope
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={async (e) => {
                  e.stopPropagation();
                  setIsRemoving(true);
                  try {
                    if (onRemove) {
                      await onRemove(campaign.id);
                    }
                  } finally {
                    setIsRemoving(false);
                    setConfirmRemoveOpen(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isRemoving ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Media & Tags */}
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFEA]">
          <img
            src={imgError ? defaultCover : coverUrl}
            alt={campaign.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Action Buttons: Remove & Bookmark */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {/* Remove Event Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmRemoveOpen(true);
              }}
              title="Remove event"
              className="p-2 rounded-xl backdrop-blur-md transition shadow-xs cursor-pointer bg-white/85 text-neutral-600 hover:bg-red-50 hover:text-red-600 border border-neutral-200/50"
              aria-label="Remove event"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBookmarked(!bookmarked);
              }}
              className={`p-2 rounded-xl backdrop-blur-md transition shadow-xs cursor-pointer border border-neutral-200/50 ${
                bookmarked
                  ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                  : 'bg-white/85 text-[#171717] hover:bg-white hover:text-[#FF6B00]'
              }`}
              aria-label="Bookmark campaign"
            >
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-emerald-700 border border-emerald-200/60 shadow-xs flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{matchScore}% match</span>
            </div>
          )}

          {/* Category Chip */}
          {campaign.category && (
            <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
              {campaign.category}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Brand Row */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#F8F6F2] border border-[#E7E1DA] overflow-hidden flex items-center justify-center shrink-0">
              {campaign.brandLogo && !imgError ? (
                <img
                  src={campaign.brandLogo}
                  alt={campaign.brandName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-[10px] font-bold text-[#FF6B00]">
                  {campaign.brandName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-[#737373] tracking-wide truncate">
              {campaign.brandName}
            </span>
            <StarRating rating={campaign.brandRating || 4.8} size="xs" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-[#171717] leading-snug group-hover:text-[#FF6B00] transition line-clamp-2">
            {campaign.title}
          </h3>

          {/* Short clamped brief description */}
          <p className="text-xs text-[#525252] line-clamp-2 leading-relaxed">
            {campaign.aiBriefSummary ||
              campaign.objective ||
              `Looking for aligned creators to produce engaging review content for ${campaign.brandName}.`}
          </p>

          {/* Niche Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {niches.slice(0, 2).map((niche) => (
              <span
                key={niche}
                className="px-2 py-0.5 rounded-md bg-[#F8F6F2] text-[#525252] text-[11px] font-medium border border-[#E7E1DA]"
              >
                {niche}
              </span>
            ))}
            {niches.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#F8F6F2] text-[#737373] text-[10px] font-medium border border-[#E7E1DA]">
                +{niches.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Compensation & Apply CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-[#E7E1DA]/60 flex items-center justify-between gap-3 bg-white">
        <div>
          <div className="text-[11px] text-[#737373]">Compensation</div>
          <div className="text-sm font-bold text-[#171717]">
            {formatBudget(campaign.budgetMin)} - {formatBudget(campaign.budgetMax)}
          </div>
        </div>

        {applied ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Applied</span>
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#171717] group-hover:bg-[#FF6B00] text-white text-xs font-semibold transition-colors duration-150 shadow-xs"
          >
            <span>View & Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
