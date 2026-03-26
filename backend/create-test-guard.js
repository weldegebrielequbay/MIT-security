import mongoose from 'mongoose';
import User from './models/UserModel.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/laptop_registration';

async function createGuard() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const guardEmail = 'guard_test@mu.edu.et';
  const existingGuard = await User.findOne({ email: guardEmail });

  if (existingGuard) {
    console.log('Guard already exists:', guardEmail);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const guard = await User.create({
    name: 'Test Guard',
    universityId: 'G12345',
    email: guardEmail,
    password: 'password123', // The model hook will hash it if we use User.create and the model has the hook
    role: 'guard'
  });

  console.log('Test Guard created:', guard.email, '(password: password123)');
  process.exit(0);
}

createGuard().catch(err => {
  console.error(err);
  process.exit(1);
});
