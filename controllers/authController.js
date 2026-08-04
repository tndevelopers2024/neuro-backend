import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'neuromind_super_secret_jwt_key_2026_clinical_platform', {
    expiresIn: '30d',
  });
};

// @desc    Register a new student or user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, medicalCollege, course, year, specialization } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: role && ['student', 'admin'].includes(role) ? role : 'student',
      medicalCollege: medicalCollege || undefined,
      course: course || undefined,
      year: year || undefined,
      specialization: specialization || undefined,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        medicalCollege: user.medicalCollege,
        course: user.course,
        year: user.year,
        specialization: user.specialization,
        studyStreak: user.studyStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and return token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update study streak / last active
    user.lastActiveDate = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        medicalCollege: user.medicalCollege,
        course: user.course,
        year: user.year,
        specialization: user.specialization,
        studyStreak: user.studyStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile or password
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const { fullName, email, medicalCollege, course, year, specialization, profileImage, currentPassword, newPassword } = req.body;

    if (fullName) user.fullName = fullName;
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email address is already taken by another account' });
      }
      user.email = email.toLowerCase();
    }
    if (medicalCollege) user.medicalCollege = medicalCollege;
    if (course) user.course = course;
    if (year) user.year = year;
    if (specialization) user.specialization = specialization;
    if (profileImage) user.profileImage = profileImage;

    if (newPassword) {
      if (!currentPassword || !(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Please provide correct current password to update password' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        medicalCollege: user.medicalCollege,
        course: user.course,
        year: user.year,
        specialization: user.specialization,
        studyStreak: user.studyStreak,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
