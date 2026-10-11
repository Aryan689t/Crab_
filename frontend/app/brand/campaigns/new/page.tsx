'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/layout/AppShell';
import { useMockStore } from '../../../../mock/store';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Building2,
  Calendar,
  DollarSign,
  Layers,
} from 'lucide-react';

const SUGGESTED_NICHES = [
  'Technology',
  'Software Engineering',
  'AI Tools',
  'DevOps',
  'Web Design',
  'Productivity & SaaS',
  'Gaming',
  'Fintech',
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { addCampaign } = useMockStore();

  const [title, setTitle] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [category, setCategory] = useState('TECHNOLOGY');
  const [objective, setObjective] = useState('');
  const [budgetMin, setBudgetMin] = useState('25000');
  const [budgetMax, setBudgetMax] = useState('60000');
  const [requiredReach, setRequiredReach] = useState('30000');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Technology', 'Software Engineering']);
  const [deliverables, setDeliverables] = useState<string[]>([
    '1 Dedicated Video (8-12 mins) with live product walkthrough',
    'Pinned link in video description',
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [timeline, setTimeline] = useState('Nov 15 - Dec 10, 2026');
  const [exclusivity, setExclusivity] = useState('14 days category exclusivity');
  const [loading, setLoading] = useState(false);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const addDeliverableItem = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables([...deliverables, newDeliverable.trim()]);
    setNewDeliverable('');
  };

  const removeDeliverableItem = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const created = addCampaign({
      title,
      brandName: 'Acme Cloud & AI',
      brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      productOrService,
      category,
      objective,
      budgetMin: parseInt(budgetMin, 10) || 20000,
      budgetMax: parseInt(budgetMax, 10) || 50000,
      currency: 'INR',
      requiredReach: parseInt(requiredReach, 10) || 25000,
      platforms: ['YOUTUBE'],
      niches: selectedNiches,
      deliverables,
      timeline,
      exclusivity,
      status: 'ACTIVE',
      aiBriefSummary: `AI Normalized Objective: Promote ${productOrService} targeting ${selectedNiches.join(', ')} creators.`,
    });

    router.push(`/brand/campaigns/${created.id}`);
  };

  return (
    <AppShell
      title="Create New Campaign"
      subtitle="Define your campaign requirements. CRAB AI will parse and vectorize this brief to match creators."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/brand/campaigns"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#626782] hover:text-[#17182B] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-[#E7E8F0] shadow-sm space-y-6">
          <div className="border-b border-[#E7E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#17182B]">Campaign Brief & AI Vectorization Setup</h2>
            <p className="text-xs text-[#626782]">
              Structured inputs are indexed by pgvector to identify creators with compatible audience personas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Campaign Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NextGen Cloud IDE Winter Launch"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Product / Service Name</label>
              <input
                type="text"
                required
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="e.g. Acme DevCloud Platform"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17182B]">Campaign Objective & Key Message</label>
            <textarea
              rows={3}
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the main message, call to action, and what kind of content format you prefer..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#17182B] flex items-center justify-between">
              <span>Target Creator Niches</span>
              <span className="text-[11px] text-[#8B90A5]">Select applicable content verticals</span>
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
                        ? 'bg-[#F3F3FC] border-[#8580E8] text-[#8580E8] font-bold'
                        : 'bg-[#F8F9FC] border-[#E7E8F0] text-[#626782]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range & Required Reach */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Budget Min (INR ₹)</label>
              <input
                type="number"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Budget Max (INR ₹)</label>
              <input
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Estimated Min Reach</label>
              <input
                type="number"
                value={requiredReach}
                onChange={(e) => setRequiredReach(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#17182B]">Deliverables List</label>
            <div className="space-y-2">
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded-xl border border-[#E7E8F0] text-xs text-[#17182B]"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#E7E8F0] flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDeliverableItem(idx)}
                    className="text-[#8B90A5] hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Add another deliverable item..."
                className="flex-1 px-4 py-2 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-xs text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={addDeliverableItem}
                className="px-3 py-2 rounded-xl bg-[#F5F6FA] hover:bg-[#E7E8F0] text-xs font-semibold text-[#17182B] border border-[#E7E8F0] transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Timeline & Exclusivity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Campaign Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17182B]">Exclusivity Period</label>
              <input
                type="text"
                value={exclusivity}
                onChange={(e) => setExclusivity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E8F0] flex items-center justify-end space-x-3">
            <Link
              href="/brand/campaigns"
              className="px-5 py-2.5 rounded-xl border border-[#E7E8F0] text-xs font-semibold text-[#626782] hover:bg-[#F5F6FA]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-bold shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Campaign...' : 'Publish Campaign & Match Creators'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
