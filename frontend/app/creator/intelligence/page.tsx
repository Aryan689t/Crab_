'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Target,
  Layers,
  Cpu,
  RefreshCw,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

export default function CreatorIntelligencePage() {
  const { token } = useAuth();
  const [intelData, setIntelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchIntel = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchApi<any>('/api/creators/me/intelligence', {}, token);
        if (mounted && res?.data) {
          setIntelData(res.data);
        }
      } catch (err: any) {
        // 404 simply means profile has not been generated yet; preserve fallback presentation.
        console.warn('[INTELLIGENCE] Fetch note:', err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIntel();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleRunAnalysis = async () => {
    if (analyzing) return;
    if (!token) {
      setErrorMsg('Please log in to generate creator intelligence.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 45000);

    try {
      const postRes = await fetchApi<any>(
        '/api/creators/me/intelligence/analyze',
        {
          method: 'POST',
          signal: abortController.signal,
        },
        token
      );

      clearTimeout(timeoutId);

      const profile = postRes?.data?.profile;
      if (profile) {
        setIntelData(profile);
        setSuccessMsg(postRes?.data?.message || 'Creator intelligence generated and saved successfully.');
      } else {
        // Fallback: refresh GET if profile was not returned in the POST response
        try {
          const getRes = await fetchApi<any>(
            '/api/creators/me/intelligence',
            {},
            token
          );
          if (getRes?.data) {
            setIntelData(getRes.data);
            setSuccessMsg('Creator intelligence generated and saved successfully.');
          }
        } catch (refreshErr) {
          setErrorMsg(
            'Analysis succeeded, but the saved profile could not be refreshed immediately. Please refresh the page.'
          );
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const rawMsg = err?.message || String(err);

      if (rawMsg.includes('abort') || rawMsg.includes('timeout')) {
        setErrorMsg('The analysis request timed out. Please check your connection and try again.');
      } else if (rawMsg.includes('Insufficient creator data') || rawMsg.includes('bio')) {
        setErrorMsg('Insufficient creator data: Please add a creator bio or connect content posts before generating intelligence.');
      } else if (rawMsg.includes('rate limit') || rawMsg.includes('429')) {
        setErrorMsg('AI rate limit reached: Please wait a moment before trying again.');
      } else if (rawMsg.includes('high demand') || rawMsg.includes('503') || rawMsg.includes('experiencing')) {
        setErrorMsg('Gemini AI service is currently experiencing high demand. Please try again shortly.');
      } else if (rawMsg.includes('Authentication') || rawMsg.includes('401') || rawMsg.includes('Unauthorized')) {
        setErrorMsg('Authentication session expired. Please log in again.');
      } else {
        setErrorMsg(rawMsg || 'An unexpected error occurred during intelligence analysis.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const isLiveProfile = Boolean(intelData && (intelData.id || intelData.primaryNiches?.length));
  const isProfileOnly = Boolean(
    intelData?.confidenceData?.evidenceCount === 0 ||
    intelData?.confidenceData?.limitations?.some((l: string) => l.toLowerCase().includes('profile'))
  );

  const confidenceScore = intelData?.confidenceData?.score;
  const confidenceScoreText =
    confidenceScore !== undefined
      ? `${(confidenceScore * 100).toFixed(0)}% (${
          confidenceScore >= 0.7 ? 'Strong Coverage' : confidenceScore >= 0.4 ? 'Moderate Coverage' : 'Profile Only'
        })`
      : '94.2% (Demo Sample)';

  const limitations: string[] = intelData?.confidenceData?.limitations || [];

  // Derived attributes with mentor presentation fallbacks
  const audienceSummary =
    intelData?.audienceSummary ||
    'High-concentration audience of professional fullstack developers, cloud architects, and tech founders looking for actionable engineering breakdowns.';
  const primaryNiches: string[] = intelData?.primaryNiches?.length
    ? intelData.primaryNiches
    : [
        'Technology',
        'AI & Machine Learning',
        'Software Engineering',
        'Cloud Architecture',
      ];
  const contentStyle: string[] = intelData?.contentStyle?.length
    ? intelData.contentStyle
    : [
        'Tutorials & Walkthroughs',
        'Code Benchmarks',
        'Deep-dive Architecture Breakdowns',
        'Workflow Automation',
      ];
  const recommendedBrands: string[] = intelData?.brandSuitability?.recommended?.length
    ? intelData.brandSuitability.recommended
    : [
        'Developer Platforms & CLIs',
        'Cloud Providers & DBs',
        'AI Coding Assistants',
        'Engineering SaaS Tools',
        'Technical Hardware & Workstations',
      ];
  const avoidBrands: string[] = intelData?.brandSuitability?.avoid?.length
    ? intelData.brandSuitability.avoid
    : [
        'Gambling & Betting Apps',
        'Unverified Crypto Projects',
        'Generic Fast-Fashion Dropshipping',
      ];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Semantic Dossier"
          titlePrefix="Creator intelligence &"
          highlightText="brand alignment."
          description="Creator profile analysis and commercial affinity generated by Gemini AI from channel evidence and profile data."
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isLiveProfile
                    ? isProfileOnly
                      ? 'Profile-Only Analysis'
                      : 'Live AI Profile'
                    : 'Demo Baseline'}
                </span>
              </div>

              <button
                id="btn-analyze-intelligence"
                type="button"
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] disabled:bg-[#FF6B00]/60 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing channel...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isLiveProfile ? 'Re-analyze' : 'Generate Intelligence'}</span>
                  </>
                )}
              </button>
            </div>
          }
        />

        {/* Status Feedback Banners */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. Top Confidence & Evidence Scope Strip */}
        <section className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171717]">
                AI Semantic Intelligence Grounding
              </div>
              <div className="text-xs text-[#737373] mt-0.5">
                {isLiveProfile
                  ? isProfileOnly
                    ? 'Profile-only analysis: Derived strictly from display name, bio, and metadata (no content posts available).'
                    : 'Content-backed analysis: Evaluated from recent content publications, captions, and engagement metrics.'
                  : 'Displaying mentor presentation demo baseline. Click "Generate Intelligence" to run live analysis.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E1DA]">
            <div>
              <div className="text-[#737373]">Evidence Coverage</div>
              <div className="text-sm font-bold text-emerald-700">
                {confidenceScoreText}
              </div>
            </div>
            <div className="h-7 w-px bg-[#E7E1DA]" />
            <div>
              <div className="text-[#737373]">Extraction Status</div>
              <div className="text-sm font-bold text-[#171717]">
                {intelData?.generatedAt ? 'Live Persisted' : 'Demo Baseline'}
              </div>
            </div>
          </div>
        </section>

        {/* Limitations Notice */}
        {limitations.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Evidence Scope & Gaps:</span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {limitations.map((limit, idx) => (
                  <li key={idx}>{limit}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 3. Core Intelligence Dossier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Audience Persona & Content Signature (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Audience Persona Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E1DA]">
                <Target className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="font-bold text-sm text-[#171717]">Audience Persona Profile</h3>
              </div>

              <p className="text-xs sm:text-sm text-[#383838] leading-relaxed">
                {audienceSummary}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-[#737373]">Primary Evaluated Niches:</div>
                <div className="flex flex-wrap gap-2">
                  {primaryNiches.map((niche: string) => (
                    <span
                      key={niche}
                      className="px-3 py-1 rounded-xl bg-[#F8F6F2] text-[#171717] text-xs font-semibold border border-[#E7E1DA]"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Style Signature Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E1DA]">
                <Layers className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="font-bold text-sm text-[#171717]">Content Style Signature</h3>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                {isProfileOnly
                  ? 'Thematic style attributes inferred from creator profile focus:'
                  : 'Classified formats based on post themes, descriptions, and audience engagement:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {contentStyle.map((style: string) => (
                  <div
                    key={style}
                    className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-[#171717]">{style}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Brand Suitability & Commercial Avoidance (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recommended Brand Alignments */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E1DA]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#171717]">Recommended Brand Categories</h3>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                Commercial categories that naturally align with channel themes and audience trust:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {recommendedBrands.map((brand: string) => (
                  <span
                    key={brand}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Commercial Exclusions */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E1DA]">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-[#171717]">Brand Exclusions / Avoid</h3>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                Categories to filter out to preserve authenticity and channel credibility:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {avoidBrands.map((avoid: string) => (
                  <span
                    key={avoid}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/80"
                  >
                    {avoid}
                  </span>
                ))}
              </div>
            </div>

            {/* Opportunities Link CTA */}
            <div className="p-5 rounded-2xl bg-[#FFF4EB] border border-[#FF6B00]/40 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#171717]">Ready to monetize?</div>
                <div className="text-[11px] text-[#737373] mt-0.5">
                  Browse brand campaigns aligned with your creator niches.
                </div>
              </div>
              <Link
                href="/creator/opportunities"
                className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold shrink-0 transition shadow-xs"
              >
                Browse Matching
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

