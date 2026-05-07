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
  department: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});



// Middleware to hash the password before saving
// NOTE: In Mongoose 7+, async pre-hooks must NOT declare/call next — Kareem awaits the promise
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // returning resolves the promise — Kareem moves to the next hook
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // async function resolves automatically — no next() needed
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
