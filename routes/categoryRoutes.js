import express from 'express';
import { getAllCategories, getCategoryBySlug, getAdminCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/admin/all', authenticateUser, requireAdmin, getAdminCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/:subjectSlug/:categorySlug/branches', getCategoryBySlug);

// Admin operations
router.post('/', authenticateUser, requireAdmin, createCategory);
router.put('/:id', authenticateUser, requireAdmin, updateCategory);
router.delete('/:id', authenticateUser, requireAdmin, deleteCategory);

export default router;
