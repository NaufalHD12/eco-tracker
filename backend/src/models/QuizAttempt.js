import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: [0, 'Selected answer index must be non-negative'],
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Points earned cannot be negative'],
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Time spent cannot be negative'],
  },
}, {_id: false});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz is required'],
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative'],
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Total points cannot be negative'],
  },
  percentage: {
    type: Number,
    default: 0,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100'],
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: [0, 'Correct answers cannot be negative'],
  },
  totalQuestions: {
    type: Number,
    default: 0,
    min: [0, 'Total questions cannot be negative'],
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Time spent cannot be negative'],
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    default: null,
  },
  feedback: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

quizAttemptSchema.index({user: 1, quiz: 1}, {unique: true});
quizAttemptSchema.index({user: 1, status: 1});
quizAttemptSchema.index({quiz: 1, score: -1});
quizAttemptSchema.index({createdAt: -1});

quizAttemptSchema.virtual('accuracy').get(function() {
  return this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
});

quizAttemptSchema.virtual('averageTimePerQuestion').get(function() {
  return this.totalQuestions > 0 ? Math.round(this.timeSpent / this.totalQuestions) : 0;
});

quizAttemptSchema.virtual('isPassed').get(function() {
  return this.percentage >= 70; // 70% passing grade
});

quizAttemptSchema.pre('save', function(next) {
  // Calculate score and percentage
  this.score = this.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
  this.correctAnswers = this.answers.filter((answer) => answer.isCorrect).length;
  this.totalQuestions = this.answers.length;
  this.totalPoints = this.answers.reduce((sum, answer) => sum + (answer.isCorrect ? 10 : 0), 0); // Assuming 10 points per question
  this.percentage = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;

  // Calculate grade
  if (this.percentage >= 90) this.grade = 'A';
  else if (this.percentage >= 80) this.grade = 'B';
  else if (this.percentage >= 70) this.grade = 'C';
  else if (this.percentage >= 60) this.grade = 'D';
  else this.grade = 'F';

  // Set completedAt if status is completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

quizAttemptSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    {$match: {user: new mongoose.Types.ObjectId(userId), status: 'completed'}},
    {
      $group: {
        _id: '$user',
        totalAttempts: {$sum: 1},
        averageScore: {$avg: '$score'},
        averagePercentage: {$avg: '$percentage'},
        highestScore: {$max: '$score'},
        totalTimeSpent: {$sum: '$timeSpent'},
        passedCount: {$sum: {$cond: [{$gte: ['$percentage', 70]}, 1, 0]}},
      },
    },
  ]);
};

quizAttemptSchema.statics.getQuizStats = function(quizId) {
  return this.aggregate([
    {$match: {quiz: new mongoose.Types.ObjectId(quizId), status: 'completed'}},
    {
      $group: {
        _id: '$quiz',
        totalAttempts: {$sum: 1},
        averageScore: {$avg: '$score'},
        averagePercentage: {$avg: '$percentage'},
        highestScore: {$max: '$score'},
        averageTimeSpent: {$avg: '$timeSpent'},
      },
    },
  ]);
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
