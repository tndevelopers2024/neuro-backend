import mongoose from 'mongoose';
import slugify from 'slugify';

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide topic title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: 'Comprehensive clinical evidence and assessment criteria.',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Topic must belong to a Subject'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Topic must belong to a Category'],
      index: true,
    },
    parentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null, // Null represents top-level branches under a category
      index: true,
    },
    level: {
      type: Number,
      default: 1, // 1: Category Branch (e.g. Neurodevelopmental), 2: Sub-disease (e.g. ASD), 3: Lesson/Subtopic (e.g. History of ASD)
    },
    icon: {
      type: String,
      default: 'BookOpen', // Lucide icon name
    },
    color: {
      type: String,
      default: '#7435D5', // Purple or accent hex
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    mapPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
  },
  { timestamps: true }
);

topicSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    // Generate unique slug by combining title and timestamp or keeping clean if unique
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Indexing for ultra-fast parent-child hierarchy tree assembly
topicSchema.index({ category: 1, parentTopic: 1, displayOrder: 1 });

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
