import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userFeatureRoutes from './routes/userFeatureRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import annotationRoutes from './routes/annotationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { ensureUploadDirs, UPLOADS_DIR } from './config/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Ensure persistent storage upload folder hierarchy exists and migrate existing files
ensureUploadDirs();

// Dynamic CORS configuration to allow Vercel, Netlify, Render, and local development seamlessly with authentication credentials
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static routing for media files and uploaded PDF/Video assets
// 1. Primary persistent storage (immune to git auto-deploy and git resets)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

// 2. Fallback to local uploads folder if different from UPLOADS_DIR
const localUploads = path.join(__dirname, 'uploads');
if (localUploads !== UPLOADS_DIR) {
  app.use('/uploads', express.static(localUploads));
  app.use('/api/uploads', express.static(localUploads));
}

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userFeatureRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

// Platform Health & Root Uptime Monitoring (Render, AWS, Vercel)
app.get(['/', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'OK', service: 'NeuroMind Scholars API', timestamp: new Date() });
});
app.head(['/', '/api/health'], (req, res) => {
  res.status(200).end();
});
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[NeuroMind Server] Running in development mode on http://localhost:${PORT}`);
});
