import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  social: {
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    instagramAppId: process.env.INSTAGRAM_APP_ID || '',
    instagramAppSecret: process.env.INSTAGRAM_APP_SECRET || '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/social/youtube/callback',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    webhookSecret: process.env.YOUTUBE_WEBHOOK_SECRET || '',
  },
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
};

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.anonKey && !config.supabase.serviceRoleKey) {
    missing.push('SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY)');
  }

  if (missing.length > 0) {
    console.warn(`\n⚠️  [ENV CONFIGURATION NOTICE]`);
    console.warn(`The following recommended environment variable(s) are not configured in backend/.env:`);
    missing.forEach((v) => console.warn(`   - ${v}`));
    console.warn(`Copy backend/.env.example to backend/.env and fill in your Supabase connection strings.\n`);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
