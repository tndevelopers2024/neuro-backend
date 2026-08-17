import express from 'express';
import { addComment, getMaterialComments } from '../controllers/commentController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, addComment);
router.get('/material/:materialId', authenticateUser, requireAdmin, getMaterialComments);

export default router;
