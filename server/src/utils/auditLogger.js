const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} logData - Audit log data
 * @param {ObjectId} logData.user - User ID who performed the action
 * @param {string} logData.action - Action performed
 * @param {string} logData.resourceType - Type of resource affected
 * @param {ObjectId} logData.resourceId - ID of the affected resource
 * @param {Object} logData.details - Additional details
 * @param {string} logData.ipAddress - User's IP address
 * @param {string} logData.userAgent - User's browser/device info
 * @param {string} logData.status - Status of the action (success/failure/warning)
 * @param {string} logData.errorMessage - Error message if failed
 */
const createAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog(logData);
    await auditLog.save();
    return auditLog;
  } catch (error) {
    // Silent fail - don't let audit logging break the app
    console.error('Failed to create audit log:', error.message);
    return null;
  }
};

/**
 * Extract IP address from request
 */
const getIPAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
};

/**
 * Middleware to automatically log actions
 */
const auditMiddleware = (action, resourceType = null) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function(data) {
      // Create audit log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          user: req.user?._id,
          action,
          resourceType,
          resourceId: req.params.id || req.params.courseId || req.params.lessonId || req.body._id,
          ipAddress: getIPAddress(req),
          userAgent: req.get('user-agent'),
          details: {
            method: req.method,
            path: req.path,
            params: req.params,
            query: req.query
          },
          status: 'success'
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Get user activity logs
 */
const getUserActivityLogs = async (userId, options = {}) => {
  const {
    limit = 50,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { user: userId };

  if (action) {
    query.action = action;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email role')
    .lean();

  const total = await AuditLog.countDocuments(query);

  return {
    logs,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get system-wide audit logs (admin only)
 */
const getSystemAuditLogs = async (options = {}) => {
  const {
    limit = 100,
    skip = 0,
    action = null,
    resourceType = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  const query = {};

  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'username email role')
    .lean();

  const total = await AuditLog.countDocuments(query);

  return {
    logs,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  createAuditLog,
  getIPAddress,
  auditMiddleware,
  getUserActivityLogs,
  getSystemAuditLogs
};
