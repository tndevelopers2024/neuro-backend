import express from 'express';
import { updateProgress, getStudentProgressStats, getItemProgress } from '../controllers/progressController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.post('/update', updateProgress);
router.get('/me', getStudentProgressStats);
router.get('/item/:materialId', getItemProgress);

export default router;
