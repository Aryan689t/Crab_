'use client';

import { useState, useEffect } from 'react';
import {
  CreatorItem,
  CampaignItem,
  ApplicationItem,
  INITIAL_CREATORS,
  INITIAL_CAMPAIGNS,
  INITIAL_APPLICATIONS,
} from './data';

const STORAGE_KEY_CREATORS = 'crab_store_creators';
const STORAGE_KEY_CAMPAIGNS = 'crab_store_campaigns';
const STORAGE_KEY_APPLICATIONS = 'crab_store_applications';

export function getStoredCreators(): CreatorItem[] {
  if (typeof window === 'undefined') return INITIAL_CREATORS;
  const stored = localStorage.getItem(STORAGE_KEY_CREATORS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(INITIAL_CREATORS));
    return INITIAL_CREATORS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CREATORS;
  }
}

export function getStoredCampaigns(): CampaignItem[] {
  if (typeof window === 'undefined') return INITIAL_CAMPAIGNS;
  const stored = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    return INITIAL_CAMPAIGNS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CAMPAIGNS;
  }
}

export function getStoredApplications(): ApplicationItem[] {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    return INITIAL_APPLICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function useMockStore() {
  const [creators, setCreators] = useState<CreatorItem[]>(INITIAL_CREATORS);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCreators(getStoredCreators());
    setCampaigns(getStoredCampaigns());
    setApplications(getStoredApplications());
    setLoaded(true);
  }, []);

  const toggleShortlist = (creatorId: string) => {
    const updated = creators.map((c) =>
      c.id === creatorId ? { ...c, isShortlisted: !c.isShortlisted } : c
    );
    setCreators(updated);
    localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(updated));
  };

  const addCampaign = (newCmp: Omit<CampaignItem, 'id' | 'createdAt' | 'invitedCount' | 'appliedCount' | 'acceptedCount' | 'totalSpent'>) => {
    const campaign: CampaignItem = {
      ...newCmp,
      id: `cmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      invitedCount: 0,
      appliedCount: 0,
      acceptedCount: 0,
      totalSpent: 0,
    };
    const updated = [campaign, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updated));
    return campaign;
  };

  const inviteCreatorToCampaign = (creatorId: string, campaignId: string) => {
    const creator = creators.find((c) => c.id === creatorId);
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!creator || !campaign) return;

    // Check if application already exists
    const existing = applications.find(
      (a) => a.creatorId === creatorId && a.campaignId === campaignId
    );
    if (existing) return;

    const newApp: ApplicationItem = {
      id: `app_${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      brandName: campaign.brandName,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      creatorAvatar: creator.avatar,
      platform: creator.platform,
      matchScore: creator.matchScore,
      proposedRate: creator.rateEstimate,
      deliverablesSummary: campaign.deliverables[0] || '1 Sponsored Video Integration',
      status: 'OFFER_RECEIVED',
      appliedAt: new Date().toISOString(),
      note: 'Invited directly by brand via CRAB Opportunity Engine',
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updatedApps));

    // Update campaign stats
    const updatedCmps = campaigns.map((c) =>
      c.id === campaignId ? { ...c, invitedCount: c.invitedCount + 1 } : c
    );
    setCampaigns(updatedCmps);
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updatedCmps));
  };

  const applyToCampaign = (campaignId: string, creatorId: string, note?: string) => {
    const creator = creators.find((c) => c.id === creatorId) || creators[0];
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const newApp: ApplicationItem = {
      id: `app_${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      brandName: campaign.brandName,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      creatorAvatar: creator.avatar,
      platform: creator.platform,
      matchScore: creator.matchScore,
      proposedRate: creator.rateEstimate,
      deliverablesSummary: campaign.deliverables[0] || '1 Dedicated Video Integration',
      status: 'SUBMITTED',
      appliedAt: new Date().toISOString(),
      note: note || 'Applied via Creator Opportunities feed.',
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updatedApps));

    const updatedCmps = campaigns.map((c) =>
      c.id === campaignId ? { ...c, appliedCount: c.appliedCount + 1 } : c
    );
    setCampaigns(updatedCmps);
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updatedCmps));
  };

  const updateApplicationStatus = (appId: string, status: ApplicationItem['status']) => {
    const updated = applications.map((a) =>
      a.id === appId ? { ...a, status } : a
    );
    setApplications(updated);
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
  };

  return {
    creators,
    campaigns,
    applications,
    loaded,
    toggleShortlist,
    addCampaign,
    inviteCreatorToCampaign,
    applyToCampaign,
    updateApplicationStatus,
  };
}
