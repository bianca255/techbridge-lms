const express = require('express');
const { body } = require('express-validator');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  addReview,
  getMyCourses,
  getTeacherCourses
} = require('../controllers/course.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createCourseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('duration').isNumeric().withMessage('Duration must be a number')
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
];

// Public routes (with optional auth)
router.get('/', optionalAuth, getAllCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.use(protect);

router.get('/my/enrolled', getMyCourses);
router.get('/my/teaching', authorize('teacher', 'admin'), getTeacherCourses);
router.post('/', authorize('teacher', 'admin'), createCourseValidation, validate, createCourse);
router.put('/:id', authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', enrollCourse);
router.post('/:id/unenroll', unenrollCourse);
router.post('/:id/review', reviewValidation, validate, addReview);

module.exports = router;
