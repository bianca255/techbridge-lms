const Forum = require('../models/Forum');
const Course = require('../models/Course');
const { successResponse, errorResponse, paginate, paginationResponse } = require('../utils/response');

// Get forums by course
exports.getForumsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20, category, search } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { course: courseId };
    
    if (category) query.category = category;
    
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Forum.countDocuments(query);
    const forums = await Forum.find(query)
      .populate('author', 'firstName lastName profilePicture role')
      .populate('replies.author', 'firstName lastName profilePicture role')
      .skip(skip)
      .limit(limitNum)
      .sort({ isPinned: -1, lastActivity: -1 });

    const response = paginationResponse(forums, page, limit, total);
    successResponse(res, 200, response, 'Forums retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get single forum
exports.getForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture role')
      .populate('replies.author', 'firstName lastName profilePicture role');

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    // Increment view count
    forum.views += 1;
    await forum.save();

    successResponse(res, 200, { forum }, 'Forum retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create forum post
exports.createForum = async (req, res, next) => {
  try {
    const { title, content, category, tags, course } = req.body;

    // Check if user is enrolled in the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (!courseDoc.enrolledStudents.includes(req.user.id) && 
        courseDoc.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You must be enrolled in this course to post in forums');
    }

    const forum = await Forum.create({
      title,
      content,
      category,
      tags,
      course,
      author: req.user.id
    });

    const populatedForum = await Forum.findById(forum._id)
      .populate('author', 'firstName lastName profilePicture role');

    successResponse(res, 201, { forum: populatedForum }, 'Forum created successfully');
  } catch (error) {
    next(error);
  }
};

// Update forum post
exports.updateForum = async (req, res, next) => {
  try {
    let forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    // Check ownership
    if (forum.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to update this forum');
    }

    if (forum.isLocked && req.user.role !== 'admin') {
      return errorResponse(res, 400, 'This forum is locked');
    }

    const { title, content, tags } = req.body;
    forum = await Forum.findByIdAndUpdate(
      req.params.id,
      { title, content, tags },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName profilePicture role');

    successResponse(res, 200, { forum }, 'Forum updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete forum post
exports.deleteForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    // Check ownership or admin
    if (forum.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to delete this forum');
    }

    await forum.deleteOne();

    successResponse(res, 200, null, 'Forum deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Add reply to forum
exports.addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    if (forum.isLocked && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return errorResponse(res, 400, 'This forum is locked');
    }

    // Check if user is enrolled
    const course = await Course.findById(forum.course);
    if (!course.enrolledStudents.includes(req.user.id) && 
        course.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You must be enrolled in this course to reply');
    }

    forum.replies.push({
      author: req.user.id,
      content
    });

    await forum.save();

    const updatedForum = await Forum.findById(forum._id)
      .populate('author', 'firstName lastName profilePicture role')
      .populate('replies.author', 'firstName lastName profilePicture role');

    successResponse(res, 201, { forum: updatedForum }, 'Reply added successfully');
  } catch (error) {
    next(error);
  }
};

// Like forum post
exports.likeForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    // Toggle like
    const likeIndex = forum.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      forum.likes.splice(likeIndex, 1);
    } else {
      forum.likes.push(req.user.id);
    }

    await forum.save();

    successResponse(res, 200, { likes: forum.likes.length }, 'Like toggled successfully');
  } catch (error) {
    next(error);
  }
};

// Like reply
exports.likeReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    const reply = forum.replies.id(replyId);
    if (!reply) {
      return errorResponse(res, 404, 'Reply not found');
    }

    // Toggle like
    const likeIndex = reply.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.user.id);
    }

    await forum.save();

    successResponse(res, 200, { likes: reply.likes.length }, 'Reply like toggled successfully');
  } catch (error) {
    next(error);
  }
};

// Pin/Unpin forum (Teacher/Admin)
exports.pinForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    forum.isPinned = !forum.isPinned;
    await forum.save();

    successResponse(res, 200, { forum }, `Forum ${forum.isPinned ? 'pinned' : 'unpinned'} successfully`);
  } catch (error) {
    next(error);
  }
};

// Lock/Unlock forum (Teacher/Admin)
exports.lockForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return errorResponse(res, 404, 'Forum not found');
    }

    forum.isLocked = !forum.isLocked;
    await forum.save();

    successResponse(res, 200, { forum }, `Forum ${forum.isLocked ? 'locked' : 'unlocked'} successfully`);
  } catch (error) {
    next(error);
  }
};
