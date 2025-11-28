const Course = require('../models/Course');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// Get comprehensive teacher dashboard analytics
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // Get all courses by this teacher
    const courses = await Course.find({ instructor: teacherId });
    const courseIds = courses.map(c => c._id);

    // Get total enrolled students across all courses
    const totalEnrollments = await Progress.countDocuments({
      course: { $in: courseIds }
    });

    // Get active students (accessed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeStudents = await Progress.countDocuments({
      course: { $in: courseIds },
      lastAccessedAt: { $gte: thirtyDaysAgo }
    });

    // Get completion rate
    const completedCourses = await Progress.countDocuments({
      course: { $in: courseIds },
      isCompleted: true
    });
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedCourses / totalEnrollments) * 100) 
      : 0;

    // Get average quiz scores per course
    const courseStats = await Promise.all(courses.map(async (course) => {
      const enrollments = await Progress.countDocuments({ course: course._id });
      const completions = await Progress.countDocuments({ 
        course: course._id, 
        isCompleted: true 
      });

      // Get quiz attempts for this course
      const quizAttempts = await QuizAttempt.aggregate([
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quizData'
          }
        },
        {
          $unwind: '$quizData'
        },
        {
          $match: {
            'quizData.course': course._id
          }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            totalAttempts: { $sum: 1 }
          }
        }
      ]);

      // Get assignment submissions
      const assignmentSubmissions = await AssignmentSubmission.aggregate([
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentData'
          }
        },
        {
          $unwind: '$assignmentData'
        },
        {
          $match: {
            'assignmentData.course': course._id
          }
        },
        {
          $group: {
            _id: null,
            avgGrade: { $avg: '$grade' },
            totalSubmissions: { $sum: 1 },
            pendingGrading: {
              $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        courseId: course._id,
        courseName: course.title,
        enrollments,
        completions,
        completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
        avgQuizScore: quizAttempts[0]?.avgScore ? Math.round(quizAttempts[0].avgScore) : 0,
        totalQuizAttempts: quizAttempts[0]?.totalAttempts || 0,
        avgAssignmentGrade: assignmentSubmissions[0]?.avgGrade ? Math.round(assignmentSubmissions[0].avgGrade) : 0,
        totalSubmissions: assignmentSubmissions[0]?.totalSubmissions || 0,
        pendingGrading: assignmentSubmissions[0]?.pendingGrading || 0
      };
    }));

    // Get recent student activity
    const recentActivity = await Progress.find({
      course: { $in: courseIds }
    })
    .populate('user', 'firstName lastName email')
    .populate('course', 'title')
    .sort({ lastAccessedAt: -1 })
    .limit(10);

    // Get students needing attention (low progress, no recent activity)
    const studentsNeedingAttention = await Progress.find({
      course: { $in: courseIds },
      progress: { $lt: 30 },
      lastAccessedAt: { $lt: thirtyDaysAgo }
    })
    .populate('user', 'firstName lastName email')
    .populate('course', 'title')
    .limit(10);

    successResponse(res, 200, {
      summary: {
        totalCourses: courses.length,
        totalEnrollments,
        activeStudents,
        completionRate
      },
      courseStats,
      recentActivity: recentActivity.map(p => ({
        student: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        course: p.course.title,
        progress: p.progress,
        lastAccessed: p.lastAccessedAt
      })),
      studentsNeedingAttention: studentsNeedingAttention.map(p => ({
        student: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        course: p.course.title,
        progress: p.progress,
        lastAccessed: p.lastAccessedAt
      }))
    }, 'Teacher dashboard data retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// Get detailed student performance for a specific course
exports.getCourseStudentPerformance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    // Verify teacher owns this course
    const course = await Course.findOne({ _id: courseId, instructor: teacherId });
    if (!course) {
      return errorResponse(res, 404, 'Course not found or unauthorized');
    }

    // Get all students enrolled in this course
    const students = await Progress.find({ course: courseId })
      .populate('user', 'firstName lastName email')
      .sort({ progress: -1 });

    // Get detailed performance for each student
    const studentPerformance = await Promise.all(students.map(async (student) => {
      // Quiz performance
      const quizAttempts = await QuizAttempt.aggregate([
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quizData'
          }
        },
        {
          $unwind: '$quizData'
        },
        {
          $match: {
            'quizData.course': course._id,
            student: student.user._id
          }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            attempts: { $sum: 1 }
          }
        }
      ]);

      // Assignment performance
      const assignments = await AssignmentSubmission.aggregate([
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentData'
          }
        },
        {
          $unwind: '$assignmentData'
        },
        {
          $match: {
            'assignmentData.course': course._id,
            student: student.user._id
          }
        },
        {
          $group: {
            _id: null,
            avgGrade: { $avg: '$grade' },
            submitted: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        studentId: student.user._id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        enrolledAt: student.enrolledAt,
        progress: student.progress,
        lastAccessed: student.lastAccessedAt,
        completedLessons: student.completedLessons.length,
        quizAverage: quizAttempts[0]?.avgScore ? Math.round(quizAttempts[0].avgScore) : 0,
        quizAttempts: quizAttempts[0]?.attempts || 0,
        assignmentAverage: assignments[0]?.avgGrade ? Math.round(assignments[0].avgGrade) : 0,
        assignmentsSubmitted: assignments[0]?.submitted || 0,
        assignmentsPending: assignments[0]?.pending || 0,
        points: student.points || 0,
        badges: student.badges || []
      };
    }));

    successResponse(res, 200, {
      course: {
        id: course._id,
        title: course.title
      },
      totalStudents: students.length,
      students: studentPerformance
    }, 'Student performance data retrieved successfully');

  } catch (error) {
    next(error);
  }
};
