import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Material must be affiliated with a specific Topic'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide material title'],
      trim: true,
    },
    description: {
      type: String,
      default: 'In-depth clinical exploration, differential evaluations, and treatment modalities.',
    },
    type: {
      type: String,
      enum: ['VIDEO', 'NOTES', 'PDF', 'MCQ', 'FLASHCARD', 'RESOURCE'],
      required: true,
      index: true,
    },
    videoUrl: {
      type: String, // Streamable URL or /uploads/videos/filename.mp4
    },
    fileUrl: {
      type: String, // PDF or document path in /uploads/pdfs
    },
    richTextContent: {
      type: String, // Full formatted HTML/markdown lecture content with tables and clinical pearls
    },
    thumbnail: {
      type: String,
      default: 'https://placehold.co/600x400/E9F2FF/126BEE?text=Study+Material',
    },
    duration: {
      type: String,
      default: '15 min',
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ topic: 1, type: 1, displayOrder: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
