'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  User,
  Globe,
  Tag,
  Check,
  RefreshCw,
} from 'lucide-react';

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

export default function CreatorProfilePage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [rateEstimate, setRateEstimate] = useState('25000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        if (token) {
          const res = await fetchApi<any>('/api/creators/me', {}, token).catch(() => null);
          if (res?.data) {
            setDisplayName(res.data.displayName || user.displayName || '');
            setBio(res.data.bio || '');
            setLocation(res.data.location || 'Bengaluru, India');
            setSelectedNiches(res.data.preferences?.niches || ['Technology', 'Software Development']);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token, router]);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

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

      updateUser({ displayName });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
                <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#8580E8]" />
          Loading Profile Details...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      
      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#626782] hover:text-[#17182B] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {savedSuccess && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile Updated Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 border border-[#E7E8F0] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E8F0]">
            <div>
              <h1 className="text-xl font-bold text-[#17182B]">Creator Profile & Collaboration Preferences</h1>
              <p className="text-xs text-[#626782]">Manage how brands see your channel profile and audience alignment</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Channel / Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Location / Base Market</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Bio & Value Proposition</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#17182B] flex items-center justify-between">
              <span>Primary Niches & Tags</span>
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

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Estimated Rate per Integration (INR ₹)</label>
            <input
              type="number"
              value={rateEstimate}
              onChange={(e) => setRateEstimate(e.target.value)}
              placeholder="25000"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
            <span className="text-[11px] text-[#8B90A5]">Used by CRAB Deal Intelligence to recommend fair counteroffers.</span>
          </div>
        </form>
      </main>
    </div>
  );
}
