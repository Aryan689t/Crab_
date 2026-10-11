import { Router } from 'express';
import { getMe, register, login, registerOrSyncUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticateToken, getMe);
authRouter.post('/sync', authenticateToken, registerOrSyncUser);
