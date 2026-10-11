import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getSupabaseAdminClient } from '../lib/supabase.js';
import { config } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'unconfigured';
  let pgvectorStatus = 'unconfigured';
  let supabaseStatus = getSupabaseAdminClient() ? 'configured' : 'unconfigured';

  if (config.databaseUrl) {
    try {
      // Test basic database connectivity
      await prisma.$queryRaw`SELECT 1 as health_check`;
      dbStatus = 'connected';

      // Check if pgvector extension is installed
      try {
        const result: any = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        pgvectorStatus = result.length > 0 ? 'available' : 'extension_not_found';
      } catch (vecErr) {
        pgvectorStatus = 'check_failed';
      }
    } catch (err: any) {
      dbStatus = `disconnected: ${err.message}`;
      pgvectorStatus = 'unavailable';
    }
  }

  res.status(200).json({
    status: 'ok',
    service: 'CRAB Backend API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    services: {
      database: dbStatus,
      pgvector: pgvectorStatus,
      supabaseAuth: supabaseStatus,
      geminiAi: config.gemini.apiKey ? 'configured' : 'unconfigured',
      razorpay: config.razorpay.keyId ? 'configured' : 'unconfigured',
    },
  });
});
