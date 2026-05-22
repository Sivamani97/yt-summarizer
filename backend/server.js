require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
app.set('trust proxy', 1);
// ── Database ──────────────────────────────────────────
connectDB();

// ── Security ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disabled for API server
}));

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Rate Limiting ─────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/admin/health',
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute window
  max: 8,                      // 8 analyses per minute
  message: { success: false, message: 'Too many analysis requests. Please wait a moment.' },
  keyGenerator: (req) => req.user?.id || req.ip,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 auth attempts per window
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ── Body Parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request Timing & Logging ─────────────────────────
app.use((req, res, next) => {
  req._startTime = Date.now();
  res.on('finish', () => {
    if (process.env.NODE_ENV === 'development') {
      logger.api(req.method, req.originalUrl, res.statusCode, Date.now() - req._startTime);
    }
  });
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check (root) ───────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VidBrain API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/admin', require('./routes/admin'));

// Apply analysis rate limiter after auth middleware parses user
app.use('/api/videos/analyze', analysisLimiter);

// ── 404 & Error Handlers ──────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  logger.success(`\n╔════════════════════════════════════════╗`);
  logger.success(`║       VidBrain API Server Started       ║`);
  logger.success(`╠════════════════════════════════════════╣`);
  logger.info   (`║  Port       : ${String(PORT).padEnd(25)}║`);
  logger.info   (`║  Env        : ${(process.env.NODE_ENV || 'development').padEnd(25)}║`);
  logger.info   (`║  Health     : http://localhost:${PORT}/health `.padEnd(42) + `║`);
  logger.info   (`║  API        : http://localhost:${PORT}/api    `.padEnd(42) + `║`);
  logger.success(`╚════════════════════════════════════════╝\n`);
});

// ── Graceful Shutdown ─────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.warn(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
