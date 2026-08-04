import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: 6,
      select: false, // Never return password hashes in standard queries
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    medicalCollege: {
      type: String,
      default: 'NeuroMind Institute of Medical Sciences',
    },
    course: {
      type: String,
      default: 'Residency in Psychiatry & Neurology',
    },
    year: {
      type: String,
      default: 'PG Year 2',
    },
    specialization: {
      type: String,
      default: 'General & Child Psychiatry',
    },
    studyStreak: {
      type: Number,
      default: 7,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to test candidate password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
