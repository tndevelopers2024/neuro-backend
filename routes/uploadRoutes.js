import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload
router.post('/', authenticateUser, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  // Convert Windows backslashes to forward slashes for the URL
  const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
  
  res.status(200).json({
    success: true,
    url: fileUrl,
    message: 'File uploaded successfully',
  });
});

export default router;
