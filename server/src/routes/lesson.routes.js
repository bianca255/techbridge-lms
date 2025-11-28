const express = require('express');
const { body } = require('express-validator');
const {
  getLessonsByCourse,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson
} = require('../controllers/lesson.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createLessonValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('course').notEmpty().withMessage('Course ID is required'),
  body('order').isNumeric().withMessage('Order must be a number')
];

// All routes require authentication
router.use(protect);

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLesson);
router.post('/', authorize('teacher', 'admin'), createLessonValidation, validate, createLesson);
router.put('/:id', authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', authorize('teacher', 'admin'), deleteLesson);
router.post('/:id/complete', completeLesson);

module.exports = router;
