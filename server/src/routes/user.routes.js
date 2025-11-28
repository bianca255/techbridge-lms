const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/stats', authorize('admin', 'teacher'), getUserStats);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
