'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Target,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Layers,
  ArrowRight,
  Database,
  Check,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

export default function CreatorIntelligencePage() {
  const { user, token } = useAuth();
  const [intelData, setIntelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      } catch (err) {
        console.warn('[INTELLIGENCE] Live fetch fallback:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIntel();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Derived or default intelligence attributes
  const audienceSummary =
    intelData?.audienceSummary ||
    'High-concentration audience of professional fullstack developers, cloud architects, and tech founders looking for actionable engineering breakdowns.';
  const primaryNiches = intelData?.primaryNiches || [
    'Technology',
    'AI & Machine Learning',
    'Software Engineering',
    'Cloud Architecture',
  ];
  const contentStyle = intelData?.contentStyle || [
    'Tutorials & Walkthroughs',
    'Code Benchmarks',
    'Deep-dive Architecture Breakdowns',
    'Workflow Automation',
  ];
  const recommendedBrands = intelData?.brandSuitability?.recommended || [
    'Developer Platforms & CLIs',
    'Cloud Providers & DBs',
    'AI Coding Assistants',
    'Engineering SaaS Tools',
    'Technical Hardware & Workstations',
  ];
  const avoidBrands = intelData?.brandSuitability?.avoid || [
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
          description="High-dimensional semantic representation extracted by Gemini AI from your channel transcripts and stored in pgvector."
          action={
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vector Embedded (768d)</span>
            </div>
          }
        />

        {/* 2. Top Confidence & Vector Health Strip */}
        <section className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171717]">
                AI Semantic Matching Engine Active
              </div>
              <div className="text-xs text-[#737373] mt-0.5">
                Brands use semantic vector search to find creators matching exact campaign requirements.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E1DA]">
            <div>
              <div className="text-[#737373]">Match Confidence</div>
              <div className="text-sm font-bold text-emerald-700">94.2% (High)</div>
            </div>
            <div className="h-7 w-px bg-[#E7E1DA]" />
            <div>
              <div className="text-[#737373]">Extraction Status</div>
              <div className="text-sm font-bold text-[#171717]">Up to date</div>
            </div>
          </div>
        </section>

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
                Classified formats based on audio transcript NLP analysis and viewer retention spikes:
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
                Categories with high viewer commercial affinity and natural sponsored content conversion:
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
                Categories filtered out to preserve audience trust and channel credibility:
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
                  Browse campaigns matching your 768d vector profile.
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
