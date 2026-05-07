import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, universityId, email, password, role, department } = req.body;

    // --- Server-side Validation ---
    const ALLOWED_ROLES = ['student', 'guard', 'admin'];
    if (!name || !universityId || !password || !role) {
      return res.status(400).json({ message: 'Name, University ID, password, and role are required.' });
    }
    if (name.length > 100) {
      return res.status(400).json({ message: 'Name must be 100 characters or fewer.' });
    }
    if (universityId.length > 50) {
      return res.status(400).json({ message: 'University ID must be 50 characters or fewer.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password must be 128 characters or fewer.' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid account type.' });
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
      }
      if (email.length > 254) {
        return res.status(400).json({ message: 'Email address is too long.' });
      }
    }

    const orConditions = [{ universityId }];
    if (email && email.trim() !== '') {
      orConditions.push({ email });
    }
    const userExists = await User.findOne({ $or: orConditions });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      universityId,
      email: (email && email.trim() !== '') ? email.trim() : undefined,
      password,
      role,
      department: role === 'student' ? (department || '') : '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        universityId: user.universityId,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { universityId, password } = req.body;

    // --- Validation ---
    if (!universityId || !password) {
      return res.status(400).json({ message: 'University ID and password are required.' });
    }
    if (universityId.length > 50 || password.length > 128) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = await User.findOne({ universityId }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        universityId: user.universityId,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid ID or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // --- Validation ---
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
    if (newPassword.length > 128) {
      return res.status(400).json({ message: 'New password is too long.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      return res.status(401).json({ message: 'Invalid current password.' });
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode).json({ message: error.message });
  }
});

export default router;
