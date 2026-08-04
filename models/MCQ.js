import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'MCQ must belong to a Topic'],
      index: true,
    },
    subtopic: {
      type: String,
      default: 'General Diagnostic Criteria',
    },
    question: {
      type: String,
      required: [true, 'Please provide question stem'],
    },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: [true, 'Please specify correct option letter'],
    },
    explanation: {
      type: String,
      required: [true, 'Please provide educational clinical rationale'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Clinical Case'],
      default: 'Medium',
    },
  },
  { timestamps: true }
);

const MCQ = mongoose.model('MCQ', mcqSchema);
export default MCQ;
