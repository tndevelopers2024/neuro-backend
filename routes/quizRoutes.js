import express from 'express';
import { getTopicMCQs, submitQuizAttempt, getAdminMCQs, createMCQ, updateMCQ, deleteMCQ } from '../controllers/quizController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/topic/:topicSlug', getTopicMCQs);
router.post('/submit', authenticateUser, submitQuizAttempt);

// Admin endpoints
router.get('/admin/all', authenticateUser, requireAdmin, getAdminMCQs);
router.post('/', authenticateUser, requireAdmin, createMCQ);
router.put('/:id', authenticateUser, requireAdmin, updateMCQ);
router.delete('/:id', authenticateUser, requireAdmin, deleteMCQ);

export default router;
