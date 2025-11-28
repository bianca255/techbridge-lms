const express = require('express');
const {
  getTeacherDashboard,
  getCourseStudentPerformance
} = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Teacher dashboard analytics
router.get('/teacher/dashboard', authorize('teacher', 'admin'), getTeacherDashboard);
router.get('/teacher/course/:courseId/students', authorize('teacher', 'admin'), getCourseStudentPerformance);

module.exports = router;
