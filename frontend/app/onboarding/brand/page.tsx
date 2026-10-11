'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import { Sparkles, ArrowRight, Building2, Globe, Check } from 'lucide-react';

const BRAND_CATEGORIES = [
  'TECHNOLOGY',
  'FINTECH',
  'ECOMMERCE',
  'EDTECH',
  'GAMING',
  'HEALTH_FITNESS',
  'SAAS_B2B',
  'CONSUMER_GOODS',
];

export default function BrandOnboardingPage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.displayName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TECHNOLOGY');
  const [website, setWebsite] = useState('https://');
  const [targetMarkets, setTargetMarkets] = useState<string[]>(['India', 'Global']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (token) {
        await fetchApi(
          '/api/brands/me',
          {
            method: 'PATCH',
            body: JSON.stringify({
              name,
              description,
              category,
              website,
              targetMarkets,
              contactInformation: { email: user?.email },
            }),
          },
          token
        ).catch((err) => console.warn('Backend sync note:', err));
      }

      updateUser({ displayName: name, brandId: `brand_${Date.now()}` });
      router.push('/brand/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-[#E7E8F0] p-8 shadow-[0_4px_12px_0_rgba(23,24,43,0.04)] space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF5F2] text-xs font-semibold text-[#F4511E]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Brand Setup • Step 1 of 1</span>
          </div>
          <h1 className="text-2xl font-bold text-[#17182B]">Register Your Brand Profile</h1>
          <p className="text-xs text-[#626782]">
            Define your company background and creator collaboration preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Company / Brand Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Veloce Cloud, Acme Labs"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#17182B]">Brand Description & Mission</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product or service and the type of creators you aim to partner with..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Industry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
              >
                {BRAND_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#17182B]">Official Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Registering...' : 'Complete Registration & Open Brand Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
