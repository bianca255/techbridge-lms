const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { successResponse, errorResponse } = require('../utils/response');

// Get all lessons for a course
exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({ course: courseId, isPublished: true })
      .sort('order');

    successResponse(res, 200, { lessons }, 'Lessons retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single lesson
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title instructor');

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(lesson.course._id);
    if (!lesson.isPreview && !course.enrolledStudents.includes(req.user.id)) {
      return errorResponse(res, 403, 'You must be enrolled in this course to view this lesson');
    }

    successResponse(res, 200, { lesson }, 'Lesson retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create lesson (Teacher/Admin)
exports.createLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to add lessons to this course');
    }

    const lesson = await Lesson.create(req.body);

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    successResponse(res, 201, { lesson }, 'Lesson created successfully');
  } catch (error) {
    next(error);
  }
};

// Update lesson (Teacher/Admin)
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id).populate('course');

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && lesson.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this lesson');
    }

    lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, { lesson }, 'Lesson updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete lesson (Teacher/Admin)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && lesson.course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this lesson');
    }

    // Remove lesson from course
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: lesson._id }
    });

    await lesson.deleteOne();

    successResponse(res, 200, null, 'Lesson deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Mark lesson as complete
exports.completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    // Find or create progress
    let progress = await Progress.findOne({
      user: req.user.id,
      course: lesson.course
    });

    if (!progress) {
      return errorResponse(res, 400, 'You are not enrolled in this course');
    }

    // Check if already completed
    const alreadyCompleted = progress.completedLessons.some(
      cl => cl.lesson.toString() === lesson._id.toString()
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        lesson: lesson._id,
        completedAt: new Date(),
        timeSpent: req.body.timeSpent || 0
      });

      progress.totalTimeSpent += req.body.timeSpent || 0;
      progress.currentLesson = lesson._id;
      progress.lastAccessedAt = new Date();

      await progress.calculateProgress();
      await progress.save();

      // Award points
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { points: 10 }
      });
    }

    successResponse(res, 200, { progress }, 'Lesson marked as complete');
  } catch (error) {
    next(error);
  }
};
