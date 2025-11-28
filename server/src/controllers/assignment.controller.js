const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/response');
const { createAuditLog, getIPAddress } = require('../utils/auditLogger');

// Get all assignments for a course
exports.getAssignmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ 
      course: courseId, 
      isPublished: true 
    }).sort('dueDate');

    // Check submission status for each assignment if user is a student
    if (req.user.role === 'student') {
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await AssignmentSubmission.findOne({
            assignment: assignment._id,
            student: req.user.id
          });

          return {
            ...assignment.toObject(),
            submitted: !!submission,
            submissionStatus: submission?.status,
            grade: submission?.grade?.adjustedScore
          };
        })
      );

      return successResponse(res, 200, { assignments: assignmentsWithStatus }, 'Assignments retrieved successfully');
    }

    successResponse(res, 200, { assignments }, 'Assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single assignment
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title instructor');

    if (!assignment) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check if user is enrolled (students only)
    if (req.user.role === 'student') {
      const course = await Course.findById(assignment.course._id);
      if (!course.enrolledStudents.includes(req.user.id)) {
        return errorResponse(res, 403, 'You must be enrolled in this course to view this assignment');
      }

      // Get user's submission if exists
      const submission = await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: req.user.id
      });

      return successResponse(res, 200, { assignment, submission }, 'Assignment retrieved successfully');
    }

    successResponse(res, 200, { assignment }, 'Assignment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create assignment (Teacher/Admin)
exports.createAssignment = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to add assignments to this course');
    }

    const assignment = await Assignment.create(req.body);

    // Create audit log
    await createAuditLog({
      user: req.user._id,
      action: 'assignment_create',
      resourceType: 'Assignment',
      resourceId: assignment._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    successResponse(res, 201, { assignment }, 'Assignment created successfully');
  } catch (error) {
    next(error);
  }
};

// Update assignment (Teacher/Admin)
exports.updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && assignment.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this assignment');
    }

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Create audit log
    await createAuditLog({
      user: req.user._id,
      action: 'assignment_update',
      resourceType: 'Assignment',
      resourceId: assignment._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    successResponse(res, 200, { assignment }, 'Assignment updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete assignment (Teacher/Admin)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && assignment.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this assignment');
    }

    await assignment.deleteOne();

    // Create audit log
    await createAuditLog({
      user: req.user._id,
      action: 'assignment_delete',
      resourceType: 'Assignment',
      resourceId: assignment._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    successResponse(res, 200, {}, 'Assignment deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Submit assignment (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: assignment._id,
      student: req.user.id
    });

    if (existingSubmission && existingSubmission.status !== 'resubmission_requested') {
      return errorResponse(res, 400, 'Assignment already submitted');
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    // Calculate if late and days late
    const isLate = now > dueDate;
    let daysLate = 0;
    
    if (isLate) {
      daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      
      // Reject if more than maxLateDays (7 days per SRS)
      if (daysLate > assignment.maxLateDays) {
        return errorResponse(
          res, 
          400, 
          `Assignment is too late. Maximum late submission period is ${assignment.maxLateDays} days.`
        );
      }
    }

    const submissionData = {
      assignment: assignment._id,
      student: req.user.id,
      course: assignment.course,
      textContent: req.body.textContent,
      isLate,
      daysLate
    };

    // Handle file uploads (TODO: integrate with actual file upload service)
    if (req.body.files) {
      submissionData.submittedFiles = req.body.files;
    }

    const submission = await AssignmentSubmission.create(submissionData);

    // Calculate late penalty
    submission.calculateLatePenalty(assignment);
    await submission.save();

    // Create audit log
    await createAuditLog({
      user: req.user._id,
      action: 'assignment_submit',
      resourceType: 'Assignment',
      resourceId: assignment._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success',
      details: {
        isLate,
        daysLate,
        latePenalty: submission.latePenaltyApplied
      }
    });

    successResponse(res, 201, { submission }, 'Assignment submitted successfully');
  } catch (error) {
    next(error);
  }
};

// Grade assignment (Teacher/Admin)
exports.gradeAssignment = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { rawScore, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignment')
      .populate('course');

    if (!submission) {
      return errorResponse(res, 404, 'Submission not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && submission.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to grade this submission');
    }

    // Validate score
    if (rawScore < 0 || rawScore > 100) {
      return errorResponse(res, 400, 'Score must be between 0 and 100');
    }

    submission.grade = {
      rawScore,
      feedback,
      gradedBy: req.user.id,
      gradedAt: new Date()
    };

    submission.calculateAdjustedScore();
    submission.status = 'graded';
    await submission.save();

    // Create audit log
    await createAuditLog({
      user: req.user._id,
      action: 'assignment_grade',
      resourceType: 'Assignment',
      resourceId: submission.assignment._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success',
      details: {
        student: submission.student,
        rawScore,
        adjustedScore: submission.grade.adjustedScore,
        latePenalty: submission.latePenaltyApplied
      }
    });

    successResponse(res, 200, { submission }, 'Assignment graded successfully');
  } catch (error) {
    next(error);
  }
};

// Get submissions for an assignment (Teacher/Admin)
exports.getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId).populate('course');

    if (!assignment) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && assignment.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to view submissions for this assignment');
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'username email firstName lastName')
      .sort('-submittedAt');

    successResponse(res, 200, { submissions }, 'Submissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
