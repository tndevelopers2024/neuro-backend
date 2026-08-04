import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['Topic', 'Category', 'StudyMaterial', 'Note', 'Resource'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    link: { type: String, required: true },
    icon: { type: String, default: 'Bookmark' },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, targetId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
