import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import laptopRoutes from './routes/laptopRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// --- Security Headers ---
app.use(helmet());

// --- CORS ---
app.use(cors());

// --- Body Parser ---
app.use(express.json({ limit: '10kb' })); // reject oversized payloads

// --- NoSQL Injection Prevention + Input Sanitizer ---
// Sanitizes req.body and req.params: strips keys starting with '$' or containing '.'
// and trims whitespace from all string values.
// Note: req.query is intentionally skipped (Express 5 read-only getter).
// Query params in search routes are already regex-escaped before use.
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim();
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]); // recurse for nested objects
    }
  }
  return obj;
};
const sanitizeInputs = (req, _res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  next();
};
app.use(sanitizeInputs);

// --- Rate Limiting ---
// Strict limit on auth endpoints (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // max 30 requests per window per IP
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// MongoDB connection using local fallback if URI is not provided
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laptop_registration';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to', MONGO_URI))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
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
