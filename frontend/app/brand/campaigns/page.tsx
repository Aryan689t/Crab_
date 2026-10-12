'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { fetchApi } from '../../../lib/api';
import {
  Plus,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  objective: string;
  budgetMin: number;
  budgetMax: number;
  requiredReach: number;
  platform: string;
  niches: string[];
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED';
  creatorsCount: number;
  coverImage: string;
}

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp_1',
    title: 'Cloud Infrastructure Launch & CLI Deep Dive',
    category: 'Cloud Infrastructure',
    objective: 'Technical deep-dive tutorials demonstrating container scalability and CLI automation.',
    budgetMin: 40000,
    budgetMax: 75000,
    requiredReach: 50000,
    platform: 'YOUTUBE',
    niches: ['Cloud Architecture', 'DevOps', 'Developer Tooling'],
    status: 'ACTIVE',
    creatorsCount: 2,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
  },
  {
    id: 'camp_2',
    title: 'AI Vector Database Integration Series',
    category: 'AI Software',
    objective: 'In-depth benchmarks showcasing pgvector and semantic vector search in Next.js apps.',
    budgetMin: 50000,
    budgetMax: 95000,
    requiredReach: 80000,
    platform: 'YOUTUBE',
    niches: ['AI & Machine Learning', 'Vector Databases', 'Fullstack'],
    status: 'ACTIVE',
    creatorsCount: 3,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
  },
  {
    id: 'camp_3',
    title: 'Fullstack Next.js Deployment Benchmark',
    category: 'Developer Platform',
    objective: 'Educators breaking down server actions and low-latency deployments for enterprise apps.',
    budgetMin: 45000,
    budgetMax: 85000,
    requiredReach: 60000,
    platform: 'MULTI_PLATFORM',
    niches: ['Frontend Engineering', 'Next.js', 'Web Performance'],
    status: 'COMPLETED',
    creatorsCount: 2,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
  },
];

export default function BrandCampaignsListPage() {
  const { user, token } = useAuth();
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'COMPLETED'>('ALL');

  useEffect(() => {
    let mounted = true;
    const loadCampaigns = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchApi<{ data: any[] }>('/api/brands/me/campaigns', {}, token);
        if (mounted && res?.data && res.data.length > 0) {
          setDbCampaigns(res.data);
        }
      } catch (err) {
        console.warn('[BRAND_CAMPAIGNS] Falling back to default brand campaigns:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, [token]);

  const allCampaigns: CampaignItem[] = useMemo(() => {
    if (dbCampaigns.length === 0) return DEFAULT_CAMPAIGNS;
    return dbCampaigns.map((c: any): CampaignItem => ({
      id: c.id,
      title: c.title,
      category: c.brand?.category || 'Technology',
      objective: c.objective || c.description || 'Targeted marketing campaign for creators.',
      budgetMin: Number(c.budgetMin) || 30000,
      budgetMax: Number(c.budgetMax) || 75000,
      requiredReach: c.requiredReach || 40000,
      platform: c.platform || 'YOUTUBE',
      niches: c.creatorNiche ? c.creatorNiche.split(',').map((s: string) => s.trim()) : ['Developer Tools'],
      status: (c.status || 'ACTIVE') as any,
      creatorsCount: 2,
      coverImage:
        c.coverImage ||
        c.cover_image ||
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
    }));
  }, [dbCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter((camp) => {
      const matchStatus = statusFilter === 'ALL' || camp.status === statusFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.niches.some((n: string) => n.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [allCampaigns, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* 1. Unified Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PortalPageHeader
            titlePrefix="Manage your brand"
            highlightText="campaigns."
          />

          <Link
            href="/brand/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-semibold shadow-xs transition self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>

        {/* 2. Toolbar & Status Filter */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns by title, category or niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] self-start sm:self-auto overflow-x-auto">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-white/60'
                }`}
              >
                {tab === 'ALL' ? 'All Campaigns' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Campaigns Grid (3 columns on standard desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-[#E7E1DA] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Campaign Image Cover with Status Badge */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={camp.coverImage}
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Status Pill on top right */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-neutral-800/90 text-white'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  {/* Category Pill on bottom left */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                      {camp.category}
                    </span>
                  </div>
                </div>

                {/* Campaign Body */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-[#171717] line-clamp-1">
                    {camp.title}
                  </h3>

                  <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                    {camp.objective}
                  </p>

                  {/* Niches Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {camp.niches.map((niche: string) => (
                      <span
                        key={niche}
                        className="px-2 py-0.5 rounded-md bg-[#F8F6F2] border border-[#E7E1DA] text-[10px] font-medium text-[#737373]"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics & Action */}
              <div className="p-5 pt-3 border-t border-[#E7E1DA] space-y-3 bg-[#F8F6F2]/30">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-[#737373] block">Allocated Budget</span>
                    <strong className="text-[#171717] font-bold">
                      ₹{camp.budgetMin.toLocaleString()} - ₹{camp.budgetMax.toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#737373] block">Target Reach</span>
                    <strong className="text-[#171717] font-bold">
                      {camp.requiredReach.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/brand/creators?campaign=${camp.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:bg-[#FFF4EB] hover:text-[#FF6B00] text-xs font-semibold shadow-2xs transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Find Creators</span>
                  </Link>

                  <Link
                    href={`/brand/campaigns/${camp.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#171717] hover:bg-neutral-800 text-white text-xs font-semibold shadow-2xs transition"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
