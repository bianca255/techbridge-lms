const express = require('express');
const {
  getPaymentMethods,
  processPayment,
  getPaymentHistory,
  refundPayment
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/methods', getPaymentMethods);
router.post('/process', processPayment);
router.get('/history', getPaymentHistory);
router.post('/refund/:id', authorize('admin'), refundPayment);

module.exports = router;
