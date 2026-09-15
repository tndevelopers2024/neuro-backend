import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload
router.post('/', authenticateUser, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  let subfolder = 'resources';
  if (req.file.mimetype.startsWith('video/')) subfolder = 'videos';
  else if (req.file.mimetype === 'application/pdf') subfolder = 'pdfs';
  else if (req.file.mimetype.startsWith('image/')) subfolder = 'images';

  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
  
  res.status(200).json({
    success: true,
    url: fileUrl,
    message: 'File uploaded successfully',
  });
});

export default router;
