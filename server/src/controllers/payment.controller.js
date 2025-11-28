const { successResponse } = require('../utils/response');

// Placeholder for future payment integration

// Get payment methods
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = [
      { id: 'stripe', name: 'Credit/Debit Card', enabled: false },
      { id: 'paypal', name: 'PayPal', enabled: false },
      { id: 'flutterwave', name: 'Flutterwave', enabled: false },
      { id: 'paystack', name: 'Paystack', enabled: false }
    ];

    successResponse(res, 200, { methods }, 'Payment methods retrieved (placeholder)');
  } catch (error) {
    next(error);
  }
};

// Process payment (placeholder)
exports.processPayment = async (req, res, next) => {
  try {
    successResponse(res, 501, null, 'Payment processing not yet implemented');
  } catch (error) {
    next(error);
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    successResponse(res, 200, { payments: [] }, 'No payment history (placeholder)');
  } catch (error) {
    next(error);
  }
};

// Refund payment (placeholder)
exports.refundPayment = async (req, res, next) => {
  try {
    successResponse(res, 501, null, 'Refund processing not yet implemented');
  } catch (error) {
    next(error);
  }
};
