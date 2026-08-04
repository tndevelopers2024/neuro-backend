import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema(
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
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
    },
    materialType: {
      type: String,
      enum: ['VIDEO', 'NOTES', 'PDF', 'MCQ', 'FLASHCARD', 'RESOURCE', 'TOPIC_GENERAL'],
      required: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastPosition: {
      type: Number, // Video timestamp in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

learningProgressSchema.index({ user: 1, topic: 1, materialType: 1 });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
export default LearningProgress;
