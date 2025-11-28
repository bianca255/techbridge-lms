const User = require('../models/User');
const { successResponse, errorResponse, paginate, paginationResponse } = require('../utils/response');

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt');

    const response = paginationResponse(users, page, limit, total);
    successResponse(res, 200, response, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail')
      .populate('completedCourses', 'title thumbnail');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'language'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get user stats (Admin/Teacher)
exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    successResponse(res, 200, {
      totalUsers,
      activeUsers,
      roleDistribution: stats
    }, 'User statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
