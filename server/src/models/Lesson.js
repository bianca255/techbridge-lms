const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Order must be at least 1']
  },
  type: {
    type: String,
    enum: ['video', 'text', 'interactive', 'document', 'mixed'],
    default: 'text'
  },
  content: {
    text: String,
    videoUrl: String,
    documents: [{
      name: String,
      url: String,
      type: String
    }],
    images: [{
      url: String,
      caption: String
    }],
    interactiveContent: {
      type: String,
      embed: String
    }
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  resources: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  completionCriteria: {
    type: String,
    enum: ['view', 'time', 'quiz', 'manual'],
    default: 'view'
  },
  minCompletionTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for course and order
lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
