const express = require('express');
const { body } = require('express-validator');
const {
  setupMFA,
  verifyAndEnableMFA,
  verifyMFAToken,
  disableMFA
} = require('../controllers/mfa.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules
const verifyMFAValidation = [
  body('token').trim().isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
];

const disableMFAValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body('token').trim().isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
];

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/setup', authorize('admin'), setupMFA);
router.post('/verify-enable', authorize('admin'), verifyMFAValidation, validate, verifyAndEnableMFA);
router.post('/verify-token', verifyMFAValidation, validate, verifyMFAToken);
router.post('/disable', disableMFAValidation, validate, disableMFA);

module.exports = router;
