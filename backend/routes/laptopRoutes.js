import express from 'express';
import Laptop from '../models/Laptop.js';
import User from '../models/UserModel.js';
import Activity from '../models/Activity.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new laptop
// @route   POST /api/laptops
// @access  Private (Student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { brand, model, serialNumber, macAddress, color } = req.body;

    const laptopExists = await Laptop.findOne({ serialNumber });
    if (laptopExists) {
      res.status(400);
      throw new Error('Laptop with this serial number is already registered');
    }

    const laptop = await Laptop.create({
      studentId: req.user._id,
      brand,
      model,
      serialNumber,
      macAddress,
      color,
    });

    res.status(201).json(laptop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get logged in user's laptops
// @route   GET /api/laptops/mine
// @access  Private (Student)
router.get('/mine', protect, authorize('student'), async (req, res) => {
  try {
    const laptops = await Laptop.find({ studentId: req.user._id });
    res.json(laptops);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Search for a laptop (by Serial Number, MAC, or Student ID)
// @route   GET /api/laptops/search/:query
// @access  Private (Guard, Admin)
router.get('/search/:query', protect, authorize('guard', 'admin'), async (req, res) => {
  try {
    const query = req.params.query;

    // First try exact match on Serial Number or MAC
    let laptop = await Laptop.findOne({
      $or: [
        { serialNumber: { $regex: new RegExp(`^${query}$`, 'i') } },
        { macAddress: { $regex: new RegExp(`^${query}$`, 'i') } }
      ]
    }).populate('studentId', 'name universityId email')
      .populate('lastVerifiedBy', 'name');

    if (laptop) {
      return res.json([laptop]);
    }

    // If no exact laptop match, search by user universityId
    const user = await User.findOne({ universityId: { $regex: new RegExp(`^${query}$`, 'i') } });
    
    if (user) {
      const laptops = await Laptop.find({ studentId: user._id })
        .populate('studentId', 'name universityId email')
        .populate('lastVerifiedBy', 'name');
      return res.json(laptops);
    }

    res.json([]); // No results found
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update laptop location status
// @route   PUT /api/laptops/:id/location
// @access  Private (Guard, Admin)
router.put('/:id/location', protect, authorize('guard', 'admin'), async (req, res) => {
  console.log(`Received location update request for laptop ${req.params.id} to ${req.body.locationStatus}`);
  try {
    const { locationStatus } = req.body;
    
    if (!['In Campus', 'Out of Campus'].includes(locationStatus)) {
      return res.status(400).json({ message: 'Invalid location status' });
    }

    const laptop = await Laptop.findById(req.params.id);

    if (!laptop) {
      return res.status(404).json({ message: 'Laptop not found' });
    }

    laptop.locationStatus = locationStatus;
    laptop.lastVerifiedBy = req.user._id;
    const updatedLaptop = await laptop.save();
    
    // Explicitly populate studentId and lastVerifiedBy for the response
    await updatedLaptop.populate([
      { path: 'studentId', select: 'name universityId email' },
      { path: 'lastVerifiedBy', select: 'name' }
    ]);
    
    console.log(`Successfully updated laptop ${req.params.id} to ${locationStatus} by ${req.user.name}`);

    // Log Activity
    try {
      await Activity.create({
        laptopId: updatedLaptop._id,
        studentId: updatedLaptop.studentId,
        guardId: req.user._id,
        action: locationStatus === 'In Campus' ? 'Checked In' : 'Checked Out',
        locationStatus: locationStatus
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json(updatedLaptop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
