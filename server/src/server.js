require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const lessonRoutes = require('./routes/lesson.routes');
const quizRoutes = require('./routes/quiz.routes');
const forumRoutes = require('./routes/forum.routes');
const progressRoutes = require('./routes/progress.routes');
const paymentRoutes = require('./routes/payment.routes');
const certificateRoutes = require('./routes/certificate.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - Very relaxed for demo stability
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000, // Very high limit for demos
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return process.env.NODE_ENV === 'development' || req.path === '/api/health';
  },
  handler: (req, res) => {
    console.log('⚠️  Rate limit hit for:', req.ip);
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mfa', require('./routes/mfa.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/admin', adminRoutes);

// Root route - Welcome message
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to TechBridge LMS API',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      authentication: '/api/auth',
      courses: '/api/courses',
      lessons: '/api/lessons',
      quizzes: '/api/quizzes',
      assignments: '/api/assignments',
      forums: '/api/forums',
      certificates: '/api/certificates'
    },
    repository: 'https://github.com/bianca255/techbridge-lms',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      docs: 'See GitHub repository for full API documentation'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Initialize scheduled tasks
    try {
      const { startScheduledTasks } = require('./utils/scheduledTasks');
      startScheduledTasks();
    } catch (error) {
      console.error('⚠️  Scheduled tasks initialization error:', error.message);
    }
    
    // Initialize backup scheduler
    try {
      const { scheduleBackups } = require('./utils/backup');
      scheduleBackups();
    } catch (error) {
      console.error('⚠️  Backup scheduler initialization error:', error.message);
    }
  })
  .catch((err) => {
    console.error('⚠️  MongoDB connection error (retrying...):', err.message);
    // Don't exit - keep trying to reconnect
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techbridge');
    }, 5000);
  });

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections - LOG BUT DON'T CRASH
process.on('unhandledRejection', (err) => {
  console.error('⚠️  UNHANDLED REJECTION (continuing):', err.message);
  // Don't exit - keep server running for demo stability
});

// Handle uncaught exceptions - LOG BUT DON'T CRASH  
process.on('uncaughtException', (err) => {
  console.error('⚠️  UNCAUGHT EXCEPTION (continuing):', err.message);
  // Don't exit - keep server running for demo stability
});

// Graceful shutdown on SIGTERM/SIGINT
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
