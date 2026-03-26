import mongoose from 'mongoose';
import User from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laptop_registration';
console.log('Using MONGO_URI:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    try {
      const user = await User.findOne({});
      console.log('User found:', user);
      console.log('Finished');
      process.exit(0);
    } catch (e) {
      console.error('Error during query:', e);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Connection Error:', err);
    process.exit(1);
  });
