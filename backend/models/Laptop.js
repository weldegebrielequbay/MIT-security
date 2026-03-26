import mongoose from 'mongoose';

const laptopSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  macAddress: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'reported_lost', 'inactive'],
    default: 'active',
  },
  locationStatus: {
    type: String,
    enum: ['In Campus', 'Out of Campus'],
    default: 'In Campus',
  },
  lastVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Laptop = mongoose.model('Laptop', laptopSchema);
export default Laptop;
