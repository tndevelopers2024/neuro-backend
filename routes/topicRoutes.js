import express from 'express';
import { getTopicMindMap, getTopicsByParent, getAdminTopicTree, getAllTopics, createTopic, updateTopic, deleteTopic } from '../controllers/topicController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllTopics);
router.get('/children', getTopicsByParent);
router.get('/admin/tree', authenticateUser, requireAdmin, getAdminTopicTree);
router.get('/:slug/map', getTopicMindMap);
router.get('/slug/:slug/map', getTopicMindMap);

// Admin hierarchy modification endpoints
router.post('/', authenticateUser, requireAdmin, createTopic);
router.put('/:id', authenticateUser, requireAdmin, updateTopic);
router.delete('/:id', authenticateUser, requireAdmin, deleteTopic);

export default router;
