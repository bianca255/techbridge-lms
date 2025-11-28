const express = require('express');
const { body } = require('express-validator');
const {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizAttempts
} = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createQuizValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('course').notEmpty().withMessage('Course ID is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('passingScore').isNumeric().withMessage('Passing score must be a number')
];

const submitQuizValidation = [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('startedAt').optional().isISO8601().withMessage('Invalid date format')
];

// All routes require authentication
router.use(protect);

router.get('/course/:courseId', getQuizzesByCourse);
router.get('/:id', getQuiz);
router.get('/:id/attempts', getQuizAttempts);
router.post('/', authorize('teacher', 'admin'), createQuizValidation, validate, createQuiz);
router.put('/:id', authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', authorize('teacher', 'admin'), deleteQuiz);
router.post('/:id/submit', submitQuizValidation, validate, submitQuiz);

module.exports = router;
