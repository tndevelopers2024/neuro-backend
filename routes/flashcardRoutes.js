import express from 'express';
import { getFlashcardsByTopic, createFlashcard, deleteFlashcard } from '../controllers/flashcardController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:topicSlug', getFlashcardsByTopic);
router.post('/', authenticateUser, requireAdmin, createFlashcard);
router.delete('/:id', authenticateUser, requireAdmin, deleteFlashcard);

export default router;
