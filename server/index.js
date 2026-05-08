// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const rateLimit = require('express-rate-limit');
// const morgan = require('morgan');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const logger = require('./utils/logger');
// const errorHandler = require('./middleware/errorHandler');
// const initSocket = require('./socket');

// // Route imports
// const authRoutes = require('./routes/auth');
// const alertRoutes = require('./routes/alerts');
// const volunteerRoutes = require('./routes/volunteers');
// const reviewRoutes = require('./routes/reviews');

// // Connect Database
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// // Attach io to app for use in controllers
// app.set('io', io);

// // Security middleware
// app.use(helmet());
// app.use(mongoSanitize());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 200,
//   message: { success: false, message: 'Too many requests, please try again later.' },
// });
// app.use('/api', limiter);

// // Stricter limiter for auth routes
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   message: { success: false, message: 'Too many auth attempts, please try again later.' },
// });

// // CORS
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
// }));

// // Body parsing
// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'SafeReach API' });
// });

// // API Routes
// app.use('/api/auth', authLimiter, authRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/volunteers', volunteerRoutes);
// app.use('/api/reviews', reviewRoutes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
// });

// // Global error handler
// app.use(errorHandler);

// // Initialize Socket.io handlers
// initSocket(io);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   logger.info(`🛡️  SafeReach server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   logger.error(`Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// module.exports = { app, server, io };























const express = require('express');
const http = require('http');

const { Server } = require('socket.io');

const cors = require('cors');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const rateLimit = require('express-rate-limit');

const morgan = require('morgan');

require('dotenv').config();

const connectDB = require('./config/db');

const logger = require('./utils/logger');

const errorHandler = require('./middleware/errorHandler');

const initSocket = require('./socket');

// Route imports
const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const volunteerRoutes = require('./routes/volunteers');
const reviewRoutes = require('./routes/reviews');

// Connect Database
connectDB();

const app = express();

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',

    methods: ['GET', 'POST'],

    credentials: true,
  },
});

// Attach io to app
app.set('io', io);

// =========================
// Security middleware
// =========================
app.use(helmet());

app.use(mongoSanitize());

// =========================
// Rate limiting
// =========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  message: {
    success: false,
    message:
      'Too many requests, please try again later.',
  },
});

app.use('/api', limiter);

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  message: {
    success: false,
    message:
      'Too many auth attempts, please try again later.',
  },
});

// =========================
// CORS
// =========================
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',

    credentials: true,
  })
);

// =========================
// Body parsing
// =========================

// Increased because multipart forms + webcam data
app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// =========================
// Logging
// =========================
if (
  process.env.NODE_ENV ===
  'development'
) {
  app.use(morgan('dev'));
}

// =========================
// Health check
// =========================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',

    timestamp: new Date().toISOString(),

    service: 'SafeReach API',
  });
});

// =========================
// API Routes
// =========================
app.use(
  '/api/auth',
  authLimiter,
  authRoutes
);

app.use(
  '/api/alerts',
  alertRoutes
);

app.use(
  '/api/volunteers',
  volunteerRoutes
);

app.use(
  '/api/reviews',
  reviewRoutes
);

// =========================
// 404 handler
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,

    message: `Route ${req.originalUrl} not found`,
  });
});

// =========================
// Global error handler
// =========================
app.use(errorHandler);

// =========================
// Initialize Socket.io
// =========================
initSocket(io);

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(
    `🛡️ SafeReach server running on port ${PORT} [${
      process.env.NODE_ENV ||
      'development'
    }]`
  );
});

// =========================
// Handle unhandled rejections
// =========================
process.on(
  'unhandledRejection',
  (err) => {
    logger.error(
      `Unhandled Rejection: ${err.message}`
    );

    server.close(() =>
      process.exit(1)
    );
  }
);

module.exports = {
  app,
  server,
  io,
};