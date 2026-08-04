import Flashcard from '../models/Flashcard.js';
import Topic from '../models/Topic.js';
import RecentActivity from '../models/RecentActivity.js';
import LearningProgress from '../models/LearningProgress.js';

export const getFlashcardsByTopic = async (req, res, next) => {
  try {
    const filter = {};
    if (req.params.topicSlug && req.params.topicSlug !== 'all') {
      const topic = await Topic.findOne({ slug: req.params.topicSlug });
      if (topic) {
        filter.topic = topic._id;
        if (req.user) {
          await RecentActivity.create({
            user: req.user._id,
            title: `Reviewed Flashcards: ${topic.title}`,
            subtitle: `Active memory drill and term recall`,
            link: `/flashcards/${topic.slug}`,
            type: 'Flashcard',
            icon: 'Layers',
          });
        }
      }
    }
    const flashcards = await Flashcard.find(filter).populate('topic', 'title slug color').sort({ displayOrder: 1 });
    res.status(200).json({ success: true, count: flashcards.length, flashcards });
  } catch (error) {
    next(error);
  }
};

// Admin operations
export const createFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.create(req.body);
    res.status(201).json({ success: true, flashcard });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcard = async (req, res, next) => {
  try {
    const card = await Flashcard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Flashcard not found' });
    res.status(200).json({ success: true, message: 'Flashcard deleted successfully' });
  } catch (error) {
    next(error);
  }
};
