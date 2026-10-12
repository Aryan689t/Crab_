import { Router } from 'express';
import {
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/auth.js';

export const applicationRouter = Router();

// Retrieve specific application details
applicationRouter.get('/:id', authenticateToken, getApplicationById);

// Update application status (Brand accepts/declines, or Creator withdraws)
applicationRouter.patch('/:id', authenticateToken, updateApplicationStatus);
applicationRouter.patch('/:id/status', authenticateToken, updateApplicationStatus);
