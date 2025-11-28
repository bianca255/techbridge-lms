const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/response');

// Get admin dashboard statistics
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Total users count by role
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Total courses
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Active students (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeStudents = await User.countDocuments({
      role: 'student',
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Total enrollments
    const totalEnrollments = await Progress.countDocuments();
    const completedEnrollments = await Progress.countDocuments({ isCompleted: true });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Most popular courses
    const popularCourses = await Progress.aggregate([
      { $group: { _id: '$course', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' },
      {
        $project: {
          courseName: '$courseData.title',
          enrollments: 1
        }
      }
    ]);

    // Recent activity (last 10 audit logs)
    const recentActivity = await AuditLog.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Platform growth (users per month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    successResponse(res, 200, {
      statistics: {
        users: {
          total: totalUsers,
          students: studentCount,
          teachers: teacherCount,
          admins: adminCount,
          active: activeStudents,
          recentRegistrations
        },
        courses: {
          total: totalCourses,
          published: publishedCourses
        },
        enrollments: {
          total: totalEnrollments,
          completed: completedEnrollments,
          completionRate: totalEnrollments > 0 
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0
        }
      },
      popularCourses,
      recentActivity: recentActivity.map(log => ({
        id: log._id,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        action: log.action,
        details: log.details,
        timestamp: log.createdAt
      })),
      userGrowth: userGrowth.map(g => ({
        month: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
        count: g.count
      }))
    }, 'Admin dashboard data retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// Get all users with filters and pagination
exports.getAllUsers = async (req, res, next) => {
  try {
    const { 
      role, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -mfaSecret')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    successResponse(res, 200, {
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        points: user.points || 0,
        badges: user.badges || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        mfaEnabled: user.mfaEnabled || false
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit: parseInt(limit)
      }
    }, 'Users retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// Get single user details
exports.getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -mfaSecret');
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Get user's enrollments
    const enrollments = await Progress.find({ user: userId })
      .populate('course', 'title level category')
      .select('course progress isCompleted points badges enrolledAt lastAccessedAt');

    // Get user's audit logs (last 20)
    const auditLogs = await AuditLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    successResponse(res, 200, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        dateOfBirth: user.dateOfBirth,
        points: user.points || 0,
        badges: user.badges || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        mfaEnabled: user.mfaEnabled || false,
        failedLoginAttempts: user.failedLoginAttempts || 0,
        accountLockedUntil: user.accountLockedUntil,
        parentalConsent: user.parentalConsent
      },
      enrollments: enrollments.map(e => ({
        courseId: e.course._id,
        courseName: e.course.title,
        level: e.course.level,
        category: e.course.category,
        progress: e.progress,
        isCompleted: e.isCompleted,
        points: e.points,
        badges: e.badges,
        enrolledAt: e.enrolledAt,
        lastAccessed: e.lastAccessedAt
      })),
      recentActivity: auditLogs.map(log => ({
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        timestamp: log.createdAt
      }))
    }, 'User details retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return errorResponse(res, 400, 'Invalid role');
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Prevent changing own role
    if (userId === req.user.id) {
      return errorResponse(res, 403, 'Cannot change your own role');
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Create audit log
    const { createAuditLog } = require('../utils/auditLogger');
    await createAuditLog({
      user: req.user.id,
      action: 'user_role_updated',
      details: `Changed user ${user.email} role from ${oldRole} to ${role}`,
      ipAddress: req.ip
    });

    successResponse(res, 200, { 
      userId: user._id,
      email: user.email,
      oldRole,
      newRole: role
    }, 'User role updated successfully');

  } catch (error) {
    next(error);
  }
};

// Deactivate/Activate user account
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Prevent deactivating own account
    if (userId === req.user.id) {
      return errorResponse(res, 403, 'Cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();

    // Create audit log
    const { createAuditLog } = require('../utils/auditLogger');
    await createAuditLog({
      user: req.user.id,
      action: user.isActive ? 'user_activated' : 'user_deactivated',
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user account: ${user.email}`,
      ipAddress: req.ip
    });

    successResponse(res, 200, { 
      userId: user._id,
      email: user.email,
      isActive: user.isActive
    }, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`);

  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Prevent deleting own account
    if (userId === req.user.id) {
      return errorResponse(res, 403, 'Cannot delete your own account');
    }

    const userEmail = user.email;

    // Delete user's progress
    await Progress.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Create audit log
    const { createAuditLog } = require('../utils/auditLogger');
    await createAuditLog({
      user: req.user.id,
      action: 'user_deleted',
      details: `Deleted user account: ${userEmail}`,
      ipAddress: req.ip
    });

    successResponse(res, 200, null, 'User account deleted successfully');

  } catch (error) {
    next(error);
  }
};

// Reset user password
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters');
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.password = newPassword;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    // Create audit log
    const { createAuditLog } = require('../utils/auditLogger');
    await createAuditLog({
      user: req.user.id,
      action: 'password_reset_by_admin',
      details: `Reset password for user: ${user.email}`,
      ipAddress: req.ip
    });

    successResponse(res, 200, null, 'User password reset successfully');

  } catch (error) {
    next(error);
  }
};

// Get platform statistics
exports.getPlatformStats = async (req, res, next) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      courses: await Course.countDocuments(),
      enrollments: await Progress.countDocuments(),
      completions: await Progress.countDocuments({ isCompleted: true })
    };

    successResponse(res, 200, stats, 'Platform statistics retrieved successfully');

  } catch (error) {
    next(error);
  }
};
