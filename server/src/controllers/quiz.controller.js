const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// Get all quizzes for a course
exports.getQuizzesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ course: courseId, isPublished: true })
      .select('-questions.correctAnswer -questions.options.isCorrect');

    successResponse(res, 200, { quizzes }, 'Quizzes retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single quiz
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title instructor')
      .select('-questions.correctAnswer -questions.options.isCorrect');

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check if user is enrolled
    const course = await Course.findById(quiz.course._id);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return errorResponse(res, 403, 'You must be enrolled in this course to take this quiz');
    }

    // Get user's attempts
    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      user: req.user.id
    }).sort('-attemptNumber');

    const attemptsLeft = quiz.maxAttempts - attempts.length;

    successResponse(res, 200, { quiz, attempts: attempts.length, attemptsLeft }, 'Quiz retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create quiz (Teacher/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to add quizzes to this course');
    }

    const quiz = await Quiz.create(req.body);

    // Add quiz to course
    course.quizzes.push(quiz._id);
    await course.save();

    successResponse(res, 201, { quiz }, 'Quiz created successfully');
  } catch (error) {
    next(error);
  }
};

// Update quiz (Teacher/Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id).populate('course');

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && quiz.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this quiz');
    }

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, { quiz }, 'Quiz updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete quiz (Teacher/Admin)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && quiz.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this quiz');
    }

    // Remove quiz from course
    await Course.findByIdAndUpdate(quiz.course._id, {
      $pull: { quizzes: quiz._id }
    });

    await quiz.deleteOne();

    successResponse(res, 200, null, 'Quiz deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Submit quiz attempt
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeSpent, startedAt } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check attempts (max 3 per SRS)
    const previousAttempts = await QuizAttempt.find({
      quiz: quiz._id,
      user: req.user.id
    }).sort('-attemptNumber');

    if (previousAttempts.length >= 3) {
      return errorResponse(res, 400, 'Maximum attempts (3) reached for this quiz');
    }

    // Check cooldown period (24 hours between attempts per SRS)
    if (previousAttempts.length > 0) {
      const lastAttempt = previousAttempts[0];
      const hoursSinceLastAttempt = (new Date() - new Date(lastAttempt.completedAt)) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttempt < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastAttempt);
        return errorResponse(
          res, 
          400, 
          `You must wait 24 hours between quiz attempts. Please try again in ${hoursRemaining} hour(s).`
        );
      }
    }

    // Grade quiz
    const gradedAnswers = [];
    let pointsEarned = 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      if (question.questionType === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption.text;
      } else if (question.questionType === 'true-false') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.questionType === 'short-answer' || question.questionType === 'fill-blank') {
        isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      }

      const points = isCorrect ? question.points : 0;
      pointsEarned += points;

      gradedAnswers.push({
        questionId: question._id,
        answer: userAnswer,
        isCorrect,
        pointsEarned: points
      });
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const score = Math.round((pointsEarned / totalPoints) * 100);
    const passed = score >= 60; // 60% pass mark per SRS

    // Calculate next attempt time (24 hours from now)
    const nextAttemptAllowedAt = new Date();
    nextAttemptAllowedAt.setHours(nextAttemptAllowedAt.getHours() + 24);

    // Save attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user.id,
      course: quiz.course,
      attemptNumber: previousAttempts.length + 1,
      nextAttemptAllowedAt: previousAttempts.length < 2 ? nextAttemptAllowedAt : null,
      answers: gradedAnswers,
      score,
      totalPoints,
      pointsEarned,
      passed,
      timeSpent: timeSpent || 0,
      startedAt: startedAt || new Date(),
      completedAt: new Date()
    });

    // Update progress
    const progress = await Progress.findOne({
      user: req.user.id,
      course: quiz.course
    });

    if (progress) {
      const existingQuizIndex = progress.completedQuizzes.findIndex(
        cq => cq.quiz.toString() === quiz._id.toString()
      );

      if (existingQuizIndex >= 0) {
        // Update if better score
        if (score > progress.completedQuizzes[existingQuizIndex].bestScore) {
          progress.completedQuizzes[existingQuizIndex].bestScore = score;
        }
        progress.completedQuizzes[existingQuizIndex].attempts += 1;
        progress.completedQuizzes[existingQuizIndex].lastAttemptAt = new Date();
      } else {
        progress.completedQuizzes.push({
          quiz: quiz._id,
          bestScore: score,
          attempts: 1,
          lastAttemptAt: new Date()
        });
      }

      await progress.calculateProgress();
      await progress.save();
    }

    // Award points for passing
    if (passed) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { points: 20 }
      });
    }

    // Populate quiz for response
    const populatedAttempt = await QuizAttempt.findById(attempt._id)
      .populate('quiz', 'title questions');

    successResponse(res, 201, { attempt: populatedAttempt }, 'Quiz submitted successfully');
  } catch (error) {
    next(error);
  }
};

// Get quiz attempts
exports.getQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz: req.params.id,
      user: req.user.id
    }).sort('-attemptNumber');

    successResponse(res, 200, { attempts }, 'Quiz attempts retrieved successfully');
  } catch (error) {
    next(error);
  }
};
