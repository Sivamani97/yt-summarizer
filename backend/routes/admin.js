const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Video = require('../models/Video');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/health  (public)
router.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'unknown',
    },
    memory: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// GET /api/admin/stats  (admin only)
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, totalVideos, completedVideos, failedVideos] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Video.countDocuments({ status: 'completed' }),
      Video.countDocuments({ status: 'failed' }),
    ]);

    const recentUsers = await User.find()
      .select('name email createdAt totalVideosAnalyzed')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers },
        videos: {
          total: totalVideos,
          completed: completedVideos,
          failed: failedVideos,
          successRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
