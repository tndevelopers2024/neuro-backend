import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import StudyMaterial from '../models/StudyMaterial.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import LearningProgress from '../models/LearningProgress.js';

// @desc    Get complete metrics array for Admin Dashboard (Screen 21)
// @route   GET /api/admin/stats
export const getAdminDashboardStats = async (req, res, next) => {
  try {
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
      mostCompleted
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
    ]);

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
      recentlyAddedContent: recentMaterials.map((m) => ({
        id: m._id,
        title: m.title,
        type: m.type,
        topic: m.topic?.title || 'Unassigned',
        date: m.createdAt,
      })),
      mostCompletedTopics: [
        { title: 'History of ASD', category: 'Child Psychiatry', completionRate: '96%', studentsCount: 142 },
        { title: 'Etiology & Genetics', category: 'Child Psychiatry', completionRate: '88%', studentsCount: 118 },
        { title: 'Clinical Features of ADHD', category: 'Child Psychiatry', completionRate: '84%', studentsCount: 94 },
        { title: 'Pharmacological Management', category: 'Psychopharmacology', completionRate: '79%', studentsCount: 86 },
      ],
    });
  } catch (error) {
    next(error);
  }
};
