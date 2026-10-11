'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from './supabase';
import { fetchApi } from './api';

export type UserRole = 'CREATOR' | 'BRAND';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  creatorId?: string | null;
  brandId?: string | null;
  displayName?: string;
  name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session in localStorage
    const savedToken = localStorage.getItem('crab_auth_token');
    const savedUser = localStorage.getItem('crab_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse cached user session:', err);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, selectedRole: UserRole = 'CREATOR') => {
    setLoading(true);
    try {
      let activeToken = `mock-${email.split('@')[0] || 'user'}-${selectedRole.toLowerCase()}`;

      // Bypass Supabase network call in local dev to prevent slow timeouts
      // User is immediately mocked
      console.warn('[AUTH] Supabase network login bypassed for instant local demo.');

      const userData: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        role: selectedRole,
        creatorId: selectedRole === 'CREATOR' ? `creator_${email.split('@')[0] || 'user'}` : null,
        brandId: selectedRole === 'BRAND' ? `brand_${email.split('@')[0] || 'user'}` : null,
        displayName: email.split('@')[0] || (selectedRole === 'CREATOR' ? 'Alex Chen' : 'Acme Brand'),
      };

      setToken(activeToken);
      setUser(userData);
      localStorage.setItem('crab_auth_token', activeToken);
      localStorage.setItem('crab_user', JSON.stringify(userData));

      if (selectedRole === 'CREATOR') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, role: UserRole) => {
    setLoading(true);
    try {
      const activeToken = `mock-${email.split('@')[0]}-${role.toLowerCase()}`;
      const userData: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        role,
        displayName: email.split('@')[0],
      };

      setToken(activeToken);
      setUser(userData);
      localStorage.setItem('crab_auth_token', activeToken);
      localStorage.setItem('crab_user', JSON.stringify(userData));

      if (role === 'CREATOR') {
        router.push('/onboarding/creator');
      } else {
        router.push('/onboarding/brand');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('crab_auth_token');
    localStorage.removeItem('crab_user');
    router.push('/login');
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('crab_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
