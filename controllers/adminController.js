import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import StudyMaterial from '../models/StudyMaterial.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import LearningProgress from '../models/LearningProgress.js';
import RecentActivity from '../models/RecentActivity.js';

// @desc    Get complete metrics array for Admin Dashboard (Screen 21)
// @route   GET /api/admin/stats
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalStudents,
      totalSubjects,
      totalCategories,
      totalTopics,
      totalVideos,
      totalNotes,
      totalMCQs,
      totalFlashcards,
      recentMaterials,
      mostCompleted,
      totalInteractions,
      interactionTrendRaw
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Subject.countDocuments(),
      Category.countDocuments(),
      Topic.countDocuments(),
      StudyMaterial.countDocuments({ type: 'VIDEO' }),
      StudyMaterial.countDocuments({ type: { $in: ['NOTES', 'PDF'] } }),
      MCQ.countDocuments(),
      Flashcard.countDocuments(),
      StudyMaterial.find().populate('topic', 'title').sort({ createdAt: -1 }).limit(6),
      LearningProgress.find({ completed: true }).populate('topic', 'title slug').limit(5),
      RecentActivity.countDocuments(),
      RecentActivity.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const interactionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = interactionTrendRaw.find(item => item._id === dateStr);
      interactionTrend.push({ name: dayName, value: found ? found.count : 0 });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalSubjects,
        totalCategories,
        totalTopics,
        totalVideos,
        totalNotes,
        totalMCQs,
        totalResources: totalFlashcards + totalNotes + totalVideos,
      },
      totalInteractions,
      interactionTrend,
      recentlyAddedContent: recentMaterials.map((m) => ({
        id: m._id,
        title: m.title,
        type: m.type,
        topic: m.topic?.title || 'Unassigned',
        date: m.createdAt,
      })),
      mostCompletedTopics: mostCompleted.map(progress => ({
        title: progress.topic?.title || 'Unknown Topic',
        category: 'Clinical Module', 
        completionRate: '100%', 
        studentsCount: 1 // Ideally this would aggregate how many students completed it, but for now we keep the structure
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users for Admin panel
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};
