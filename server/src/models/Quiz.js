const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
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
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'fill-blank'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    points: {
      type: Number,
      default: 1,
      min: 0
    },
    explanation: String,
    order: Number
  }],
  passingScore: {
    type: Number,
    required: [true, 'Passing score is required'],
    min: [0, 'Passing score must be at least 0'],
    max: [100, 'Passing score cannot exceed 100'],
    default: 60
  },
  timeLimit: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Must allow at least 1 attempt']
  },
  shuffleQuestions: {
    type: Boolean,
    default: true
  },
  shuffleOptions: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

module.exports = mongoose.model('Quiz', quizSchema);
