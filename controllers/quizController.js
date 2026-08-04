import MCQ from '../models/MCQ.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Topic from '../models/Topic.js';
import LearningProgress from '../models/LearningProgress.js';
import RecentActivity from '../models/RecentActivity.js';
import { getTopicBreadcrumbs } from '../services/mindMapService.js';

// @desc    Get topic MCQs for Student Quiz Player
// @route   GET /api/quiz/topic/:topicSlug
export const getTopicMCQs = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.topicSlug });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const mcqs = await MCQ.find({ topic: topic._id });
    const breadcrumbs = await getTopicBreadcrumbs(topic.slug);

    res.status(200).json({
      success: true,
      count: mcqs.length,
      topic: { _id: topic._id, title: topic.title, slug: topic.slug },
      mcqs: mcqs.map((q) => ({
        _id: q._id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        // Notice: explanations & answers can be checked client side or evaluated on submit
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
      breadcrumbs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt & save score
// @route   POST /api/quiz/submit
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { topicId, totalQuestions, correctAnswers, timeTakenSeconds } = req.body;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      topic: topicId,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      scorePercentage,
      timeTakenSeconds,
    });

    const topic = await Topic.findById(topicId);
    if (topic) {
      // Record in Recent Activity
      await RecentActivity.create({
        user: req.user._id,
        title: `Completed MCQ Quiz: ${topic.title}`,
        subtitle: `Score: ${scorePercentage}% (${correctAnswers}/${totalQuestions} correct)`,
        link: `/quiz/${topic.slug}`,
        type: 'MCQ',
        icon: 'CheckCircle2',
      });

      // Update learning progress
      await LearningProgress.findOneAndUpdate(
        { user: req.user._id, topic: topic._id, materialType: 'MCQ' },
        {
          progressPercentage: 100,
          completed: scorePercentage >= 60, // Passed if >= 60%
          lastAccessedAt: new Date(),
          completedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ success: true, attempt, scorePercentage });
  } catch (error) {
    next(error);
  }
};

// --- Admin MCQ Management ---
export const getAdminMCQs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.topic) filter.topic = req.query.topic;
    const mcqs = await MCQ.find(filter).populate('topic', 'title slug').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: mcqs.length, mcqs });
  } catch (error) {
    next(error);
  }
};

export const createMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.create(req.body);
    res.status(201).json({ success: true, mcq });
  } catch (error) {
    next(error);
  }
};

export const deleteMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);
    if (!mcq) return res.status(404).json({ success: false, message: 'MCQ not found' });
    res.status(200).json({ success: true, message: 'MCQ deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mcq) return res.status(404).json({ success: false, message: 'MCQ not found' });
    res.status(200).json({ success: true, mcq });
  } catch (error) {
    next(error);
  }
};
