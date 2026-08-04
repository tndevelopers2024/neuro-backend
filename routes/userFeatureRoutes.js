import express from 'express';
import { getBookmarks, addBookmark, deleteBookmark, getMyNotes, createPersonalNote, updatePersonalNote, deletePersonalNote } from '../controllers/userFeatureController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

// Bookmarks
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', addBookmark);
router.delete('/bookmarks/:id', deleteBookmark);

// Personal Study Notes
router.get('/notes', getMyNotes);
router.post('/notes', createPersonalNote);
router.put('/notes/:id', updatePersonalNote);
router.delete('/notes/:id', deletePersonalNote);

export default router;
