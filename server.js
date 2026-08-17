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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Ensure storage upload folder hierarchy exists
const uploadDirs = ['uploads/videos', 'uploads/pdfs', 'uploads/images', 'uploads/resources'];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
