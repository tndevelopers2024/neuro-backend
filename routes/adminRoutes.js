import express from 'express';
import { getAdminDashboardStats } from '../controllers/adminController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateUser, requireAdmin, getAdminDashboardStats);

export default router;
