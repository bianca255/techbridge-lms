const User = require('../models/User');
const { sendTokenResponse } = require('../utils/token');
const { errorResponse, successResponse } = require('../utils/response');
const { createAuditLog, getIPAddress } = require('../utils/auditLogger');

// Register user
exports.register = async (req, res, next) => {
  try {
    const { 
      username, email, password, firstName, lastName, role, dateOfBirth, language, 
      parentalConsent, guardianName, guardianEmail, guardianPhone 
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email or username already exists');
    }

    // Check parental consent for users under 18
    let needsParentalConsent = false;
    if (dateOfBirth) {
      const age = Math.floor((new Date() - new Date(dateOfBirth)) / 31557600000);
      needsParentalConsent = age < 18;
      
      if (needsParentalConsent && (!parentalConsent || !guardianName || !guardianEmail)) {
        return errorResponse(res, 400, 'Parental consent with guardian details is required for users under 18');
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
      dateOfBirth,
      language: language || 'en',
      parentalConsent: needsParentalConsent ? {
        given: parentalConsent || false,
        guardianName,
        guardianEmail,
        guardianPhone,
        consentDate: new Date(),
        consentIPAddress: getIPAddress(req)
      } : undefined
    });

    // Create audit log
    await createAuditLog({
      user: user._id,
      action: 'register',
      resourceType: 'User',
      resourceId: user._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Log failed login attempt
      await createAuditLog({
        action: 'failed_login',
        resourceType: 'User',
        ipAddress: getIPAddress(req),
        userAgent: req.get('user-agent'),
        status: 'failure',
        errorMessage: 'User not found',
        details: { email }
      });
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await createAuditLog({
        user: user._id,
        action: 'failed_login',
        resourceType: 'User',
        resourceId: user._id,
        ipAddress: getIPAddress(req),
        userAgent: req.get('user-agent'),
        status: 'failure',
        errorMessage: 'Account locked'
      });
      return errorResponse(res, 423, 'Account is temporarily locked. Please try again later.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      
      // Log failed login
      await createAuditLog({
        user: user._id,
        action: 'failed_login',
        resourceType: 'User',
        resourceId: user._id,
        ipAddress: getIPAddress(req),
        userAgent: req.get('user-agent'),
        status: 'failure',
        errorMessage: 'Invalid password'
      });
      
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Reset failed login attempts
    await user.resetLoginAttempts();

    // Update last login and set session expiry (30 minutes)
    user.lastLogin = new Date();
    user.sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Create audit log for successful login
    await createAuditLog({
      user: user._id,
      action: 'login',
      resourceType: 'User',
      resourceId: user._id,
      ipAddress: getIPAddress(req),
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses', 'title thumbnail')
      .populate('completedCourses', 'title thumbnail');

    successResponse(res, 200, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'language', 'profilePicture'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout (client-side handles token removal)
exports.logout = async (req, res, next) => {
  try {
    successResponse(res, 200, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
