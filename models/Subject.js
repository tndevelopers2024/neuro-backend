import mongoose from 'mongoose';
import slugify from 'slugify';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: 'Comprehensive clinical knowledge architecture and learning pathways.',
    },
    icon: {
      type: String,
      default: 'Brain', // Lucide icon identifier
    },
    themeColor: {
      type: String,
      default: '#126BEE', // Primary Blue
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

subjectSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
