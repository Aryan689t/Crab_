import { Router } from 'express';
import { getMe, registerOrSyncUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.get('/me', authenticateToken, getMe);
authRouter.post('/register', registerOrSyncUser);
authRouter.post('/sync', authenticateToken, registerOrSyncUser);
