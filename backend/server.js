const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendanceDb';
const LOCAL_URI = 'mongodb://localhost:27017/attendanceDb';

let isConnecting = false;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (mongoose.connection.readyState === 1) return;
  }

  isConnecting = true;
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB via primary URI');
  } catch (err) {
    console.error('Failed to connect to primary MongoDB URI:', err.message);
    if (process.env.NODE_ENV !== 'production' && DB_URI !== LOCAL_URI) {
      console.log('Attempting fallback to local MongoDB:', LOCAL_URI);
      try {
        await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 3000 });
        console.log('Connected to local MongoDB successfully');
      } catch (localErr) {
        console.error('Failed to connect to local MongoDB:', localErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  } finally {
    isConnecting = false;
  }
}

// Initial connection attempt
connectDB().catch(err => {
  console.warn('Initial MongoDB connection error (will retry on incoming requests):', err.message);
});

// Middleware to ensure DB connection before handling API requests
app.use(async (req, res, next) => {
  if (req.path.endsWith('/health')) return next();
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({
        message: 'Database unavailable. Please check your connection or MONGO_URI environment variable.',
        error: err.message
      });
    }
  }
  next();
});

// Routes
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use(['/api/students', '/students'], studentRoutes);
app.use(['/api/attendance', '/attendance'], attendanceRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => res.json({
  status: 'ok',
  dbConnected: mongoose.connection.readyState === 1
}));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

