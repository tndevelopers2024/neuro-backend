import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolves the uploads storage directory.
 * Priority:
 * 1. process.env.UPLOAD_DIR (custom path, e.g. /home/u123456789/uploads_persistent)
 * 2. If in production or on hosting: path.resolve(__dirname, '../../uploads_storage') (outside git repository)
 * 3. Local fallback: path.resolve(__dirname, '../uploads')
 */
export const getUploadsDir = () => {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }

  // If running in production (e.g. Hostinger, Render, VPS), store outside the git working tree
  // so git pulls, checkouts, and reset --hard never wipe uploaded files
  if (process.env.NODE_ENV === 'production' || process.env.PERSISTENT_UPLOADS === 'true') {
    return path.resolve(__dirname, '../../uploads_storage');
  }

  // In development, default to local server/uploads
  return path.resolve(__dirname, '../uploads');
};

export const UPLOADS_DIR = getUploadsDir();

/**
 * Initializes upload directories and creates subfolders.
 * Also migrates any existing legacy files from server/uploads if needed.
 */
export const ensureUploadDirs = () => {
  const subfolders = ['videos', 'pdfs', 'images', 'resources'];

  // Ensure target upload directory and subfolders exist
  subfolders.forEach((sub) => {
    const dir = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const localUploads = path.resolve(__dirname, '../uploads');
  // Ensure local uploads directory exists as well
  subfolders.forEach((sub) => {
    const dir = path.join(localUploads, sub);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // If UPLOADS_DIR is external (outside git), copy any existing files from localUploads to UPLOADS_DIR
  if (UPLOADS_DIR !== localUploads && fs.existsSync(localUploads)) {
    try {
      subfolders.forEach((sub) => {
        const srcSub = path.join(localUploads, sub);
        const destSub = path.join(UPLOADS_DIR, sub);
        if (fs.existsSync(srcSub)) {
          const files = fs.readdirSync(srcSub);
          files.forEach((file) => {
            const srcFile = path.join(srcSub, file);
            const destFile = path.join(destSub, file);
            if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
              fs.copyFileSync(srcFile, destFile);
              console.log(`[Storage Migration] Preserved ${file} -> ${destSub}`);
            }
          });
        }
      });
    } catch (err) {
      console.warn('[Storage Migration] Note:', err.message);
    }
  }
};
