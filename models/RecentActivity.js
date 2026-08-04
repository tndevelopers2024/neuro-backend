import mongoose from 'mongoose';

const recentActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: 'Interactive Clinical Study' },
    link: { type: String, required: true },
    type: {
      type: String,
      enum: ['Topic', 'Video', 'Notes', 'MCQ', 'Flashcard', 'Resource'],
      default: 'Topic',
    },
    icon: { type: String, default: 'Clock' },
    accessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

recentActivitySchema.index({ user: 1, accessedAt: -1 });

const RecentActivity = mongoose.model('RecentActivity', recentActivitySchema);
export default RecentActivity;
