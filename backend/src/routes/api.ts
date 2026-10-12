import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { creatorRouter } from './creators.js';
import { brandRouter } from './brands.js';
import { campaignRouter } from './campaigns.js';
import { socialRouter } from './social.js';
import { applicationRouter } from './applications.js';
import { conversationRouter } from './conversations.js';
import { requestRouter } from './requests.js';
import { collaborationRouter } from './collaborations.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/creators', creatorRouter);
apiRouter.use('/brands', brandRouter);
apiRouter.use('/campaigns', campaignRouter);
apiRouter.use('/social', socialRouter);
apiRouter.use('/applications', applicationRouter);
apiRouter.use('/application', applicationRouter);
apiRouter.use('/collaborations', collaborationRouter);
apiRouter.use('/conversations', conversationRouter);
apiRouter.use('/conversation', conversationRouter);
apiRouter.use('/requests', requestRouter);
apiRouter.use('/invitations', requestRouter);

// Base route for API metadata
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CRAB API — Creators Reaching Aligned Brands',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      auth: {
        me: '/api/auth/me',
        register: '/api/auth/register',
      },
      creators: {
        me: '/api/creators/me',
        profile: '/api/creators/profile',
        metrics: '/api/creators/me/metrics',
        content: '/api/creators/me/content',
        intelligence: '/api/creators/me/intelligence',
        byId: '/api/creators/:creatorId',
      },
      social: {
        accounts: '/api/social/accounts',
        connect: '/api/social/:platform/connect',
        sync: '/api/social/accounts/:socialAccountId/sync',
      },
      brands: {
        me: '/api/brands/me',
        profile: '/api/brands/profile',
        byId: '/api/brands/:brandId',
      },
    },
  });
});
