'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Briefcase,
  Calendar,
  DollarSign,
  Search,
  RefreshCw,
  MoreHorizontal,
  FileText
} from 'lucide-react';

const MOCK_COLLABORATIONS = [
  {
    id: 'collab_1',
    brand: { name: 'Acme Cloud', avatar: 'AC' },
    campaign: 'Cloud Infrastructure Launch',
    status: 'IN_PROGRESS',
    agreedAmount: 1500,
    deadline: '2023-11-15',
    deliverables: 2,
    completedDeliverables: 1
  },
  {
    id: 'collab_2',
    brand: { name: 'TechFlow', avatar: 'TF' },
    campaign: 'AI Database Integration',
    status: 'COMPLETED',
    agreedAmount: 2200,
    deadline: '2023-09-30',
    deliverables: 1,
    completedDeliverables: 1
  }
];

export default function CreatorCollaborationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'CREATOR') {
        router.push('/brand/dashboard');
        return;
      }
      setTimeout(() => setLoading(false), 600);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-brand-orange" />
          Loading Collaborations...
        </div>
      </div>
    );
  }

  const filteredCollabs = activeTab === 'ALL' 
    ? MOCK_COLLABORATIONS 
    : MOCK_COLLABORATIONS.filter(c => c.status === activeTab);

  return (
    <div className="flex flex-col">
      
      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-[32px] font-extrabold text-text-strong tracking-tight">Collaborations</h1>
            <p className="text-[14px] text-text-muted mt-2">Manage accepted partnerships, deliverables, and payments.</p>
          </div>
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search collaborations..." 
              className="pl-9 pr-4 py-2.5 bg-surface-card border border-border-warm focus-visible:outline-none focus-visible:border-brand-crimson focus-visible:ring-1 focus-visible:ring-brand-crimson rounded-xl text-[13px] font-medium text-text-strong transition-all w-full sm:w-64 shadow-sm placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border-warm pb-3 overflow-x-auto hide-scrollbar">
          {['ALL', 'CONTRACT_PENDING', 'IN_PROGRESS', 'COMPLETED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson border ${
                activeTab === tab
                  ? 'bg-brand-crimson text-white border-brand-crimson shadow-sm'
                  : 'bg-surface-card text-text-strong border-border-warm hover:border-brand-crimson/40 hover:bg-surface-tint hover:shadow-sm'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-surface-card rounded-2xl border border-border-warm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-tint border-b border-border-warm text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Brand & Campaign</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Agreed Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm">
                {filteredCollabs.map(collab => (
                  <tr key={collab.id} className="hover:bg-surface-tint transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-peach/30 text-brand-crimson flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-brand-peach/50">
                          {collab.brand.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-text-strong group-hover:text-brand-crimson transition-colors">{collab.brand.name}</p>
                          <p className="text-[12px] text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3.5 h-3.5 text-brand-orange" /> {collab.campaign}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {collab.status === 'COMPLETED' && <span className="px-3 py-1.5 rounded-lg border border-status-success/20 bg-status-success/10 text-status-success text-[11px] font-bold tracking-wide">COMPLETED</span>}
                      {collab.status === 'IN_PROGRESS' && <span className="px-3 py-1.5 rounded-lg border border-brand-peach/30 bg-brand-peach/20 text-brand-orange text-[11px] font-bold tracking-wide">IN PROGRESS</span>}
                      {collab.status === 'CONTRACT_PENDING' && <span className="px-3 py-1.5 rounded-lg border border-border-warm bg-surface-tint text-text-muted text-[11px] font-bold tracking-wide">PENDING CONTRACT</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[11px] text-text-muted font-bold">
                          <span>{collab.completedDeliverables}/{collab.deliverables} Done</span>
                          <span className="text-text-strong">{Math.round((collab.completedDeliverables / collab.deliverables) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-tint rounded-full overflow-hidden border border-border-warm/50">
                          <div 
                            className="h-full bg-brand-orange" 
                            style={{ width: `${(collab.completedDeliverables / collab.deliverables) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-brand-crimson" /> Due {new Date(collab.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[15px] text-text-strong tracking-tight">
                      ₹{collab.agreedAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="px-3 py-1.5 rounded-xl border border-border-warm text-[12px] font-bold text-text-strong hover:bg-surface-tint hover:border-brand-crimson/30 transition-colors bg-surface-card shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson">
                        View Details
                      </button>
                      <button className="p-1.5 rounded-xl text-text-muted hover:text-brand-crimson hover:bg-brand-peach/20 transition-colors inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson" aria-label="More options">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCollabs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-[13px] font-medium">
                      No collaborations found in this state.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
