import mongoose from 'mongoose';
import Laptop from './models/Laptop.js';
import User from './models/UserModel.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/laptop_registration';

async function verify() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const laptop = await Laptop.findOne().populate('studentId', 'name');
  const guard = await User.findOne({ email: 'guard_test@mu.edu.et' });

  if (!laptop || !guard) {
    console.log('Laptop or Guard not found');
    process.exit(1);
  }

  console.log('Using Laptop:', laptop.brand, 'ID:', laptop._id);
  console.log('Using Guard:', guard.name, 'ID:', guard._id);

  const prevStatus = laptop.locationStatus;
  const newStatus = prevStatus === 'In Campus' ? 'Out of Campus' : 'In Campus';

  console.log(`Simulating update: ${prevStatus} -> ${newStatus}`);
  
  laptop.locationStatus = newStatus;
  laptop.lastVerifiedBy = guard._id;
  await laptop.save();

  const updatedLaptop = await Laptop.findById(laptop._id).populate('lastVerifiedBy', 'name');
  
  console.log('Verified result:', {
    locationStatus: updatedLaptop.locationStatus,
    lastVerifiedBy: updatedLaptop.lastVerifiedBy ? updatedLaptop.lastVerifiedBy.name : 'None'
  });

  if (updatedLaptop.lastVerifiedBy && updatedLaptop.lastVerifiedBy.name === guard.name) {
    console.log('VERIFICATION SUCCESS: lastVerifiedBy correctly set and populated.');
  } else {
    console.log('VERIFICATION FAILED: lastVerifiedBy not correctly set.');
  }

  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
