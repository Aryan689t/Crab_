'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi, invalidateApiCache } from '../../../lib/api';
import {
  Youtube,
  Instagram,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Loader2,
  LogOut,
} from 'lucide-react';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[a-zA-Z0-9_\-@./]+(\?[a-zA-Z0-9_\-&=.%]*)?$/i;
const INSTAGRAM_REGEX = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?(\?[a-zA-Z0-9_\-&=.%]*)?$/i;

export default function CreatorOnboardingPage() {
  const { user, token, updateUser, logout } = useAuth();
  const router = useRouter();

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Validate on blur or change
  const handleYoutubeChange = (val: string) => {
    setYoutubeUrl(val);
    setGeneralError(null);
    const trimmed = val.trim();
    if (!trimmed) {
      setYoutubeError(null);
      return;
    }
    if (!YOUTUBE_REGEX.test(trimmed)) {
      setYoutubeError('Please enter a valid YouTube channel URL (e.g. https://youtube.com/@channel).');
    } else {
      setYoutubeError(null);
    }
  };

  const handleInstagramChange = (val: string) => {
    setInstagramUrl(val);
    setGeneralError(null);
    const trimmed = val.trim();
    if (!trimmed) {
      setInstagramError(null);
      return;
    }
    if (!INSTAGRAM_REGEX.test(trimmed)) {
      setInstagramError('Please enter a valid Instagram profile URL (e.g. https://instagram.com/yourhandle).');
    } else {
      setInstagramError(null);
    }
  };

  const isYoutubeValid = Boolean(youtubeUrl.trim() && !youtubeError && YOUTUBE_REGEX.test(youtubeUrl.trim()));
  const isInstagramValid = Boolean(instagramUrl.trim() && !instagramError && INSTAGRAM_REGEX.test(instagramUrl.trim()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const trimmedYt = youtubeUrl.trim();
    const trimmedIg = instagramUrl.trim();

    // 1. Check rule: At least one URL required
    if (!trimmedYt && !trimmedIg) {
      setGeneralError('Please enter at least one valid social profile (YouTube or Instagram) to proceed.');
      return;
    }

    // 2. Validate YouTube if provided
    let hasError = false;
    if (trimmedYt && !YOUTUBE_REGEX.test(trimmedYt)) {
      setYoutubeError('Please enter a valid YouTube channel URL (e.g. https://youtube.com/@channel).');
      hasError = true;
    }

    // 3. Validate Instagram if provided
    if (trimmedIg && !INSTAGRAM_REGEX.test(trimmedIg)) {
      setInstagramError('Please enter a valid Instagram profile URL (e.g. https://instagram.com/yourhandle).');
      hasError = true;
    }

    if (hasError) return;

    setSubmitting(true);

    try {
      // Send real database persistence request to backend
      const res = await fetchApi<{
        success: boolean;
        onboardingCompleted: boolean;
        message: string;
        data: any;
      }>('/api/creators/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          youtubeUrl: trimmedYt || undefined,
          instagramUrl: trimmedIg || undefined,
        }),
      }, token || undefined);

      setSuccessNotice(true);
      invalidateApiCache('/api/auth/me');
      invalidateApiCache('/api/creators');

      // Update in auth context and local storage immediately
      updateUser({
        onboardingCompleted: true,
      });

      // Brief pause to allow user to see success state before smooth navigation
      setTimeout(() => {
        router.push('/creator/dashboard');
      }, 400);
    } catch (err: any) {
      console.error('[ONBOARDING ERROR]', err);
      setGeneralError(err.message || 'Failed to save profiles. Please check your URLs and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col justify-between selection:bg-[#FF6B00]/20 selection:text-neutral-900">
      {/* Header */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-[#E7E1DA] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
            🦀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900">CRAB</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                Creator
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Alignment Engine</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:inline-block text-xs text-neutral-500 font-medium truncate max-w-[200px]">
              {user.email}
            </span>
          )}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition px-3 py-1.5 rounded-lg hover:bg-neutral-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-xl">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-[#E7E1DA] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] p-6 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-900 via-[#FF6B00] to-neutral-900" />

            {/* Stepper badge & header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 1 of 1 · Audience Onboarding</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Let's connect your audience
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Add your social profiles so CRAB can help you discover brands that match your content.
              </p>
            </div>

            {/* General error message banner */}
            {generalError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <div className="leading-relaxed font-medium">{generalError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* YouTube input field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="youtubeUrl" className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                      <Youtube className="w-3.5 h-3.5" />
                    </span>
                    YouTube Channel URL
                  </label>
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="youtubeUrl"
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => handleYoutubeChange(e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    disabled={submitting}
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white transition-all outline-none pr-10 text-neutral-900 placeholder:text-neutral-400 ${
                      youtubeError
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : isYoutubeValid
                        ? 'border-green-500/60 focus:ring-2 focus:ring-green-100'
                        : 'border-[#E7E1DA] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10'
                    }`}
                  />
                  {isYoutubeValid && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {youtubeError ? (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 pl-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {youtubeError}
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-400 pl-1">
                    Accepts links like <code className="text-neutral-600 font-mono">youtube.com/@handle</code> or channel URLs
                  </p>
                )}
              </div>

              {/* Instagram input field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="instagramUrl" className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
                      <Instagram className="w-3.5 h-3.5" />
                    </span>
                    Instagram Profile URL
                  </label>
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="instagramUrl"
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => handleInstagramChange(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    disabled={submitting}
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white transition-all outline-none pr-10 text-neutral-900 placeholder:text-neutral-400 ${
                      instagramError
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : isInstagramValid
                        ? 'border-green-500/60 focus:ring-2 focus:ring-green-100'
                        : 'border-[#E7E1DA] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10'
                    }`}
                  />
                  {isInstagramValid && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {instagramError ? (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 pl-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {instagramError}
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-400 pl-1">
                    Accepts links like <code className="text-neutral-600 font-mono">instagram.com/yourhandle</code>
                  </p>
                )}
              </div>

              {/* Requirement Helper Callout */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#FF6B00] shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-800">
                    At least one platform link is required
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    You can leave either field empty, but you must link at least one channel to activate your CRAB AI audience match score.
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || successNotice}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] active:scale-[0.99] text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(255,107,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving your profiles...</span>
                    </>
                  ) : successNotice ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Profiles Connected! Opening Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Creator Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Security / Privacy notice */}
          <div className="mt-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
            <span>🔒 Your credentials are secure. We only read public audience metrics.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E7E1DA] text-center text-xs text-neutral-400">
        <p>© 2026 CRAB — Creator & Brand Alignment Bridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
