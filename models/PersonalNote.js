import mongoose from 'mongoose';

const personalNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide title for personal study note'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide study note text content'],
    },
    relatedTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      index: true,
    },
    topicTitle: {
      type: String,
      default: 'General Study Synthesis',
    },
  },
  { timestamps: true }
);

const PersonalNote = mongoose.model('PersonalNote', personalNoteSchema);
export default PersonalNote;
