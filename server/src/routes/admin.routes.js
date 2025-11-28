const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard', protect, authorize('admin'), adminController.getAdminDashboard);

// User management
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.get('/users/:userId', protect, authorize('admin'), adminController.getUserDetails);
router.put('/users/:userId/role', protect, authorize('admin'), adminController.updateUserRole);
router.put('/users/:userId/toggle-status', protect, authorize('admin'), adminController.toggleUserStatus);
router.delete('/users/:userId', protect, authorize('admin'), adminController.deleteUser);
router.post('/users/:userId/reset-password', protect, authorize('admin'), adminController.resetUserPassword);

// Platform statistics
router.get('/stats', protect, authorize('admin'), adminController.getPlatformStats);

module.exports = router;
