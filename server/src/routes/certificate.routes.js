const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth');

// Get user's certificates list
router.get('/my-certificates', protect, certificateController.getUserCertificates);

// Verify certificate (public route) - Must be before /:courseId to avoid route collision
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Download certificate for specific course
router.get('/:courseId', protect, certificateController.getCertificate);

module.exports = router;
