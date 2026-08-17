import express from 'express';
import { getAnnotations, saveAnnotations } from '../controllers/annotationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:materialId')
  .get(authenticateUser, getAnnotations)
  .post(authenticateUser, saveAnnotations);

export default router;
