'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  CheckCircle2,
  User,
  Globe,
  Tag,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Link2,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';
import { YouTubeIcon, InstagramIcon, TikTokIcon, XTwitterIcon } from '../../../components/creator/BrandIcons';

const SUGGESTED_NICHES = [
  'Technology',
  'Software Engineering',
  'AI & Machine Learning',
  'Cloud Architecture',
  'Developer Tooling',
  'Productivity & SaaS',
  'Tech Reviews & Hardware',
  'Design & Creative',
  'Finance & FinTech',
  'Career & Education',
];

export default function CreatorProfilePage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('Alex Chen');
  const [bio, setBio] = useState('Fullstack software engineer breaking down cloud, AI and developer tools.');
  const [location, setLocation] = useState('Bengaluru, India');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([
    'Technology',
    'AI & Machine Learning',
    'Software Engineering',
  ]);
  const [rateEstimate, setRateEstimate] = useState('45000');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchApi<any>('/api/creators/me', {}, token).catch(() => null);
        if (mounted && res?.data) {
          if (res.data.displayName) setDisplayName(res.data.displayName);
          if (res.data.bio) setBio(res.data.bio);
          if (res.data.location) setLocation(res.data.location);
          if (res.data.preferences?.niches) setSelectedNiches(res.data.preferences.niches);
          if (res.data.preferences?.rateEstimate) setRateEstimate(res.data.preferences.rateEstimate);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [token]);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  // Dynamic Profile Completion Calculation
  const completionScore = (() => {
    let score = 0;
    if (displayName.trim()) score += 20;
    if (bio.trim().length > 20) score += 20;
    if (location.trim()) score += 20;
    if (selectedNiches.length >= 2) score += 20;
    if (rateEstimate) score += 20;
    return score;
  })();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      if (token) {
        await fetchApi(
          '/api/creators/me',
          {
            method: 'PATCH',
            body: JSON.stringify({
              displayName,
              bio,
              location,
              preferences: { niches: selectedNiches, rateEstimate },
            }),
          },
          token
        );
      }

      if (updateUser) {
        updateUser({ displayName });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('[PROFILE_SAVE_ERROR]', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Profile Identity"
          titlePrefix="Edit your verified"
          highlightText="creator profile."
          description="Update your bio, primary niches, baseline commercial pricing, and public information shown to brand sponsors."
          action={
            <Link
              href="/creator/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-white hover:bg-[#F8F6F2] text-xs font-semibold text-[#171717] transition shadow-xs"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Save Toast Notification */}
        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs transition animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated and synchronized with brand discovery database!</span>
            </div>
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Profile Completion Bar */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#171717]">
              Profile Completion: {completionScore}%
            </div>
            <div className="text-[11px] text-[#737373]">
              Complete profiles are prioritized by the Gemini semantic recommendation engine.
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="h-2 rounded-full bg-[#F8F6F2] overflow-hidden border border-[#E7E1DA]">
              <div
                className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Main Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section A: Identity & Basics */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="font-bold text-sm text-[#171717]">Personal & Channel Details</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Public representation shown in marketplace search and campaign dossiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717]">Display Name / Channel Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717]">Location / Base City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Channel Bio & Editorial Persona</label>
              <textarea
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] focus:outline-none transition resize-none"
              />
              <div className="text-[10px] text-[#737373] text-right">
                {bio.length} characters
              </div>
            </div>
          </div>

          {/* Section B: Content Niches */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="font-bold text-sm text-[#171717]">Content Niches & Topics</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Select your primary content areas to receive relevant brand campaign matches.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_NICHES.map((niche) => {
                const isSelected = selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xs'
                        : 'bg-[#F8F6F2] text-[#525252] border-[#E7E1DA] hover:border-[#171717]/40 hover:text-[#171717]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Commercial Rate Estimate */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="font-bold text-sm text-[#171717]">Commercial Baseline Pricing</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Expected baseline rate per dedicated video integration (in INR).
              </p>
            </div>

            <div className="max-w-xs space-y-1.5">
              <label className="text-xs font-bold text-[#171717]">Baseline Rate (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#737373]">
                  ₹
                </span>
                <input
                  type="number"
                  value={rateEstimate}
                  onChange={(e) => setRateEstimate(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs sm:text-sm text-[#171717] focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section D: Connected Channels */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="font-bold text-sm text-[#171717]">Connected Social Accounts</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Authorized channels feeding views and metrics into CRAB.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'YouTube', handle: '@alexchen_tech', icon: YouTubeIcon, connected: true },
                { name: 'Instagram', handle: '@alexchen.dev', icon: InstagramIcon, connected: true },
                { name: 'TikTok', handle: '@alexchen_code', icon: TikTokIcon, connected: true },
                { name: 'X / Twitter', handle: '@alexchen_dev', icon: XTwitterIcon, connected: true },
              ].map((acc) => {
                const Icon = acc.icon;
                return (
                  <div
                    key={acc.name}
                    className="p-3.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded bg-white border border-[#E7E1DA] shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[#171717]">{acc.name}</div>
                        <div className="text-[11px] text-[#737373]">{acc.handle}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Connected
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/creator/dashboard"
              className="px-5 py-2.5 rounded-xl border border-[#E7E1DA] hover:bg-white text-xs font-semibold text-[#171717] transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
