const User = require('../models/User');
const { createAuditLog } = require('./auditLogger');

/**
 * Deactivate inactive users (no login for 2 years)
 * Should be run as a scheduled task (e.g., daily cron job)
 */
const deactivateInactiveUsers = async () => {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Find users who haven't logged in for 2 years and haven't been notified
    const usersToNotify = await User.find({
      lastLogin: { $lt: twoYearsAgo },
      isActive: true,
      deactivationNotificationSent: false
    });

    console.log(`Found ${usersToNotify.length} inactive users to notify`);

    // Send notifications (in production, integrate with email service)
    for (const user of usersToNotify) {
      user.deactivationNotificationSent = true;
      await user.save();

      // Log notification
      await createAuditLog({
        user: user._id,
        action: 'user_deactivate',
        resourceType: 'User',
        resourceId: user._id,
        status: 'warning',
        details: {
          reason: 'Inactivity notification sent',
          lastLogin: user.lastLogin
        }
      });

      console.log(`Notification sent to ${user.email}`);
      // TODO: Send actual email notification
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Account Inactivity Notice',
      //   text: `Your TechBridge account has been inactive for 2 years. 
      //          It will be deactivated in 30 days if you don't log in.`
      // });
    }

    // Find users who were notified 30 days ago and still haven't logged in
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersToDeactivate = await User.find({
      lastLogin: { $lt: twoYearsAgo },
      isActive: true,
      deactivationNotificationSent: true,
      updatedAt: { $lt: thirtyDaysAgo }
    });

    console.log(`Found ${usersToDeactivate.length} users to deactivate`);

    // Deactivate users
    for (const user of usersToDeactivate) {
      user.isActive = false;
      await user.save();

      // Log deactivation
      await createAuditLog({
        user: user._id,
        action: 'user_deactivate',
        resourceType: 'User',
        resourceId: user._id,
        status: 'success',
        details: {
          reason: 'Inactive for 2 years',
          lastLogin: user.lastLogin
        }
      });

      console.log(`Deactivated user: ${user.email}`);
    }

    return {
      notified: usersToNotify.length,
      deactivated: usersToDeactivate.length
    };
  } catch (error) {
    console.error('Error in deactivateInactiveUsers:', error);
    throw error;
  }
};

/**
 * Calculate user's overall grade based on SRS formula:
 * 40% quizzes + 40% assignments + 20% participation
 */
const calculateOverallGrade = async (userId, courseId) => {
  const QuizAttempt = require('../models/QuizAttempt');
  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const Forum = require('../models/Forum');

  // Get quiz scores
  const quizAttempts = await QuizAttempt.find({
    user: userId,
    course: courseId,
    passed: true
  });

  const quizAverage = quizAttempts.length > 0
    ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
    : 0;

  // Get assignment scores
  const assignments = await AssignmentSubmission.find({
    student: userId,
    course: courseId,
    status: 'graded'
  });

  const assignmentAverage = assignments.length > 0
    ? assignments.reduce((sum, sub) => sum + (sub.grade.adjustedScore || 0), 0) / assignments.length
    : 0;

  // Calculate participation score based on forum activity
  const forumPosts = await Forum.countDocuments({
    course: courseId,
    'posts.author': userId
  });

  const forumReplies = await Forum.countDocuments({
    course: courseId,
    'posts.replies.author': userId
  });

  // Participation score: 10 points per post, 5 points per reply, max 100
  const participationScore = Math.min(
    100,
    (forumPosts * 10) + (forumReplies * 5)
  );

  // Calculate final grade: 40% quizzes + 40% assignments + 20% participation
  const finalGrade = (quizAverage * 0.4) + (assignmentAverage * 0.4) + (participationScore * 0.2);

  return {
    quizAverage: Math.round(quizAverage),
    assignmentAverage: Math.round(assignmentAverage),
    participationScore: Math.round(participationScore),
    finalGrade: Math.round(finalGrade),
    breakdown: {
      quizzes: Math.round(quizAverage * 0.4),
      assignments: Math.round(assignmentAverage * 0.4),
      participation: Math.round(participationScore * 0.2)
    }
  };
};

/**
 * Start all scheduled tasks
 */
const startScheduledTasks = () => {
  console.log('✅ Scheduled tasks initialized');
  // In production, you would set up actual cron jobs here
  // For now, this is just a placeholder
  // Example: Run deactivateInactiveUsers daily at midnight
  // setInterval(deactivateInactiveUsers, 24 * 60 * 60 * 1000);
};

module.exports = {
  deactivateInactiveUsers,
  calculateOverallGrade,
  startScheduledTasks
};
