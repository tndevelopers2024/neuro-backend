import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    incorrectAnswers: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    timeTakenSeconds: { type: Number, default: 120 },
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
