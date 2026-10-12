'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Check,
  Save,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

export default function BrandProfilePage() {
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Acme Cloud',
    description: 'Developer tools, cloud infrastructure, and AI engineering solutions.',
    category: 'Technology & Cloud',
    website: 'https://acmecloud.example.com',
    email: 'partnerships@acmecloud.example.com',
    location: 'Bengaluru, India',
    targetMarkets: ['India', 'Global', 'North America'],
    selectedNiches: ['Cloud Architecture', 'DevOps', 'Software Engineering', 'AI Tools'],
  });

  const availableNiches = [
    'Cloud Architecture',
    'DevOps',
    'Software Engineering',
    'AI Tools',
    'Web Design',
    'Productivity & SaaS',
    'Technical Hardware',
  ];

  const handleToggleNiche = (niche: string) => {
    setProfile((prev) => {
      const exists = prev.selectedNiches.includes(niche);
      return {
        ...prev,
        selectedNiches: exists
          ? prev.selectedNiches.filter((n) => n !== niche)
          : [...prev.selectedNiches, niche],
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            eyebrow="Organization Identity"
            titlePrefix="Edit your verified"
            highlightText="brand profile."
            description="Manage your public brand profile, category alignment, target creator niches, and commercial preferences."
          />

          <Link
            href="/brand/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#F8F6F2] text-xs font-semibold shadow-xs transition self-start md:self-center shrink-0"
          >
            <span>View Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Brand Verification Status Pill Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#171717]">
                Verified Brand Partner
              </h4>
              <p className="text-xs text-[#737373]">
                Your brand profile is active in CRAB's marketplace directory and vector index.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
            Live in pgvector
          </span>
        </div>

        {/* 3. Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section A: Company Details */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="text-sm font-bold text-[#171717]">Company & Channel Details</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Public representation shown in marketplace search and creator campaign dossiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">Brand Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">Primary Category</label>
                <input
                  type="text"
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">Website URL</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">Location / Base City</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171717] block">
                Brand Description & Commercial Positioning
              </label>
              <textarea
                rows={3}
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs text-[#171717] focus:outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Section B: Target Creator Niches */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E7E1DA]">
              <h3 className="text-sm font-bold text-[#171717]">Target Creator Niches</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Select target content topics to prioritize in explainable semantic vector discovery.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableNiches.map((niche) => {
                const isSelected = profile.selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => handleToggleNiche(niche)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-xs'
                        : 'bg-[#F8F6F2] border-[#E7E1DA] text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            {success ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4" />
                <span>Brand profile updated successfully!</span>
              </span>
            ) : (
              <span className="text-xs text-[#737373]">
                Changes persist immediately across your active campaigns.
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Brand Profile'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
