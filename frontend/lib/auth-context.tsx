'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from './supabase';
import { fetchApi, invalidateApiCache } from './api';

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
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signup: (email: string, password?: string, role?: UserRole, displayName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Validate or restore session from backend on mount
  useEffect(() => {
    let isSubscribed = true;

    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('crab_auth_token');
      const savedUserStr = localStorage.getItem('crab_user');

      if (!savedToken) {
        if (isSubscribed) setLoading(false);
        return;
      }

      // Optimistically restore session instantly so pages render with zero lag
      if (savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          if (isSubscribed) {
            setUser(parsedUser);
            setToken(savedToken);
            setLoading(false);
          }
        } catch {
          // ignore parsing error
        }
      }

      try {
        if (isSubscribed) setToken(savedToken);
        // Call backend /api/auth/me (safely deduplicated by fetchApi) to verify real identity and load latest DB profile
        const res = await fetchApi<{ data: UserProfile }>('/api/auth/me', {}, savedToken);
        if (!isSubscribed) return;
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem('crab_user', JSON.stringify(res.data));
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        console.warn('[AUTH] Saved session expired or invalid:', err.message);
        localStorage.removeItem('crab_auth_token');
        localStorage.removeItem('crab_user');
        setToken(null);
        setUser(null);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const login = async (email: string, password = 'Password123!', selectedRole: UserRole = 'CREATOR') => {
    setLoading(true);
    try {
      // 1. Attempt real backend login
      const res = await fetchApi<{
        session?: { accessToken: string; refreshToken: string; expiresAt: number };
        user: UserProfile;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const activeToken = res.session?.accessToken;
      if (!activeToken) {
        throw new Error('Authentication did not return a valid session.');
      }

      const authenticatedUser: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role,
        creatorId: res.user.creatorId,
        brandId: res.user.brandId,
        displayName: res.user.displayName || email.split('@')[0],
      };

      setToken(activeToken);
      setUser(authenticatedUser);
      localStorage.setItem('crab_auth_token', activeToken);
      localStorage.setItem('crab_user', JSON.stringify(authenticatedUser));

      // Redirect based on actual verified role
      if (authenticatedUser.role === 'BRAND') {
        router.push('/brand/dashboard');
      } else {
        router.push('/creator/dashboard');
      }
    } catch (err: any) {
      console.error('[AUTH LOGIN ERROR]', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password = 'Password123!',
    role: UserRole = 'CREATOR',
    displayName?: string
  ) => {
    setLoading(true);
    try {
      const res = await fetchApi<{
        session?: { accessToken: string };
        requiresEmailConfirmation: boolean;
        user: UserProfile;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          role,
          displayName: displayName || email.split('@')[0],
        }),
      });

      if (res.requiresEmailConfirmation && !res.session?.accessToken) {
        throw new Error('Registration successful! Please check your email to confirm your account.');
      }

      const activeToken = res.session?.accessToken;
      if (!activeToken) {
        throw new Error('Registration did not return a session.');
      }

      const newUser: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role,
        creatorId: res.user.creatorId,
        brandId: res.user.brandId,
        displayName: displayName || email.split('@')[0],
      };

      setToken(activeToken);
      setUser(newUser);
      localStorage.setItem('crab_auth_token', activeToken);
      localStorage.setItem('crab_user', JSON.stringify(newUser));

      if (role === 'CREATOR') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    } catch (err: any) {
      console.error('[AUTH SIGNUP ERROR]', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    invalidateApiCache();
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

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetchApi<{ data: UserProfile }>('/api/auth/me', {}, token);
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('crab_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('[AUTH REFRESH FAILED]', err);
    }
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
        refreshUser,
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
