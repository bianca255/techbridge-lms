const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAssignmentsByCourse,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getSubmissions
} = require('../controllers/assignment.controller');

// Public/Student routes
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignment);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);

// Teacher/Admin routes
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);
router.put('/submissions/:submissionId/grade', protect, authorize('teacher', 'admin'), gradeAssignment);
router.get('/:assignmentId/submissions', protect, authorize('teacher', 'admin'), getSubmissions);

module.exports = router;
