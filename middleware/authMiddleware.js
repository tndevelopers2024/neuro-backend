import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neuromind_super_secret_jwt_key_2026_clinical_platform');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized - User account not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized - Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Forbidden - Requires administrator credentials' });
  }
};
