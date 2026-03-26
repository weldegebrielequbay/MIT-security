import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  laptopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laptop',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['Checked In', 'Checked Out'],
    required: true,
  },
  locationStatus: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
