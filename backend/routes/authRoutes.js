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
    const { name, universityId, email, password, role } = req.body;

    const orConditions = [{ universityId }];
    if (email && email.trim() !== '') {
      orConditions.push({ email });
    }
    const userExists = await User.findOne({ $or: orConditions });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      universityId,
      email,
      password,
      role: role || 'student', // default to student unless specified
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        universityId: user.universityId,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
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
    
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new passwords');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401);
      throw new Error('Invalid current password');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode).json({ message: error.message });
  }
});

export default router;
