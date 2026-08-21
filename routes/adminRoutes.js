import express from 'express';
import { getAdminDashboardStats, getUsers } from '../controllers/adminController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateUser, requireAdmin, getAdminDashboardStats);
router.get('/users', authenticateUser, requireAdmin, getUsers);

export default router;
