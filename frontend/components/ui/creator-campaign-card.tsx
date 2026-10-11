import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, IndianRupee, Clock, Target, CheckCircle2, Tag } from 'lucide-react';
import { CampaignItem } from '../../mock/data';

interface CreatorCampaignCardProps {
  campaign: CampaignItem;
  applied: boolean;
  onApply: () => void;
  creatorNiches?: string[];
}

export const CreatorCampaignCard = ({
  campaign,
  applied,
  onApply,
  creatorNiches = [],
}: CreatorCampaignCardProps) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Derive some stats
  const matchScore = campaign.matchScore ?? 85;
  const deadline = campaign.deadline ?? "Closes in 5 days";
  const isUrgent = deadline.includes('3') || deadline.includes('2') || deadline.includes('1') || deadline.includes('Closes in 5');

  // Helper for initials
  const initials = campaign.brandName.substring(0, 2).toUpperCase();

  const coverMap: Record<string, string> = {
    'cmp_aws_01': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    'cmp_veloce_02': 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop',
    'cmp_supadb_03': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
    'cmp_vercel_04': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=600&auto=format&fit=crop',
    'cmp_gymshark_05': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    'cmp_notion_06': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fc36b?q=80&w=600&auto=format&fit=crop',
    'cmp_framer_07': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
    'cmp_sony_08': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
    'cmp_hellofresh_09': 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=600&auto=format&fit=crop',
  };
  const defaultCover = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop';
  const initialCoverImage = coverMap[campaign.id] || defaultCover;

  const gradientIndex = campaign.brandName.charCodeAt(0) % 3;
  const gradients = [
    'from-brand-crimson/20 via-brand-peach/40 to-surface-tint',
    'from-brand-orange/20 via-brand-peach/30 to-brand-crimson/10',
    'from-brand-peach/50 via-surface-tint to-brand-orange/10',
  ];
  const bgGradient = gradients[gradientIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 12px 24px -8px rgba(23, 24, 43, 0.08)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex flex-col sm:flex-row bg-surface-card rounded-[16px] border border-border-warm hover:border-border-hover shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-crimson focus-within:ring-offset-2 outline-none p-3 sm:p-5 gap-5 cursor-pointer transition-colors"
      tabIndex={0}
      onClick={() => { if (!applied) onApply(); }}
    >
      {/* Left: Thumbnail Image */}
      <div className="relative shrink-0 w-full sm:w-[220px] aspect-[16/10] rounded-[10px] overflow-hidden bg-surface-tint self-start">
        <motion.div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-105">
          {coverError ? (
            <div className={`w-full h-full bg-gradient-to-br ${bgGradient} opacity-80`} />
          ) : (
            <img
              src={initialCoverImage}
              alt={`${campaign.title} cover`}
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
          )}
        </motion.div>

        {/* Soft Noise Overlay */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Right/Center: Campaign Information */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* 1. Brand name and identity & Bookmark */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-surface-tint overflow-hidden shrink-0 border border-border-warm flex items-center justify-center">
              {!imageError && campaign.brandLogo ? (
                <img
                  src={campaign.brandLogo}
                  alt={`${campaign.brandName} logo`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-[9px] font-bold text-brand-crimson">{initials}</span>
              )}
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">
              {campaign.brandName}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            className={`p-2 rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
              bookmarked ? 'text-brand-orange bg-brand-peach/20 hover:bg-brand-peach/30' : 'text-text-muted hover:text-brand-crimson hover:bg-surface-tint'
            }`}
            aria-label="Bookmark campaign"
          >
            <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* 2. Full title */}
        <h3 className="text-[17px] font-semibold text-text-strong leading-tight mb-1.5 group-hover:text-brand-crimson transition-colors">
          {campaign.title}
        </h3>

        {/* 3. Short description */}
        <p className="text-[14px] font-normal text-text-muted line-clamp-2 leading-relaxed mb-3">
          Create engaging content highlighting the key features of this campaign. Focus on {campaign.niches.join(" and ")}.
        </p>

        {/* 4. Relevant niche tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {campaign.niches.slice(0, 3).map((niche) => (
            <span key={niche} className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-brand-peach/10 text-brand-orange text-[10px] font-bold border border-brand-peach/30">
              {niche}
            </span>
          ))}
        </div>

        {/* 6 & 7: Payout, Match Score, Deadline & Action */}
        <div className="mt-auto pt-3 border-t border-border-warm flex flex-wrap items-center justify-between gap-3">

          <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold text-text-strong">
            {/* Payout */}
            <div className="flex items-center">
              <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-brand-orange" />
              {campaign.budgetMin >= 1000 ? `${campaign.budgetMin / 1000}k` : campaign.budgetMin} - {campaign.budgetMax >= 1000 ? `${campaign.budgetMax / 1000}k` : campaign.budgetMax}
            </div>

            <div className="w-1 h-1 rounded-full bg-border-warm hidden sm:block" />

            {/* Match Score */}
            <div className="flex items-center text-brand-crimson bg-brand-peach/20 px-1.5 py-0.5 rounded">
              <Target className="w-3.5 h-3.5 mr-1" />
              {matchScore}% Match
            </div>

            <div className="w-1 h-1 rounded-full bg-border-warm hidden sm:block" />

            {/* Deadline */}
            <div className={`flex items-center ${isUrgent ? 'text-brand-crimson' : 'text-text-muted'}`}>
              <Clock className="w-3.5 h-3.5 mr-1" />
              {deadline}
            </div>
          </div>

          {/* Action */}
          <div className="shrink-0">
            {applied ? (
              <span className="text-[12px] font-bold text-text-muted flex items-center px-3 py-1.5 bg-surface-tint rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Applied
              </span>
            ) : (
              <span className="text-[12px] font-bold text-brand-crimson group-hover:text-brand-orange transition-colors flex items-center">
                View campaign <span className="ml-1 text-[14px]">→</span>
              </span>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};
