'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../../lib/api';
import { PortalPageHeader } from '../../../../components/creator/PortalPageHeader';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const SUGGESTED_NICHES = [
  'Technology',
  'Software Engineering',
  'AI Tools',
  'DevOps',
  'Web Design',
  'Productivity & SaaS',
  'Gaming',
  'Fintech',
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function CreateCampaignPage() {
  const router = useRouter();
  const { token } = useAuth();

  // Form Fields
  const [title, setTitle] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [objective, setObjective] = useState('');
  const [budgetMin, setBudgetMin] = useState('25000');
  const [budgetMax, setBudgetMax] = useState('60000');
  const [requiredReach, setRequiredReach] = useState('30000');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Technology', 'Software Engineering']);
  
  // Deliverables: EMPTY by default (Requirement 4)
  const [deliverables, setDeliverables] = useState<string[]>([]);
  
  const [timeline, setTimeline] = useState('Nov 15 - Dec 10, 2026');
  const [exclusivity, setExclusivity] = useState('14 days category exclusivity');

  // Poster Upload State (Requirement 3)
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterFileName, setPosterFileName] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement | null>(null);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  // Deliverables Handlers
  const addDeliverableRow = () => {
    setDeliverables((prev) => [...prev, '']);
    setTimeout(() => {
      if (lastInputRef.current) {
        lastInputRef.current.focus();
      }
    }, 50);
  };

  const updateDeliverable = (index: number, value: string) => {
    setDeliverables((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const removeDeliverableRow = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  // Poster File Selection & Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processAndUploadFile(file);
  };

  const processAndUploadFile = async (file: File) => {
    setPosterError(null);

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setPosterError('Unsupported format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > MAX_IMAGE_SIZE) {
      setPosterError('Image is too large. Maximum allowed size is 5MB.');
      return;
    }

    // Read Data URL for preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPosterPreview(base64Data);
      setPosterFileName(file.name);
      setUploadingPoster(true);

      try {
        const uploadRes = await fetchApi<{ message: string; data: { url: string; path: string } }>(
          '/api/upload',
          {
            method: 'POST',
            body: JSON.stringify({
              file: base64Data,
              filename: file.name,
              contentType: file.type,
            }),
          },
          token || undefined
        );

        if (uploadRes?.data?.url) {
          setPosterUrl(uploadRes.data.url);
        } else {
          throw new Error('No public URL returned from upload server.');
        }
      } catch (err: any) {
        console.error('[POSTER UPLOAD ERROR]', err);
        setPosterError(err.message || 'Failed to upload poster image. Please try again.');
        // Don't keep a broken remote URL
        setPosterUrl(null);
      } finally {
        setUploadingPoster(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePoster = () => {
    setPosterPreview(null);
    setPosterUrl(null);
    setPosterFileName(null);
    setPosterError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('You must be signed in as a Brand to create a campaign.');
      return;
    }

    if (uploadingPoster) {
      setErrorMsg('Please wait for the poster upload to complete before publishing.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Clean deliverables: strip whitespace and discard empty rows
      const cleanDeliverables = deliverables
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const payload = {
        title: title.trim(),
        description: objective || `Marketing campaign for ${productOrService || title}.`,
        productOrService: productOrService.trim(),
        objective: objective.trim(),
        budgetMin: parseInt(budgetMin, 10) || 20000,
        budgetMax: parseInt(budgetMax, 10) || 50000,
        requiredReach: parseInt(requiredReach, 10) || 25000,
        platform: 'YOUTUBE',
        creatorNiche: selectedNiches.join(', '),
        timeline: {
          display: timeline,
          deliverables: cleanDeliverables, // Persist only valid deliverables
        },
        exclusivity,
        status: 'ACTIVE',
        coverImage: posterUrl || undefined, // Persist public poster URL
      };

      const res = await fetchApi<{ data: { id: string } }>(
        '/api/campaigns',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token
      );

      invalidateApiCache('/campaigns');
      invalidateApiCache('/brands');

      router.push(`/brand/campaigns/${res.data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-[#171717] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campaigns</span>
          </Link>
        </div>

        {/* Unified Header */}
        <PortalPageHeader
          eyebrow="Campaign Management"
          titlePrefix="Create a new"
          highlightText="campaign."
          description="Define your campaign requirements. CRAB AI will parse and vectorize this brief to match high-alignment creators."
        />

        {/* Main Campaign Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E7E1DA] shadow-xs space-y-7"
        >
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section: Campaign Basics */}
          <div className="border-b border-[#E7E1DA] pb-4">
            <h2 className="text-base font-bold text-[#171717]">
              Campaign Brief & Target Parameters
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Structured inputs are indexed by pgvector to identify creators with compatible audience personas.
            </p>
          </div>

          {/* Poster Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Campaign Poster</span>
              </label>
              <span className="text-[11px] text-[#737373]">
                Recommended 16:9 or 4:3 banner (PNG, JPG, WebP up to 5MB)
              </span>
            </div>

            {posterError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{posterError}</span>
              </div>
            )}

            {posterPreview ? (
              /* Uploaded / Selected State */
              <div className="relative rounded-2xl border border-[#E7E1DA] bg-[#F8F6F2] p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black/5 relative shrink-0 border border-[#E7E1DA]">
                  <img
                    src={posterPreview}
                    alt="Campaign Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadingPoster && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <p className="text-xs font-bold text-[#171717] truncate max-w-xs sm:max-w-md">
                      {posterFileName || 'Campaign Poster'}
                    </p>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      {uploadingPoster
                        ? 'Uploading to secure Supabase storage...'
                        : posterUrl
                        ? 'Stored in campaign-posters bucket'
                        : 'Preview ready for upload'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPoster}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-[#737373]" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      disabled={uploadingPoster}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Dropzone State */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E7E1DA] hover:border-[#FF6B00] bg-[#F8F6F2]/60 hover:bg-[#FFF4EB]/30 rounded-2xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-[#E7E1DA] group-hover:border-[#FFD8BA] flex items-center justify-center text-[#737373] group-hover:text-[#FF6B00] transition shadow-2xs mb-2.5">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#171717]">
                  Click to select campaign poster or drag & drop here
                </p>
                <p className="text-[11px] text-[#737373] mt-1">
                  Supports JPEG, PNG, and WebP (up to 5MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Campaign Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NextGen Cloud IDE Winter Launch"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Product / Service Name</label>
              <input
                type="text"
                required
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="e.g. Acme DevCloud Platform"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171717]">Campaign Objective & Key Message</label>
            <textarea
              rows={3}
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the core message, call to action, and creator content guidelines..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
            />
          </div>

          {/* Target Niches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#171717]">Target Creator Niches</label>
              <span className="text-[11px] text-[#737373]">Select applicable content verticals</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_NICHES.map((niche) => {
                const selected = selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-[#FFF4EB] border-[#FF6B00] text-[#FF6B00] font-bold'
                        : 'bg-[#F8F6F2] border-[#E7E1DA] text-[#525252] hover:text-[#171717]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Reach */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Budget Min (INR ₹)</label>
              <input
                type="number"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Budget Max (INR ₹)</label>
              <input
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Estimated Min Reach</label>
              <input
                type="number"
                value={requiredReach}
                onChange={(e) => setRequiredReach(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Deliverables List (Requirements 4 & 5) */}
          <div className="space-y-3 pt-2 border-t border-[#E7E1DA]">
            {/* Header: Left aligned title, far-right accessible plus icon */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#171717]">Deliverables List</label>
                <p className="text-[11px] text-[#737373]">
                  Required content milestones for applicants
                </p>
              </div>

              <button
                type="button"
                onClick={addDeliverableRow}
                aria-label="Add deliverable"
                title="Add deliverable"
                className="w-8 h-8 rounded-lg bg-[#FFF4EB] hover:bg-[#FFE8D6] text-[#FF6B00] border border-[#FFD8BA] flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Deliverables Rows or Empty State */}
            {deliverables.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#E7E1DA] bg-[#F8F6F2]/50 text-center text-xs text-[#737373]">
                No deliverables added yet. Click the{' '}
                <button
                  type="button"
                  onClick={addDeliverableRow}
                  className="font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3 inline" /> Add deliverable
                </button>{' '}
                icon above to specify required deliverables.
              </div>
            ) : (
              <div className="space-y-2.5">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]"
                  >
                    <span className="w-6 h-6 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center font-bold text-[10px] text-[#737373] shrink-0">
                      {idx + 1}
                    </span>

                    <input
                      ref={idx === deliverables.length - 1 ? lastInputRef : null}
                      type="text"
                      value={item}
                      onChange={(e) => updateDeliverable(idx, e.target.value)}
                      placeholder="e.g. 1 Dedicated Video (8-12 mins) with live product walkthrough..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-transparent hover:border-[#E7E1DA] focus:border-[#FF6B00] bg-white text-xs text-[#171717] focus:outline-none transition"
                    />

                    <button
                      type="button"
                      onClick={() => removeDeliverableRow(idx)}
                      title="Remove deliverable"
                      aria-label={`Remove deliverable ${idx + 1}`}
                      className="p-1.5 text-[#737373] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline & Exclusivity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E7E1DA]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Campaign Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Exclusivity Period</label>
              <input
                type="text"
                value={exclusivity}
                onChange={(e) => setExclusivity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#F8F6F2] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#E7E1DA] flex items-center justify-end gap-3">
            <Link
              href="/brand/campaigns"
              className="px-5 py-2.5 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingPoster}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing Campaign...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Campaign & Match Creators</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
