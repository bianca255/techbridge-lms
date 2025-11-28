const express = require('express');
const { body } = require('express-validator');
const {
  getForumsByCourse,
  getForum,
  createForum,
  updateForum,
  deleteForum,
  addReply,
  likeForum,
  likeReply,
  pinForum,
  lockForum
} = require('../controllers/forum.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createForumValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('course').notEmpty().withMessage('Course ID is required')
];

const replyValidation = [
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes require authentication
router.use(protect);

router.get('/course/:courseId', getForumsByCourse);
router.get('/:id', getForum);
router.post('/', createForumValidation, validate, createForum);
router.put('/:id', updateForum);
router.delete('/:id', deleteForum);
router.post('/:id/reply', replyValidation, validate, addReply);
router.post('/:id/like', likeForum);
router.post('/:id/reply/:replyId/like', likeReply);
router.put('/:id/pin', authorize('teacher', 'admin'), pinForum);
router.put('/:id/lock', authorize('teacher', 'admin'), lockForum);

module.exports = router;
