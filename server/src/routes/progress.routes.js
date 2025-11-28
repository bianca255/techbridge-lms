const express = require('express');
const {
  getCourseProgress,
  getMyProgress,
  getCourseAnalytics,
  getStudentAnalytics,
  getDashboardStats,
  getLeaderboard
} = require('../controllers/progress.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/my', getMyProgress);
router.get('/dashboard', getDashboardStats);
router.get('/leaderboard', getLeaderboard);
router.get('/course/:courseId', getCourseProgress);
router.get('/analytics/course/:courseId', authorize('teacher', 'admin'), getCourseAnalytics);
router.get('/analytics/student/:studentId', authorize('teacher', 'admin'), getStudentAnalytics);

module.exports = router;
