import mongoose from 'mongoose';

const documentAnnotationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial', // Or just an ID string if it's external, but we'll use ObjectId
      required: true,
      index: true,
    },
    drawings: {
      type: mongoose.Schema.Types.Mixed, // Storing dynamic object where keys are page numbers
      default: {},
    },
  },
  { timestamps: true }
);

// Ensure a user only has one annotation document per material
documentAnnotationSchema.index({ user: 1, materialId: 1 }, { unique: true });

const DocumentAnnotation = mongoose.model('DocumentAnnotation', documentAnnotationSchema);
export default DocumentAnnotation;
