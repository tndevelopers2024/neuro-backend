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
    type: {
      type: String,
      enum: ['SINGLE', 'MULTIPLE', 'MATRIX'],
      default: 'SINGLE',
    },
    question: {
      type: String,
      required: [true, 'Please provide question stem'],
    },
    optionA: { type: String },
    optionB: { type: String },
    optionC: { type: String },
    optionD: { type: String },
    correctAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
    },
    correctAnswers: {
      type: [String],
    },
    matrixLeft: [{
      id: String,
      text: String,
    }],
    matrixRight: [{
      id: String,
      text: String,
    }],
    matrixMatches: [{
      leftId: String,
      rightId: String,
    }],
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
