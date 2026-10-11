'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { Sparkles, ArrowRight, User, Globe, Check, Tag } from 'lucide-react';

const SUGGESTED_NICHES = [
  'Technology',
  'Software Development',
  'AI & Data Science',
  'Gaming',
  'Productivity & SaaS',
  'Design & Creative',
  'Finance & Crypto',
  'Lifestyle & Travel',
  'Education',
];

export default function CreatorOnboardingPage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Bengaluru, India');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Technology', 'Software Development']);
  const [primaryPlatform, setPrimaryPlatform] = useState<'YOUTUBE' | 'INSTAGRAM'>('YOUTUBE');
  const [handle, setHandle] = useState('@');
  const [loading, setLoading] = useState(false);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save profile to backend API
      if (token) {
        await fetchApi(
          '/api/creators/me',
          {
            method: 'PATCH',
            body: JSON.stringify({
              displayName,
              bio,
              location,
              contactInformation: { email: user?.email, handle, platform: primaryPlatform },
              preferences: { niches: selectedNiches },
            }),
          },
          token
        ).catch((err) => console.warn('Backend sync note:', err));
      }

      updateUser({ displayName, creatorId: `creator_${Date.now()}` });
      router.push('/creator/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-[#E7E8F0] p-8 shadow-[0_4px_12px_0_rgba(23,24,43,0.04)] space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F3F3FC] text-xs font-semibold text-[#8580E8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Setup • Step 1 of 1</span>
          </div>
          <h1 className="text-2xl font-bold text-[#17182B]">Build Your Creator Profile</h1>
          <p className="text-xs text-[#626782]">
            Help CRAB's AI understand your content niche, audience, and commercial alignment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Display / Channel Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Tech Reviews"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Bio & Content Focus</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brands what content you create and what makes your audience unique..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#17182B] flex items-center justify-between">
              <span>Content Niches & Topics</span>
              <span className="text-[11px] text-[#8B90A5]">Select all that apply</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_NICHES.map((niche) => {
                const selected = selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center space-x-1.5 ${
                      selected
                        ? 'bg-[#F3F3FC] border-[#8580E8] text-[#8580E8]'
                        : 'bg-[#F8F9FC] border-[#E7E8F0] text-[#626782] hover:border-[#8580E8]/40'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Primary Platform</label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              >
                <option value="YOUTUBE">YouTube</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Handle / Channel URL</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@handle"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Location / Base Market</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, India"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Setting up...' : 'Complete Setup & Open Creator Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
