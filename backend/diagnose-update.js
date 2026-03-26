import mongoose from 'mongoose';
import Laptop from './models/Laptop.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/laptop_registration';

async function diagnose() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const laptop = await Laptop.findOne();
  if (!laptop) {
    console.log('No laptop found in database');
    process.exit(0);
  }

  console.log('Initial laptop state:', {
    id: laptop._id,
    brand: laptop.brand,
    locationStatus: laptop.locationStatus
  });

  const originalStatus = laptop.locationStatus || 'In Campus';
  const newStatus = originalStatus === 'In Campus' ? 'In Campus' : 'Out of Campus';

  console.log(`Updating locationStatus to: ${newStatus}...`);
  laptop.locationStatus = newStatus;
  await laptop.save();

  const updatedLaptop = await Laptop.findById(laptop._id);
  console.log('Updated laptop state:', {
    id: updatedLaptop._id,
    brand: updatedLaptop.brand,
    locationStatus: updatedLaptop.locationStatus
  });

  if (updatedLaptop.locationStatus === newStatus) {
    console.log('Update SUCCEEDED in database');
  } else {
    console.log('Update FAILED in database');
  }

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
