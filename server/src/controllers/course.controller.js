const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { successResponse, errorResponse, paginate, paginationResponse } = require('../utils/response');

// Get all courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, level, search, instructor } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName profilePicture')
      .select('-lessons -quizzes -reviews')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt');

    const response = paginationResponse(courses, page, limit, total);
    successResponse(res, 200, response, 'Courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single course
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName profilePicture')
      .populate('lessons')
      .populate('quizzes');

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (req.user && course.enrolledStudents.includes(req.user.id)) {
      isEnrolled = true;
    }

    successResponse(res, 200, { course, isEnrolled }, 'Course retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create course (Teacher/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id
    };

    const course = await Course.create(courseData);

    successResponse(res, 201, { course }, 'Course created successfully');
  } catch (error) {
    next(error);
  }
};

// Update course (Teacher/Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership (teacher can only update their own courses)
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this course');
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, { course }, 'Course updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete course (Teacher/Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check ownership
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this course');
    }

    await course.deleteOne();

    successResponse(res, 200, null, 'Course deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Enroll in course
exports.enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (!course.isPublished) {
      return errorResponse(res, 400, 'This course is not available for enrollment');
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return errorResponse(res, 400, 'You are already enrolled in this course');
    }

    // Check if course is full
    if (course.isFull()) {
      return errorResponse(res, 400, 'This course is full');
    }

    // Add student to course
    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Add course to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    // Create progress tracker
    await Progress.create({
      user: req.user.id,
      course: course._id
    });

    successResponse(res, 200, { course }, 'Successfully enrolled in course');
  } catch (error) {
    next(error);
  }
};

// Unenroll from course
exports.unenrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check if enrolled
    if (!course.enrolledStudents.includes(req.user.id)) {
      return errorResponse(res, 400, 'You are not enrolled in this course');
    }

    // Check progress before unenrolling
    const progress = await Progress.findOne({
      user: req.user.id,
      course: course._id
    });

    if (progress && progress.overallProgress >= 50) {
      return errorResponse(res, 400, 'Cannot unenroll after completing 50% of the course');
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.user.id
    );
    await course.save();

    // Remove course from user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { enrolledCourses: course._id }
    });

    // Delete progress
    await Progress.deleteOne({ user: req.user.id, course: course._id });

    successResponse(res, 200, null, 'Successfully unenrolled from course');
  } catch (error) {
    next(error);
  }
};

// Add review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check if user completed the course
    const progress = await Progress.findOne({
      user: req.user.id,
      course: course._id,
      isCompleted: true
    });

    if (!progress) {
      return errorResponse(res, 400, 'You must complete the course before reviewing');
    }

    // Check if already reviewed
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return errorResponse(res, 400, 'You have already reviewed this course');
    }

    // Add review
    course.reviews.push({
      user: req.user.id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0);
    course.rating.average = totalRating / course.reviews.length;
    course.rating.count = course.reviews.length;

    await course.save();

    successResponse(res, 201, { course }, 'Review added successfully');
  } catch (error) {
    next(error);
  }
};

// Get my courses (enrolled courses for students)
exports.getMyCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: { path: 'instructor', select: 'firstName lastName' }
    });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      user.enrolledCourses.map(async course => {
        const progress = await Progress.findOne({
          user: req.user.id,
          course: course._id
        });

        return {
          ...course.toObject(),
          progress: progress ? progress.overallProgress : 0
        };
      })
    );

    successResponse(res, 200, { courses: coursesWithProgress }, 'Enrolled courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get courses created by teacher
exports.getTeacherCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('lessons')
      .populate('quizzes')
      .sort('-createdAt');

    successResponse(res, 200, { courses }, 'Your courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};
