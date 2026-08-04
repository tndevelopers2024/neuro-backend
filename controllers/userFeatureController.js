import Bookmark from '../models/Bookmark.js';
import PersonalNote from '../models/PersonalNote.js';
import RecentActivity from '../models/RecentActivity.js';

// --- Bookmarks ---
export const getBookmarks = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type && req.query.type !== 'All') {
      filter.targetType = req.query.type;
    }
    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookmarks.length, bookmarks });
  } catch (error) {
    next(error);
  }
};

export const addBookmark = async (req, res, next) => {
  try {
    const { targetType, targetId, title, subtitle, link, icon } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { user: req.user._id, targetId },
      { user: req.user._id, targetType, targetId, title, subtitle, link, icon },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, bookmark });
  } catch (error) {
    next(error);
  }
};

export const deleteBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Bookmark removed successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Personal Notes ---
export const getMyNotes = async (req, res, next) => {
  try {
    const notes = await PersonalNote.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: notes.length, notes });
  } catch (error) {
    next(error);
  }
};

export const createPersonalNote = async (req, res, next) => {
  try {
    const note = await PersonalNote.create({ ...req.body, user: req.user._id });
    await RecentActivity.create({
      user: req.user._id,
      title: `Authored Note: ${note.title}`,
      subtitle: `Private study synthesis and clinical reflections`,
      link: `/my-notes`,
      type: 'Notes',
      icon: 'Edit3',
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const updatePersonalNote = async (req, res, next) => {
  try {
    const note = await PersonalNote.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const deletePersonalNote = async (req, res, next) => {
  try {
    await PersonalNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Personal study note deleted successfully' });
  } catch (error) {
    next(error);
  }
};
