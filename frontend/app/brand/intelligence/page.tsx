'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

const CHART_DATA = [
  { name: 'Jan', roi: 2.1, benchmark: 1.8 },
  { name: 'Feb', roi: 2.4, benchmark: 1.9 },
  { name: 'Mar', roi: 3.2, benchmark: 2.1 },
  { name: 'Apr', roi: 2.8, benchmark: 2.2 },
  { name: 'May', roi: 3.9, benchmark: 2.4 },
  { name: 'Jun', roi: 4.5, benchmark: 2.5 },
];

export default function BrandIntelligencePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Marketplace Analytics"
            titlePrefix="Campaign intelligence &"
            highlightText="creator economics."
            description="High-dimensional semantic representation extracted by Gemini AI from campaign briefs and evaluated across 768-dimensional creator vectors."
          />

          <div className="flex items-center gap-3 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vector Embedded (768d)</span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E7E1DA] hover:bg-[#F8F6F2] text-[#171717] text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#737373] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Insights</span>
            </button>
          </div>
        </div>

        {/* 2. AI Semantic Matching Banner */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-[#FFF4EB] text-[#FF6B00] shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">
                AI Semantic Matching Engine Active
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Brand campaign requirements automatically embedded and indexed in pgvector (v0.8.2) for zero-latency cosine similarity ranking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[#E7E1DA] pt-3 sm:pt-0 sm:pl-6 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#737373] block">
                Match Confidence
              </span>
              <strong className="text-sm font-extrabold text-emerald-700">94.2% (High)</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#737373] block">
                Embedding Model
              </span>
              <strong className="text-sm font-extrabold text-[#171717]">Gemini-001 (768d)</strong>
            </div>
          </div>
        </div>

        {/* 3. Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Strategic Learnings & ROI Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Strategic Learnings Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                    <Target className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-[#171717] tracking-tight">
                    Strategic Learnings & Conversion Drivers
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">Cross-Campaign NLP</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#FF6B00] shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      Technical Deep Dives Outperform Casual Mentions (3.2× Lift)
                    </h4>
                    <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                      Creators who integrate your cloud CLI or developer tools into an in-depth 10+ minute tutorial produce 3× higher downstream signup conversion than short intro mentions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA]">
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      High-Affinity Niche: DevOps & Infrastructure Engineers
                    </h4>
                    <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                      Campaigns targeting creators with Kubernetes, Terraform, and Docker niches displayed a 18% higher CTR than generic web development channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated ROI Trend Chart */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#171717] tracking-tight">
                    Creator Marketing ROI Trend
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Estimated return on ad spend across verified campaign deliverable milestones
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  +114% YoY Growth
                </span>
              </div>

              <div className="h-64 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#E7E1DA" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E7E1DA' }}
                    />
                    <YAxis
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E7E1DA' }}
                      tickFormatter={(v) => `${v}x`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E7E1DA',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '12px',
                        color: '#171717',
                      }}
                      formatter={(val: any) => [`${val}× ROI`, 'Measured ROI']}
                    />
                    <Bar
                      dataKey="roi"
                      fill="#FF6B00"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Audience Fit & Format Signatures (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Audience Niches */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E1DA]">
                <span className="p-1.5 rounded-lg bg-[#FFF4EB] text-[#FF6B00]">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-[#171717]">
                  Target Audience Niches
                </h3>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                Categories with high viewer commercial affinity and natural sponsored content conversion:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { name: 'Cloud Architecture & DevOps', score: '98% fit' },
                  { name: 'AI & Machine Learning Software', score: '95% fit' },
                  { name: 'Developer Tooling & Workstations', score: '91% fit' },
                  { name: 'Serverless Fullstack Platforms', score: '88% fit' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-[#171717]">{item.name}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Exclusions / Safety */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E1DA]">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-[#171717]">
                  Brand Exclusions / Guardrails
                </h3>
              </div>

              <p className="text-xs text-[#737373] leading-relaxed">
                Categories automatically filtered out to preserve developer brand trust and reputation:
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Gambling & Betting Apps',
                  'Unverified Crypto Projects',
                  'Generic Drop-shipping',
                  'Sensationalist Drama Content',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/80 text-[11px] font-semibold text-rose-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
