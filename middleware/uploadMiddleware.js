import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Custom disk storage engine routing files into organized subfolders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos');
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'uploads/pdfs');
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images');
    } else {
      cb(null, 'uploads/resources');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter restricting safe educational file extensions
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid upload format (${file.mimetype}). Supported formats: MP4, PDF, DOCX, JPG, PNG, WEBP.`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max per upload for lectures
  fileFilter,
});
