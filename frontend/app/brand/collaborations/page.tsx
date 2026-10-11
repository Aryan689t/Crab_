'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Search,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';

const MOCK_COLLABORATIONS = [
  {
    id: 'collab_1',
    creator: { name: 'Alex Developer', avatar: 'AD' },
    campaign: 'Cloud Infrastructure Launch',
    status: 'IN_PROGRESS',
    agreedAmount: 1500,
    deadline: '2023-11-15',
    deliverables: 2,
    completedDeliverables: 1
  },
  {
    id: 'collab_2',
    creator: { name: 'Sarah Codes', avatar: 'SC' },
    campaign: 'AI Database Integration',
    status: 'COMPLETED',
    agreedAmount: 2200,
    deadline: '2023-09-30',
    deliverables: 1,
    completedDeliverables: 1
  },
  {
    id: 'collab_3',
    creator: { name: 'Dev Tips', avatar: 'DT' },
    campaign: 'Cloud Infrastructure Launch',
    status: 'CONTRACT_PENDING',
    agreedAmount: 800,
    deadline: '2023-12-01',
    deliverables: 1,
    completedDeliverables: 0
  }
];

export default function BrandCollaborationsPage() {
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
      if (user.role !== 'BRAND') {
        router.push('/creator/dashboard');
        return;
      }
      setTimeout(() => setLoading(false), 600);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#F4511E]" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#17182B]">Collaborations</h1>
            <p className="text-sm text-[#626782] mt-1">Manage accepted partnerships, contracts, and payments.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8B90A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collaborations..."
              className="pl-9 pr-4 py-2 bg-white border border-[#E7E8F0] focus:border-[#F4511E] rounded-xl text-sm transition outline-none w-64 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#E7E8F0] pb-2">
          {['ALL', 'CONTRACT_PENDING', 'IN_PROGRESS', 'COMPLETED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab
                  ? 'bg-[#17182B] text-white shadow-sm'
                  : 'text-[#626782] hover:bg-white hover:text-[#17182B]'
                }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E7E8F0] text-xs font-bold text-[#8B90A5] uppercase tracking-wider">
                  <th className="px-6 py-4">Creator & Campaign</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Agreed Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E8F0]">
                {filteredCollabs.map(collab => (
                  <tr key={collab.id} className="hover:bg-[#F5F6FA] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F3F3FC] text-[#8580E8] flex items-center justify-center font-bold flex-shrink-0">
                          {collab.creator.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#17182B]">{collab.creator.name}</p>
                          <p className="text-[11px] text-[#626782] flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3" /> {collab.campaign}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {collab.status === 'COMPLETED' && <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">COMPLETED</span>}
                      {collab.status === 'IN_PROGRESS' && <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[11px] font-bold">IN PROGRESS</span>}
                      {collab.status === 'CONTRACT_PENDING' && <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[11px] font-bold">PENDING CONTRACT</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-[#626782] font-semibold">
                          <span>{collab.completedDeliverables} / {collab.deliverables} Deliverables</span>
                          <span>{Math.round((collab.completedDeliverables / collab.deliverables) * 100)}%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#E7E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#F4511E]"
                            style={{ width: `${(collab.completedDeliverables / collab.deliverables) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#8B90A5] flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> Due {new Date(collab.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm text-[#17182B]">
                      ${collab.agreedAmount}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[#E7E8F0] text-xs font-semibold text-[#17182B] hover:bg-white transition bg-[#F8F9FC]">
                        View Details
                      </button>
                      <button className="p-1.5 rounded-lg text-[#8B90A5] hover:bg-[#F5F6FA] transition inline-flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCollabs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#8B90A5] text-sm">
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
