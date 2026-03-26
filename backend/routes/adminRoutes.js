import express from 'express';
import Laptop from '../models/Laptop.js';
import User from '../models/UserModel.js';
import Activity from '../models/Activity.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Count only laptops owned by students
    const studentUsers = await User.find({ role: 'student' }).select('_id');
    const studentUserIds = studentUsers.map(u => u._id);
    
    const totalStudentLaptops = await Laptop.countDocuments({ studentId: { $in: studentUserIds } });
    const laptopsInCampus = await Laptop.countDocuments({ 
      studentId: { $in: studentUserIds },
      locationStatus: 'In Campus' 
    });
    const laptopsOutCampus = await Laptop.countDocuments({ 
      studentId: { $in: studentUserIds },
      locationStatus: 'Out of Campus' 
    });
    
    const totalStudents = studentUserIds.length;
    const totalGuards = await User.countDocuments({ role: 'guard' });

    res.json({
      totalLaptops: totalStudentLaptops, // Important: Count only student registries
      laptopsInCampus,
      laptopsOutCampus,
      totalStudents,
      totalGuards
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Search users for ID correction
// @route   GET /api/admin/users/search
// @access  Private (Admin)
router.get('/users/search', protect, authorize('admin'), async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) return res.json([]);
    
    console.log(`Searching for users with query: "${query}"`);
    // Escape regex special characters (like slashes in IDs)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const users = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: escapedQuery, $options: 'i' } },
        { universityId: { $regex: escapedQuery, $options: 'i' } }
      ]
    }).select('-password').limit(15);
    
    console.log(`Found ${users.length} matching students`);
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update user university ID
// @route   PATCH /api/admin/users/:id/universityId
// @access  Private (Admin)
router.patch('/users/:id/universityId', protect, authorize('admin'), async (req, res) => {
  console.log(`Admin ${req.user.name} attempting to update ID for user ${req.params.id} to ${req.body.universityId}`);
  try {
    const { universityId } = req.body;
    if (!universityId) {
      return res.status(400).json({ message: 'University ID is required' });
    }

    // Check if ID is already taken
    const idExists = await User.findOne({ universityId });
    if (idExists && idExists._id.toString() !== req.params.id) {
      console.log(`Update failed: ID ${universityId} already taken by ${idExists.name}`);
      return res.status(400).json({ message: 'This University ID is already assigned to another user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(`Update failed: User ${req.params.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    user.universityId = universityId;
    await user.save();
    console.log(`Successfully updated ID for ${user.name}`);

    res.json({ message: 'University ID updated successfully', user });
  } catch (error) {
    console.error('ID Update Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private (Admin)
router.get('/activities', protect, authorize('admin'), async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('laptopId', 'brand model serialNumber')
      .populate('studentId', 'name universityId')
      .populate('guardId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
