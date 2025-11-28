const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// Get user progress for a course
exports.getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      user: req.user.id,
      course: courseId
    })
      .populate('completedLessons.lesson', 'title order')
      .populate('completedQuizzes.quiz', 'title')
      .populate('currentLesson', 'title order');

    if (!progress) {
      return errorResponse(res, 404, 'Progress not found. You may not be enrolled in this course.');
    }

    successResponse(res, 200, { progress }, 'Progress retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get all progress for user
exports.getMyProgress = async (req, res, next) => {
  try {
    const progressList = await Progress.find({ user: req.user.id })
      .populate('course', 'title thumbnail instructor')
      .sort('-lastAccessedAt');

    successResponse(res, 200, { progress: progressList }, 'All progress retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get course analytics for teacher
exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to view analytics for this course');
    }

    // Get all progress for this course
    const progressList = await Progress.find({ course: courseId })
      .populate('user', 'firstName lastName email');

    // Calculate statistics
    const totalEnrolled = progressList.length;
    const completed = progressList.filter(p => p.isCompleted).length;
    const inProgress = totalEnrolled - completed;
    
    const averageProgress = progressList.reduce((sum, p) => sum + p.overallProgress, 0) / totalEnrolled || 0;
    const averageTimeSpent = progressList.reduce((sum, p) => sum + p.totalTimeSpent, 0) / totalEnrolled || 0;

    const analytics = {
      totalEnrolled,
      completed,
      inProgress,
      completionRate: totalEnrolled > 0 ? (completed / totalEnrolled * 100).toFixed(2) : 0,
      averageProgress: averageProgress.toFixed(2),
      averageTimeSpent: Math.round(averageTimeSpent),
      students: progressList.map(p => ({
        user: p.user,
        progress: p.overallProgress,
        lastAccessed: p.lastAccessedAt,
        timeSpent: p.totalTimeSpent,
        isCompleted: p.isCompleted
      }))
    };

    successResponse(res, 200, { analytics }, 'Course analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get student analytics (Admin/Teacher)
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const progressList = await Progress.find({ user: studentId })
      .populate('course', 'title thumbnail');

    const student = await User.findById(studentId)
      .select('firstName lastName email points badges');

    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    const totalCourses = progressList.length;
    const completedCourses = progressList.filter(p => p.isCompleted).length;
    const averageProgress = progressList.reduce((sum, p) => sum + p.overallProgress, 0) / totalCourses || 0;
    const totalTimeSpent = progressList.reduce((sum, p) => sum + p.totalTimeSpent, 0);

    const analytics = {
      student,
      totalCourses,
      completedCourses,
      inProgressCourses: totalCourses - completedCourses,
      averageProgress: averageProgress.toFixed(2),
      totalTimeSpent,
      courses: progressList
    };

    successResponse(res, 200, { analytics }, 'Student analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats for current user
exports.getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const progressList = await Progress.find({ user: req.user.id });

    const totalCourses = progressList.length;
    const completedCourses = progressList.filter(p => p.isCompleted).length;
    const inProgressCourses = totalCourses - completedCourses;
    const totalTimeSpent = progressList.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const totalLessonsCompleted = progressList.reduce((sum, p) => sum + p.completedLessons.length, 0);
    const totalQuizzesCompleted = progressList.reduce((sum, p) => sum + p.completedQuizzes.length, 0);

    // Get recent activity
    const recentProgress = await Progress.find({ user: req.user.id })
      .populate('course', 'title thumbnail')
      .sort('-lastAccessedAt')
      .limit(5);

    const stats = {
      points: user.points,
      badges: user.badges,
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent,
      totalLessonsCompleted,
      totalQuizzesCompleted,
      recentActivity: recentProgress
    };

    successResponse(res, 200, { stats }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find({ role: 'student', isActive: true })
      .select('firstName lastName profilePicture points badges')
      .sort('-points')
      .limit(parseInt(limit));

    successResponse(res, 200, { leaderboard }, 'Leaderboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};
