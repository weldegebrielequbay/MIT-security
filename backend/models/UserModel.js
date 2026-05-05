import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  universityId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: function() { return this.role !== 'guard'; },
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'guard', 'admin'],
    default: 'student',
  },
}, {
  timestamps: true,
});

// Middleware to unset empty email for guards to allow sparse index to work
userSchema.pre('validate', function(next) {
  if (this.role === 'guard' && (!this.email || this.email.trim() === '')) {
    this.email = undefined;
  }
  next();
});

// Middleware to hash the password before saving
userSchema.pre('save', async function hashPassword() {
  console.log('-> DB HOOK: Hashing password in User.js v3.1');
  if (!this.isModified('password')) {
    console.log('-> DB HOOK: Password not modified skipping.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('-> DB HOOK: Password hashed successfully.');
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
