const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  submittedFiles: [{
    fileName: String,
    originalName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: Date
  }],
  textContent: {
    type: String,
    maxlength: [10000, 'Text content cannot exceed 10000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  daysLate: {
    type: Number,
    default: 0,
    min: 0
  },
  latePenaltyApplied: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  grade: {
    rawScore: {
      type: Number,
      min: 0,
      max: 100
    },
    adjustedScore: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmission_requested'],
    default: 'submitted'
  },
  resubmissions: [{
    submittedAt: Date,
    files: [{
      fileName: String,
      fileUrl: String
    }],
    textContent: String
  }]
}, {
  timestamps: true
});

// Calculate late penalty and adjusted score
assignmentSubmissionSchema.methods.calculateLatePenalty = function(assignment) {
  if (!this.isLate || this.daysLate === 0) {
    this.latePenaltyApplied = 0;
    return;
  }

  const penalty = Math.min(
    assignment.latePenaltyPerDay * this.daysLate,
    100
  );
  
  this.latePenaltyApplied = penalty;
};

assignmentSubmissionSchema.methods.calculateAdjustedScore = function() {
  if (!this.grade.rawScore) return;

  const penaltyMultiplier = (100 - this.latePenaltyApplied) / 100;
  this.grade.adjustedScore = Math.round(this.grade.rawScore * penaltyMultiplier);
};

// Index for efficient queries
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
assignmentSubmissionSchema.index({ course: 1, status: 1 });
assignmentSubmissionSchema.index({ student: 1, submittedAt: -1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
