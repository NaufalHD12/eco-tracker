import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Challenge category is required'],
    enum: {
      values: ['Transportation', 'Food', 'Energy', 'Shopping', 'General'],
      message: 'Category must be Transportation, Food, Energy, Shopping, or General',
    },
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  targetEmission: {
    type: Number,
    required: [true, 'Target emission reduction is required'],
    min: [0, 'Target emission must be positive'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  maxParticipants: {
    type: Number,
    default: null, // null means unlimited
    min: [1, 'Max participants must be at least 1'],
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rules: [{
    type: String,
    trim: true,
  }],
  rewards: {
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative'],
    },
    badge: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  totalParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Total participants cannot be negative'],
  },
  totalEmissionSaved: {
    type: Number,
    default: 0,
    min: [0, 'Total emission saved cannot be negative'],
  },
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

challengeSchema.index({status: 1, startDate: 1});
challengeSchema.index({category: 1});
challengeSchema.index({createdBy: 1});
// Index for challenge title validation (active/upcoming challenges)
challengeSchema.index({title: 1, status: 1, endDate: 1});

challengeSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

challengeSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return null;
  const now = new Date();
  if (now > this.endDate) return 0;
  return Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
});

challengeSchema.virtual('progressPercentage').get(function() {
  if (this.targetEmission === 0) return 100;
  return Math.min(100, Math.round((this.totalEmissionSaved / this.targetEmission) * 100));
});

challengeSchema.pre('save', function(next) {
  const now = new Date();

  if (this.status !== 'cancelled') {
    if (now < this.startDate) {
      this.status = 'upcoming';
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = 'active';
    } else if (now > this.endDate) {
      this.status = 'completed';
    }
  }

  next();
});

challengeSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: {$lte: now},
    endDate: {$gte: now},
  });
};

challengeSchema.statics.findUpcoming = function(limit = 5) {
  const now = new Date();
  return this.find({
    status: 'upcoming',
    startDate: {$gt: now},
  })
      .sort({startDate: 1})
      .limit(limit);
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
