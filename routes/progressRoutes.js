import express from 'express';
import { updateProgress, getStudentProgressStats } from '../controllers/progressController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.post('/update', updateProgress);
router.get('/me', getStudentProgressStats);

export default router;
