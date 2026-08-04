import express from 'express';
import { getAllSubjects, getSubjectBySlug, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllSubjects);
router.get('/:slug', getSubjectBySlug);
router.get('/:slug/categories', getSubjectBySlug);

// Admin exclusive routes
router.post('/', authenticateUser, requireAdmin, createSubject);
router.put('/:id', authenticateUser, requireAdmin, updateSubject);
router.delete('/:id', authenticateUser, requireAdmin, deleteSubject);

export default router;
