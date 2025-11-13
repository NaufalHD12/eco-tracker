import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: [{
    type: String,
    required: true,
    trim: true,
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be non-negative'],
  },
  explanation: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 10,
    min: [1, 'Points must be at least 1'],
  },
  category: {
    type: String,
    enum: ['Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General'],
    default: 'General',
  },
}, {_id: true});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true,
    maxLength: [300, 'Description cannot exceed 300 characters'],
  },
  category: {
    type: String,
    required: [true, 'Quiz category is required'],
    enum: {
      values: ['Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General'],
      message: 'Category must be Carbon Footprint, Transportation, Food, Energy, Shopping, or General',
    },
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: function() {
      return this.questions ? this.questions.length : 0;
    },
  },
  totalPoints: {
    type: Number,
    default: function() {
      return this.questions ?
        this.questions.reduce((sum, q) => sum + q.points, 0) : 0;
    },
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 10,
    min: [1, 'Estimated time must be at least 1 minute'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

quizSchema.index({category: 1, difficulty: 1});
quizSchema.index({isActive: 1, createdAt: -1});
quizSchema.index({createdBy: 1});

quizSchema.virtual('questionCount').get(function() {
  return this.totalQuestions || 0;
});

quizSchema.virtual('averagePoints').get(function() {
  return this.totalQuestions > 0 ?
    Math.round(this.totalPoints / this.totalQuestions) : 0;
});

quizSchema.pre('save', function(next) {
  this.totalQuestions = this.questions ? this.questions.length : 0;
  this.totalPoints = this.questions ?
    this.questions.reduce((sum, q) => sum + q.points, 0) : 0;
  next();
});

quizSchema.statics.findActive = function() {
  return this.find({isActive: true});
};

quizSchema.statics.findByCategory = function(category) {
  return this.find({category, isActive: true});
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
