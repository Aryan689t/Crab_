'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export interface CompletionStep {
  id: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref?: string;
  onAction?: () => void;
  completed?: boolean;
}

interface ProfileCompletionPanelProps {
  completionPercentage?: number;
  steps?: CompletionStep[];
  onConnectSocial?: () => void;
}

export function ProfileCompletionPanel({
  completionPercentage = 0,
  steps = [],
  onConnectSocial,
}: ProfileCompletionPanelProps) {
  const pendingSteps = steps.filter((s) => !s.completed);

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
              Profile completion
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373]">Progress</span>
            <span className="font-mono font-bold text-[#171717]">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#F2ECE5] overflow-hidden">
          <div
            className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* Action Steps List */}
      <div className="space-y-2.5 pt-1">
        {pendingSteps.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900 leading-tight">
                  Your profile is fully complete
                </div>
                <div className="text-[11px] text-emerald-700">
                  Brands have complete access to your verified metrics and niche tags.
                </div>
              </div>
            </div>
            <Link
              href="/creator/profile"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          pendingSteps.slice(0, 3).map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F6F2]/70 border border-[#E7E1DA] gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#171717] truncate">
                  {step.title}
                </div>
                <div className="text-[11px] text-[#737373] truncate">
                  {step.subtitle}
                </div>
              </div>

              {step.actionHref ? (
                <Link
                  href={step.actionHref}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E7E1DA] bg-white text-[#171717] hover:bg-[#F4EFEA] text-xs font-semibold transition shrink-0 shadow-2xs"
                >
                  {step.actionText}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={step.onAction || onConnectSocial}
                  className="px-3.5 py-1.5 rounded-xl border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs font-semibold transition shrink-0 cursor-pointer shadow-2xs"
                >
                  {step.actionText}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
