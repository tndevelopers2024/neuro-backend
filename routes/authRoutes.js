import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
