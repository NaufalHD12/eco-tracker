import mongoose from 'mongoose';

const challengeParticipantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge is required'],
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active',
  },
  baselineEmission: {
    type: Number,
    default: 0,
    min: [0, 'Baseline emission cannot be negative'],
  },
  currentEmission: {
    type: Number,
    default: 0,
    min: [0, 'Current emission cannot be negative'],
  },
  emissionSaved: {
    type: Number,
    default: 0,
    min: [0, 'Emission saved cannot be negative'],
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative'],
  },
  streakDays: {
    type: Number,
    default: 0,
    min: [0, 'Streak days cannot be negative'],
  },
  lastActivityDate: {
    type: Date,
    default: null,
  },
  achievements: [{
    type: String,
    trim: true,
  }],
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
  },
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

challengeParticipantSchema.index({user: 1, challenge: 1}, {unique: true});
challengeParticipantSchema.index({challenge: 1, emissionSaved: -1});
challengeParticipantSchema.index({challenge: 1, points: -1});
challengeParticipantSchema.index({user: 1, status: 1});

challengeParticipantSchema.virtual('rank').get(function() {
  return null;
});

challengeParticipantSchema.virtual('daysParticipated').get(function() {
  if (!this.joinedAt) return 0;
  const now = new Date();
  const endDate = this.status === 'completed' ? this.updatedAt : now;
  return Math.ceil((endDate - this.joinedAt) / (1000 * 60 * 60 * 24));
});

challengeParticipantSchema.pre('save', function(next) {
  next();
});

challengeParticipantSchema.statics.getLeaderboard = function(challengeId, limit = 10) {
  return this.find({challenge: challengeId, status: 'active'})
      .populate('user', 'name email')
      .sort({emissionSaved: -1, points: -1})
      .limit(limit)
      .select('user emissionSaved points streakDays progress');
};

challengeParticipantSchema.statics.getUserRank = async function(challengeId, userId) {
  // First get the user's stats
  const userParticipant = await this.findOne({
    challenge: challengeId,
    user: userId,
    status: 'active',
  }).select('emissionSaved points');

  if (!userParticipant) return [];

  // Count how many participants have higher or equal emissionSaved/points
  const higherCount = await this.countDocuments({
    challenge: challengeId,
    status: 'active',
    $or: [
      {emissionSaved: {$gt: userParticipant.emissionSaved}},
      {
        emissionSaved: userParticipant.emissionSaved,
        points: {$gt: userParticipant.points},
      },
    ],
  });

  return [{
    rank: higherCount + 1,
    emissionSaved: userParticipant.emissionSaved,
    points: userParticipant.points,
  }];
};

challengeParticipantSchema.methods.updateProgress = function() {
  return this.save();
};

const ChallengeParticipant = mongoose.model('ChallengeParticipant', challengeParticipantSchema);

export default ChallengeParticipant;
