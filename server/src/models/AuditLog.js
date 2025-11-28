const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'failed_login', 'register',
      'profile_update', 'password_change', 'password_reset',
      'course_create', 'course_update', 'course_delete',
      'course_enroll', 'course_unenroll', 'course_complete',
      'lesson_create', 'lesson_update', 'lesson_delete', 'lesson_complete',
      'quiz_create', 'quiz_update', 'quiz_delete', 'quiz_attempt',
      'forum_post', 'forum_reply', 'forum_delete',
      'user_create', 'user_update', 'user_delete', 'user_deactivate', 'user_activate',
      'certificate_generate', 'certificate_download',
      'role_change', 'mfa_enable', 'mfa_disable',
      'data_export', 'settings_change'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'Course', 'Lesson', 'Quiz', 'Forum', 'Certificate', 'System']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year retention

module.exports = mongoose.model('AuditLog', auditLogSchema);
