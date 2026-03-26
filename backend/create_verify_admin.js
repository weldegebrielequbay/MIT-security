import mongoose from 'mongoose';
import User from './models/UserModel.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/laptop_registration';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin_verify@mu.edu.et';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Verify Admin',
    universityId: 'ADMIN999',
    email: adminEmail,
    password: 'password123',
    role: 'admin'
  });

  console.log('Verify Admin created');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
