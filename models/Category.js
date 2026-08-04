import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Category must belong to a Subject'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: 'Core diagnostic, therapeutic, and neurobiological foundations.',
    },
    icon: {
      type: String,
      default: 'Activity', // Lucide icon identifier
    },
    color: {
      type: String,
      default: '#13A7B5', // Cyan or accent color hex
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

categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
