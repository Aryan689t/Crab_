import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';

export const uploadRouter = Router();

// Upload requires authenticated session
uploadRouter.post('/', authenticateToken, uploadImage);
uploadRouter.post('/poster', authenticateToken, uploadImage);
