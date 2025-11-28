const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  maxPoints: {
    type: Number,
    required: true,
    min: [0, 'Max points cannot be negative'],
    default: 100
  },
  latePenaltyPerDay: {
    type: Number,
    default: 10,
    min: [0, 'Late penalty cannot be negative'],
    max: [100, 'Late penalty cannot exceed 100%']
  },
  maxLateDays: {
    type: Number,
    default: 7,
    min: [0, 'Max late days cannot be negative']
  },
  allowedFileTypes: [{
    type: String,
    enum: ['pdf', 'docx', 'pptx', 'mp4', 'mp3', 'jpg', 'png', 'txt', 'zip']
  }],
  maxFileSize: {
    type: Number,
    default: 52428800, // 50MB in bytes
    max: [52428800, 'Max file size cannot exceed 50MB']
  },
  instructions: {
    type: String,
    maxlength: [5000, 'Instructions cannot exceed 5000 characters']
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ lesson: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
