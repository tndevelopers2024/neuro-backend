import LearningProgress from '../models/LearningProgress.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import StudyMaterial from '../models/StudyMaterial.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Flashcard from '../models/Flashcard.js';
import PersonalNote from '../models/PersonalNote.js';
import Bookmark from '../models/Bookmark.js';
import RecentActivity from '../models/RecentActivity.js';

// @desc    Update progress for a specific lesson/video/note (Auto complete at 90%+)
// @route   POST /api/progress/update
export const updateProgress = async (req, res, next) => {
  try {
    const { topicId, materialId, materialType, progressPercentage, lastPosition } = req.body;

    const isComplete = progressPercentage >= 90;

    const updateData = {
      progressPercentage: Math.min(progressPercentage, 100),
      completed: isComplete,
      lastPosition: lastPosition || 0,
      lastAccessedAt: new Date(),
    };
    if (isComplete) updateData.completedAt = new Date();

    const filter = { user: req.user._id, topic: topicId, materialType };
    if (materialId) filter.material = materialId;

    const progress = await LearningProgress.findOneAndUpdate(filter, updateData, { upsert: true, new: true });

    // Log recent activity
    const topic = await Topic.findById(topicId);
    if (topic && isComplete) {
      await RecentActivity.create({
        user: req.user._id,
        title: `Completed ${materialType}: ${topic.title}`,
        subtitle: `Mastered 100% of study content`,
        link: `/topic/${topic.slug}`,
        type: materialType === 'VIDEO' ? 'Video' : 'Notes',
        icon: materialType === 'VIDEO' ? 'PlayCircle' : 'FileText',
      });
    }

    res.status(200).json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress and saved resume timestamp for a specific study material
// @route   GET /api/progress/item/:materialId
export const getItemProgress = async (req, res, next) => {
  try {
    const progress = await LearningProgress.findOne({
      user: req.user._id,
      material: req.params.materialId,
    });
    res.status(200).json({
      success: true,
      lastPosition: progress ? progress.lastPosition : 0,
      progressPercentage: progress ? progress.progressPercentage : 0,
      completed: progress ? progress.completed : false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic progress metrics for student Sidebar and Dashboard
// @route   GET /api/progress/me
export const getStudentProgressStats = async (req, res, next) => {
  try {
    const totalPublishedTopics = await Topic.countDocuments({ status: 'published' });
    const totalMaterials = await StudyMaterial.countDocuments({ status: 'published' });
    
    // Count user completed items
    const completedProgressItems = await LearningProgress.countDocuments({
      user: req.user._id,
      completed: true,
    });
    
    // Count distinct explored topics
    const exploredTopicsCount = await LearningProgress.distinct('topic', { user: req.user._id });
    
    const notesCount = await PersonalNote.countDocuments({ user: req.user._id });
    const flashcardsCount = await Flashcard.countDocuments();
    const quizzesCount = await QuizAttempt.countDocuments({ user: req.user._id });
    const bookmarksCount = await Bookmark.countDocuments({ user: req.user._id });
    
    // Dynamic percentage calculation formula
    let calculatedPercentage = 0;
    if (totalPublishedTopics > 0) {
      // Base on ratio of completed topics & items
      const actualRatio = Math.round((exploredTopicsCount.length / (totalPublishedTopics || 1)) * 100);
      calculatedPercentage = exploredTopicsCount.length > 0 ? Math.min(100, Math.max(actualRatio, 25)) : 0;
    }

    // Recent learning items
    const recentActivity = await RecentActivity.find({ user: req.user._id })
      .sort({ accessedAt: -1 })
      .limit(12);

    // Fetch dynamic shortcuts
    const firstCategory = await Category.findOne({ status: 'published' }).populate('subject');
    const firstTopic = await Topic.findOne({ status: 'published' });
    const firstMaterial = await StudyMaterial.findOne({ status: 'published' }).populate('topic');

    const recommendedShortcuts = {
      orbit: firstCategory ? { title: firstCategory.name, link: `/learn/${firstCategory.subject?.slug || 'subject'}/${firstCategory.slug}` } : null,
      map: firstTopic ? { title: firstTopic.title, link: `/topic/${firstTopic.slug}` } : null,
      video: firstMaterial ? { title: firstMaterial.title, link: `/lesson/${firstMaterial.topic?.slug || 'topic'}` } : null,
    };

    res.status(200).json({
      success: true,
      stats: {
        progressPercentage: calculatedPercentage,
        topicsExplored: exploredTopicsCount.length,
        totalTopics: totalPublishedTopics,
        notesCreated: notesCount,
        flashcardsAvailable: flashcardsCount,
        quizzesTaken: quizzesCount,
        bookmarksCount,
        studyStreak: req.user.studyStreak || 0,
      },
      recentActivity,
      recommendedShortcuts,
    });
  } catch (error) {
    next(error);
  }
};
