import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import nodemailer from 'nodemailer';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'neuromind_super_secret_jwt_key_2026_clinical_platform', {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (upsert if exists)
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NeuroMind Scholars" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NeuroMind - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #126BEE;">Welcome to NeuroMind Scholars!</h2>
          <p>Please use the following One Time Password (OTP) to verify your email address and complete your registration:</p>
          <div style="background-color: #f4f7fc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0c2445;">${otpCode}</span>
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p>If you did not request this verification, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent to email successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new student or user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, medicalCollege, course, year, specialization, otp } = req.body;

    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields including OTP' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Verify OTP
    const storedOtp = await Otp.findOne({ email: email.toLowerCase() });
    if (!storedOtp) {
      return res.status(400).json({ success: false, message: 'OTP has expired or does not exist. Please request a new one.' });
    }
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP provided.' });
    }

    // OTP verified, create user
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

    // Delete OTP after successful registration
    await Otp.deleteOne({ email: email.toLowerCase() });

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

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password/send-otp
// @access  Public
export const sendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (upsert if exists)
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NeuroMind Scholars" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NeuroMind - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #126BEE;">Password Reset Request</h2>
          <p>You have requested to reset your password. Please use the following One Time Password (OTP) to proceed:</p>
          <div style="background-color: #f4f7fc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0c2445;">${otpCode}</span>
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset OTP sent to email successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/forgot-password/reset
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    // Verify OTP
    const storedOtp = await Otp.findOne({ email: email.toLowerCase() });
    if (!storedOtp) {
      return res.status(400).json({ success: false, message: 'OTP has expired or does not exist. Please request a new one.' });
    }
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP provided.' });
    }

    // OTP verified, update password
    user.password = newPassword;
    await user.save();

    // Delete OTP after successful reset
    await Otp.deleteOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
