const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { generateCertificate, generateCertificateFilename } = require('../utils/certificateGenerator');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Generate and download certificate for completed course
 */
exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Find progress record
    const progress = await Progress.findOne({ 
      user: userId, 
      course: courseId,
      isCompleted: true,
      certificateIssued: true
    }).populate('course user');

    if (!progress) {
      return errorResponse(res, 'Certificate not available. Complete the course first.', 404);
    }

    // Get course details
    const course = await Course.findById(courseId).populate('instructor');

    // Generate certificate ID if not exists
    if (!progress.certificateId) {
      progress.certificateId = `CERT-${userId.toString().slice(-6).toUpperCase()}-${courseId.toString().slice(-6).toUpperCase()}-${Date.now()}`;
      await progress.save();
    }

    // Calculate final score (average of quiz scores)
    const avgScore = progress.completedQuizzes.length > 0
      ? Math.round(
          progress.completedQuizzes.reduce((sum, q) => sum + q.bestScore, 0) / 
          progress.completedQuizzes.length
        )
      : 100;

    // Generate PDF certificate
    const pdfBuffer = await generateCertificate({
      studentName: `${progress.user.firstName} ${progress.user.lastName}`,
      courseName: course.title,
      completionDate: progress.completedAt || progress.lastAccessedAt,
      certificateId: progress.certificateId,
      score: avgScore,
      instructorName: course.instructor 
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'TechBridge Team'
    });

    // Generate filename
    const filename = generateCertificateFilename(
      `${progress.user.firstName} ${progress.user.lastName}`,
      course.title
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    errorResponse(res, 'Failed to generate certificate', 500);
  }
};

/**
 * Verify certificate authenticity
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const progress = await Progress.findOne({ 
      certificateId,
      isCompleted: true,
      certificateIssued: true
    }).populate('user course');

    if (!progress) {
      return errorResponse(res, 'Certificate not found or invalid', 404);
    }

    successResponse(res, 'Certificate verified successfully', {
      certificate: {
        id: progress.certificateId,
        studentName: `${progress.user.firstName} ${progress.user.lastName}`,
        courseName: progress.course.title,
        completionDate: progress.completedAt || progress.lastAccessedAt,
        issuedDate: progress.certificateIssuedAt || progress.completedAt,
        isValid: true
      }
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    errorResponse(res, 'Failed to verify certificate', 500);
  }
};

/**
 * Get all user certificates
 */
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Progress.find({
      user: userId,
      isCompleted: true,
      certificateIssued: true
    })
    .populate('course', 'title thumbnail category')
    .select('course certificateId completedAt overallProgress')
    .sort('-completedAt');

    successResponse(res, 'Certificates retrieved successfully', {
      count: certificates.length,
      certificates: certificates.map(cert => ({
        id: cert.certificateId,
        course: cert.course,
        completionDate: cert.completedAt,
        progress: cert.overallProgress
      }))
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    errorResponse(res, 'Failed to retrieve certificates', 500);
  }
};
