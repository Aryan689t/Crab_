'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';

import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Camera,
  Check,
  RefreshCw,
  Save
} from 'lucide-react';

export default function BrandProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Amazon Web Services',
    description: 'Developer tools, cloud infrastructure, and AI engineering solutions.',
    category: 'Technology',
    website: 'https://aws.amazon.com',
    email: 'partnerships@example.com',
    location: 'Seattle, WA',
  });

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
      setTimeout(() => setLoading(false), 500);
    }
  }, [user, authLoading, router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        
        <div className="flex-1 flex items-center justify-center text-[#8B90A5] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#F4511E]" />
          Loading Brand Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      

      <main className="w-full px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#17182B]">Brand Profile</h1>
          <p className="text-sm text-[#626782] mt-1">Manage your public brand identity visible to creators.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E8F0] shadow-sm overflow-hidden">
          {/* Header Cover & Avatar */}
          <div className="h-32 bg-gradient-to-r from-[#F4511E] to-[#FF8A65] relative">
            <button className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex justify-between items-end mb-6 -mt-10">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center font-bold text-3xl text-[#17182B] bg-gradient-to-br from-gray-50 to-gray-200 relative group cursor-pointer">
                {profile.name.substring(0, 2).toUpperCase()}
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#17182B]">Brand Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#17182B]">Category / Industry</label>
                  <input
                    type="text"
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
                  />
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-[#17182B]">Description</label>
                  <textarea
                    rows={3}
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#17182B] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#8B90A5]" /> Website
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#17182B] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#8B90A5]" /> Partnership Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E8F0] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : success ? (
                    <><Check className="w-4 h-4" /> Saved Successfully</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
