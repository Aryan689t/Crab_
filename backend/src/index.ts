import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateEnv } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// Parse configured origins (supports comma-separated list)
const configuredOrigins = (config.corsOrigin || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

// CORS configuration supporting preview and production Vercel deployments
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      if (
        allowedOrigins.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.includes('localhost:') ||
        requestOrigin.includes('127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${requestOrigin} not allowed by Access-Control-Allow-Origin`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/health' && req.originalUrl !== '/api/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root endpoint & health routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CRAB Backend API',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server when executed directly as main process
const isMainModule = process.argv[1]?.includes('index.ts') || process.argv[1]?.includes('dist\\index.js') || process.argv[1]?.includes('dist/index.js');
if (isMainModule && process.env.NODE_ENV !== 'test') {
  validateEnv();
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(config.port, HOST, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 CRAB Backend Server started successfully`);
    console.log(`📡 Host: ${HOST} | Port: ${config.port}`);
    console.log(`📡 URL: http://${HOST}:${config.port}`);
    console.log(`🩺 Health check: http://${HOST}:${config.port}/health`);
    console.log(`🛠️  Environment: ${config.nodeEnv}`);
    console.log(`==================================================\n`);
  });
}

export default app;
