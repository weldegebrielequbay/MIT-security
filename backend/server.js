import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import laptopRoutes from './routes/laptopRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection using local fallback if URI is not provided
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laptop_registration';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to', MONGO_URI))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/laptops', laptopRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
