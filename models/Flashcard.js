import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Flashcard must be linked to a Topic'],
      index: true,
    },
    frontTerm: {
      type: String,
      required: [true, 'Please provide question or medical term for front of card'],
    },
    backDefinition: {
      type: String,
      required: [true, 'Please provide answer or explanation for back of card'],
    },
    categoryTag: {
      type: String,
      default: 'Key Termology & Mechanism',
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
