import express from 'express';
import { getTopicMaterials, getMaterialById, getAdminMaterials, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/topic/:topicSlug', getTopicMaterials);
router.get('/:id', getMaterialById);

// Admin Material Management & Multi-format File Uploads
router.get('/admin/all', authenticateUser, requireAdmin, getAdminMaterials);
router.post('/upload', authenticateUser, requireAdmin, upload.single('file'), createMaterial);
router.put('/:id', authenticateUser, requireAdmin, upload.single('file'), updateMaterial);
router.delete('/:id', authenticateUser, requireAdmin, deleteMaterial);

export default router;
