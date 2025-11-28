const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: Date,
    timeSpent: Number
  }],
  completedQuizzes: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    bestScore: Number,
    attempts: Number,
    lastAttemptAt: Date
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: {
    type: Date
  },
  certificateId: {
    type: String,
    unique: true,
    sparse: true
  },
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  notes: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound unique index
progressSchema.index({ user: 1, course: 1 }, { unique: true });

// Method to calculate progress percentage
progressSchema.methods.calculateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course).populate('lessons quizzes');
  
  if (!course) return 0;
  
  const totalItems = course.lessons.length + course.quizzes.length;
  if (totalItems === 0) return 0;
  
  const completedItems = this.completedLessons.length + this.completedQuizzes.length;
  const progress = Math.round((completedItems / totalItems) * 100);
  
  this.overallProgress = progress;
  
  if (progress === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.certificateIssued = true;
    this.certificateIssuedAt = new Date();
    
    // Generate certificate ID
    if (!this.certificateId) {
      this.certificateId = `CERT-${this.user.toString().slice(-6).toUpperCase()}-${this.course.toString().slice(-6).toUpperCase()}-${Date.now()}`;
    }
  }
  
  return progress;
};

module.exports = mongoose.model('Progress', progressSchema);
