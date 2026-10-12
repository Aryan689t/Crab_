'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
  DollarSign,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  Tag,
  Building,
  Target,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { YouTubeIcon, InstagramIcon, TikTokIcon, XTwitterIcon } from './BrandIcons';
import { StarRating } from '../ui/StarRating';

export interface DrawerCampaignData {
  id: string;
  title: string;
  brandName: string;
  brandLogo?: string;
  brandCategory?: string;
  brandDescription?: string;
  brandWebsite?: string;
  category?: string;
  niches?: string[];
  budgetMin: number;
  budgetMax: number;
  currency?: string;
  platforms?: string[];
  timeline?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  matchScore?: number;
  objective?: string;
  description?: string;
  aiBriefSummary?: string;
  deliverables?: string[];
  requiredReach?: number;
  contentStyle?: string;
  contentType?: string;
  exclusivity?: string;
  usageRights?: string;
  mandatoryMentions?: string[];
  coverImage?: string;
  imageUrl?: string;
  paymentTerms?: string;
  compensationModel?: string;
}

interface CampaignDetailsDrawerProps {
  campaign: DrawerCampaignData | null;
  isOpen: boolean;
  onClose: () => void;
  applied?: boolean;
  onApplySuccess?: (campaignId: string) => void;
  token?: string | null;
}

const coverMap: Record<string, string> = {
  cmp_aws_01: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
  cmp_veloce_02: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop',
  cmp_supadb_03: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
  cmp_vercel_04: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop',
  cmp_gymshark_05: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  cmp_notion_06: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  cmp_framer_07: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
  cmp_sony_08: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  cmp_hellofresh_09: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800&auto=format&fit=crop',
};

const categoryDefaultCovers: Record<string, string> = {
  Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  'Developer Tools': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
  'AI & Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop',
  Productivity: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&auto=format&fit=crop',
  Design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
};

const genericDefaultCover =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop';

export function CampaignDetailsDrawer({
  campaign,
  isOpen,
  onClose,
  applied = false,
  onApplySuccess,
  token,
}: CampaignDetailsDrawerProps) {
  const [pitchNote, setPitchNote] = useState('');
  const [proposedRate, setProposedRate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasAppliedLocal, setHasAppliedLocal] = useState(applied);
  const [imgError, setImgError] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync applied state
  useEffect(() => {
    setHasAppliedLocal(applied);
  }, [applied]);

  // Load preserved draft from localStorage when campaign changes
  useEffect(() => {
    if (campaign?.id) {
      const draftKey = `crab_pitch_draft_${campaign.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      setPitchNote(savedDraft || '');
      setProposedRate(campaign.budgetMin ? String(campaign.budgetMin) : '');
      setErrorMessage(null);
      setSuccessMessage(null);
      setImgError(false);
    }
  }, [campaign?.id, campaign?.budgetMin]);

  // Save draft to localStorage on pitch change
  const handlePitchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPitchNote(val);
    if (campaign?.id) {
      localStorage.setItem(`crab_pitch_draft_${campaign.id}`, val);
    }
  };

  // Prevent background page scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !campaign) {
    return null;
  }

  // Cover image resolution
  const heroPoster =
    campaign.coverImage ||
    campaign.imageUrl ||
    coverMap[campaign.id] ||
    categoryDefaultCovers[campaign.category || ''] ||
    genericDefaultCover;

  const platforms = campaign.platforms || ['YOUTUBE'];
  const niches = campaign.niches || ['Technology', 'AI Tools'];
  const deliverables = campaign.deliverables && campaign.deliverables.length > 0
    ? campaign.deliverables
    : [
        '1 Dedicated Video Breakdown with practical demonstration',
        'Pinned comment with custom tracking link',
        'Social story / community post link amplification',
      ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAppliedLocal || isSubmitting) return;

    if (!pitchNote.trim()) {
      setErrorMessage('Please include a pitch note explaining your audience fit and creative concept.');
      return;
    }

    if (pitchNote.trim().length < 20) {
      setErrorMessage('Your pitch note should be at least 20 characters so the brand understands your idea.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (token) {
        const res = await fetch(`/api/campaigns/${campaign.id}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pitch: pitchNote.trim(),
            proposedRate: proposedRate ? Number(proposedRate) : campaign.budgetMin,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 409) {
            setHasAppliedLocal(true);
            setSuccessMessage('You have already applied to this campaign.');
            if (onApplySuccess) onApplySuccess(campaign.id);
            return;
          }
          throw new Error(data.message || data.error || 'Failed to submit application');
        }
      }

      // Success
      setHasAppliedLocal(true);
      setSuccessMessage('Application submitted successfully! The brand will review your verified profile.');
      if (campaign.id) {
        localStorage.removeItem(`crab_pitch_draft_${campaign.id}`);
      }
      if (onApplySuccess) {
        onApplySuccess(campaign.id);
      }
    } catch (err: any) {
      console.error('[DRAWER_APPLY_ERROR]', err);
      setErrorMessage(err.message || 'An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlatformBadge = (platform: string) => {
    const p = platform.toUpperCase();
    switch (p) {
      case 'YOUTUBE':
        return (
          <span key={platform} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200/80 text-xs font-semibold">
            <YouTubeIcon className="w-3.5 h-3.5" />
            <span>YouTube</span>
          </span>
        );
      case 'INSTAGRAM':
        return (
          <span key={platform} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200/80 text-xs font-semibold">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </span>
        );
      case 'TIKTOK':
        return (
          <span key={platform} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-semibold">
            <TikTokIcon className="w-3.5 h-3.5" />
            <span>TikTok</span>
          </span>
        );
      case 'X':
      case 'TWITTER':
        return (
          <span key={platform} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-semibold">
            <XTwitterIcon className="w-3.5 h-3.5" />
            <span>X / Twitter</span>
          </span>
        );
      default:
        return (
          <span key={platform} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F6F2] text-[#171717] border border-[#E7E1DA] text-xs font-semibold">
            {platform}
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-drawer-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-[#E7E1DA]"
      >
        {/* 1. STICKY HEADER */}
        <div className="px-6 py-4 border-b border-[#E7E1DA] flex items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF2E8] text-[#FF6B00] border border-[#FFE2D1] shrink-0">
              {campaign.category || 'Campaign Brief'}
            </span>
            <div className="h-4 w-px bg-[#E7E1DA] shrink-0" />
            <span className="text-xs text-[#737373] truncate">
              {campaign.brandName}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F8F6F2] hover:bg-neutral-200 text-[#737373] hover:text-[#171717] transition cursor-pointer shrink-0"
            aria-label="Close campaign details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. INDEPENDENTLY SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* A. CAMPAIGN POSTER HERO */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#F4EFEA] border border-[#E7E1DA] shadow-xs">
              <img
                src={imgError ? genericDefaultCover : heroPoster}
                alt={campaign.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />

              {/* Match Score Badge Overlay */}
              {campaign.matchScore && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{campaign.matchScore}% Creator Match</span>
                </div>
              )}

              {/* Payout Tag Overlay */}
              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#171717]/90 text-white backdrop-blur-md border border-neutral-700 shadow-xs text-xs font-bold font-mono">
                ₹{campaign.budgetMin?.toLocaleString()} – ₹{campaign.budgetMax?.toLocaleString()}
              </div>
            </div>

            {/* Campaign Title & Brand Identity Strip */}
            <div className="space-y-2">
              <h2
                id="campaign-drawer-title"
                className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight leading-snug"
              >
                {campaign.title}
              </h2>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {campaign.brandName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#171717]">
                    {campaign.brandName}
                  </span>
                </div>

                <span className="text-xs text-[#737373] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Partner</span>
                </span>

                {campaign.timeline && (
                  <span className="text-xs text-[#737373] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{campaign.timeline}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* B. SECTION 1: CAMPAIGN OVERVIEW */}
          <section className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
              <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Campaign Overview</span>
            </div>

            <div className="bg-[#F8F6F2]/70 rounded-xl p-4 border border-[#E7E1DA] space-y-3">
              <div>
                <div className="text-[11px] font-bold text-[#171717]">Objective & Brief</div>
                <p className="text-xs sm:text-sm text-[#383838] leading-relaxed mt-1">
                  {campaign.objective ||
                    campaign.description ||
                    campaign.aiBriefSummary ||
                    'Seeking creators to produce engaging, authentic video content demonstrating product value to high-intent audiences.'}
                </p>
              </div>

              {campaign.description && campaign.description !== campaign.objective && (
                <div className="pt-2 border-t border-[#E7E1DA]/60">
                  <div className="text-[11px] font-bold text-[#171717]">Detailed Context</div>
                  <p className="text-xs text-[#525252] leading-relaxed mt-1">
                    {campaign.description}
                  </p>
                </div>
              )}

              {campaign.brandDescription && (
                <div className="pt-2 border-t border-[#E7E1DA]/60">
                  <div className="text-[11px] font-bold text-[#171717]">About {campaign.brandName}</div>
                  <p className="text-xs text-[#525252] leading-relaxed mt-1">
                    {campaign.brandDescription}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* C. SECTION 2: COMPENSATION & SCHEDULE */}
          <section className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
              <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Compensation & Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA]">
                <div className="text-[11px] text-[#737373]">Budget / Deliverable Payout</div>
                <div className="text-base font-bold text-[#171717] mt-0.5">
                  ₹{campaign.budgetMin?.toLocaleString()} – ₹{campaign.budgetMax?.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1 font-medium">
                  {campaign.compensationModel || 'Fixed flat payout upon approval'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA]">
                <div className="text-[11px] text-[#737373]">Schedule / Deadline</div>
                <div className="text-base font-bold text-[#171717] mt-0.5 truncate">
                  {campaign.deadline || campaign.timeline || 'Rolling Applications'}
                </div>
                <div className="text-[10px] text-[#737373] mt-1">
                  {campaign.startDate && campaign.endDate
                    ? `${campaign.startDate} – ${campaign.endDate}`
                    : 'Active sponsorship window'}
                </div>
              </div>
            </div>

            {/* Expected Deliverables */}
            <div className="p-4 rounded-xl bg-white border border-[#E7E1DA] space-y-2">
              <div className="text-xs font-bold text-[#171717]">Expected Deliverables</div>
              <ul className="space-y-2">
                {deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#383838]">
                    <Check className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-[#E7E1DA]/60 flex items-center gap-1.5 text-[11px] text-[#737373]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {campaign.paymentTerms || 'Protected by CRAB Escrow: Payment is secured upfront and released within 48 hours of asset approval.'}
                </span>
              </div>
            </div>
          </section>

          {/* D. SECTION 3: ELIGIBILITY & REQUIREMENTS */}
          <section className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
              <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Eligibility & Requirements</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA] space-y-3.5">
              {/* Required Platforms */}
              <div>
                <div className="text-[11px] font-bold text-[#171717] mb-1.5">Required Channels</div>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => renderPlatformBadge(p))}
                </div>
              </div>

              {/* Creator Niche */}
              <div>
                <div className="text-[11px] font-bold text-[#171717] mb-1.5">Relevant Creator Niches</div>
                <div className="flex flex-wrap gap-1.5">
                  {niches.map((n) => (
                    <span
                      key={n}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E1DA] text-xs font-medium text-[#383838]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage Rights & Exclusivity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="text-xs">
                  <span className="text-[#737373] block text-[11px]">Usage Rights:</span>
                  <span className="font-semibold text-[#171717]">
                    {campaign.usageRights || 'Organic brand channels & social reposts (60 days)'}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-[#737373] block text-[11px]">Category Exclusivity:</span>
                  <span className="font-semibold text-[#171717]">
                    {campaign.exclusivity || 'No direct competitor integrations for 14 days'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* E. SECTION 4: BRAND CREDIBILITY & TRUST */}
          <section className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Brand Credibility</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7E1DA] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#171717]">Verified Brand on CRAB</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Escrow Verified
                </span>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                Brand identity and commercial budget are verified. Public creator feedback and star ratings will be compiled automatically as creator partnerships conclude.
              </p>
            </div>
          </section>

          {/* F. SECTION 5: CREATOR APPLICATION FORM */}
          <section className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737373]">
                <FileText className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Your Pitch Proposal</span>
              </div>
              <span className="text-[11px] text-[#737373]">
                {pitchNote.length} / 1500 chars
              </span>
            </div>

            {/* Prompt Helper Card */}
            <div className="p-3.5 rounded-xl bg-[#FFF8F3] border border-[#FFE2D1] text-xs text-[#6B3400] space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#FF6B00]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>What to include in a winning pitch:</span>
              </div>
              <ul className="text-[11px] space-y-0.5 list-disc list-inside text-[#7C4A1E]">
                <li>Why your audience matches this product</li>
                <li>Your proposed video format, angle, or demonstration concept</li>
                <li>Relevant past technical videos or portfolio links</li>
                <li>Your estimated timeline to draft and upload</li>
              </ul>
            </div>

            {/* Form Inputs */}
            <form id="campaign-drawer-form" onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] flex items-center justify-between">
                  <span>Pitch & Creative Concept *</span>
                  {pitchNote.length > 0 && pitchNote.length < 20 && (
                    <span className="text-[10px] text-amber-600 font-normal">
                      Minimum 20 characters recommended
                    </span>
                  )}
                </label>
                <textarea
                  ref={textareaRef}
                  rows={5}
                  value={pitchNote}
                  disabled={hasAppliedLocal || isSubmitting}
                  onChange={handlePitchChange}
                  placeholder="Hey! My channel covers software engineering and developer tools. For this campaign, I'd like to create a 6-minute hands-on walkthrough showing how your tool solves..."
                  className="w-full p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition min-h-[140px] max-h-[280px]"
                />
              </div>

              {/* Rate Adjustment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717]">
                  Proposed Commercial Fee (₹ INR)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#737373]">
                    ₹
                  </span>
                  <input
                    type="number"
                    disabled={hasAppliedLocal || isSubmitting}
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder={String(campaign.budgetMin || 25000)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] focus:outline-none transition font-mono font-semibold"
                  />
                </div>
                <p className="text-[10px] text-[#737373]">
                  Budget bracket: ₹{campaign.budgetMin?.toLocaleString()} – ₹{campaign.budgetMax?.toLocaleString()}
                </p>
              </div>

              {/* Feedback Toasts */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}
            </form>
          </section>
        </div>

        {/* 3. STICKY FOOTER ACTION BAR */}
        <div className="p-4 sm:p-5 border-t border-[#E7E1DA] bg-white/95 backdrop-blur-md sticky bottom-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <div className="text-[11px] text-[#737373]">Campaign Budget</div>
            <div className="text-base font-bold text-[#171717] font-mono leading-tight">
              ₹{campaign.budgetMin?.toLocaleString()} – ₹{campaign.budgetMax?.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E7E1DA] hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="submit"
              form="campaign-drawer-form"
              disabled={hasAppliedLocal || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                hasAppliedLocal
                  ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed border border-neutral-300'
                  : 'bg-[#FF6B00] hover:bg-[#e05e00] text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : hasAppliedLocal ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Already Applied</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
