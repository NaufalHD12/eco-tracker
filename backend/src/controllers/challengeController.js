import createHttpError from 'http-errors';
import Challenge from '../models/Challenge.js';
import ChallengeParticipant from '../models/ChallengeParticipant.js';
import Activity from '../models/Activity.js';

/**
 * Get all challenges with filtering and pagination
 * @route GET /api/challenges
 * @access Private
 */
export const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      difficulty,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const challenges = await Challenge.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v');

    const total = await Challenge.countDocuments(filter);

    const pagination = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    res.status(200).json({
      message: 'Challenges retrieved successfully',
      challenges,
      pagination,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get challenges error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve challenges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get currently active challenges
 * @route GET /api/challenges/active
 * @access Private
 */
export const getActiveChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.findActive()
        .populate('createdBy', 'name email')
        .select('-__v');

    res.status(200).json({
      message: 'Active challenges retrieved successfully',
      challenges,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get active challenges error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve active challenges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single challenge by ID
 * @route GET /api/challenges/:id
 * @access Private
 */
export const getChallenge = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.userId;

    const challenge = await Challenge.findById(id)
        .populate('createdBy', 'name email');

    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    const participation = await ChallengeParticipant.findOne({
      user: userId,
      challenge: id,
    }).select('status emissionSaved points progress');

    const challengeData = challenge.toObject();
    challengeData.participation = participation;

    res.status(200).json({
      message: 'Challenge retrieved successfully',
      challenge: challengeData,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get challenge error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new challenge
 * @route POST /api/challenges
 * @access Private (Admin only - for now)
 */
export const createChallenge = async (req, res) => {
  try {
    const {title} = req.body;

    // Check for active or upcoming challenges with same title (smart validation)
    const now = new Date();
    const existingChallenge = await Challenge.findOne({
      title: title.trim(),
      status: {$in: ['active', 'upcoming']},
      endDate: {$gte: now},
    });

    if (existingChallenge) {
      throw createHttpError(409, 'A challenge with this title already exists (active or upcoming). Please choose a different title.');
    }

    const challengeData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const challenge = new Challenge(challengeData);
    await challenge.save();

    await challenge.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create challenge error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to create challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a challenge
 * @route PUT /api/challenges/:id
 * @access Private (Admin only)
 */
export const updateChallenge = async (req, res) => {
  try {
    const {id} = req.params;

    const challenge = await Challenge.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
    ).populate('createdBy', 'name email');

    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    res.status(200).json({
      message: 'Challenge updated successfully',
      challenge,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update challenge error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to update challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a challenge
 * @route DELETE /api/challenges/:id
 * @access Private (Admin only)
 */
export const deleteChallenge = async (req, res) => {
  try {
    const {id} = req.params;

    const challenge = await Challenge.findByIdAndDelete(id);

    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    // Remove all participations
    await ChallengeParticipant.deleteMany({challenge: id});

    res.status(204).send();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete challenge error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to delete challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Join a challenge
 * @route POST /api/challenges/:id/join
 * @access Private
 */
export const joinChallenge = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.userId;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    if (challenge.status === 'completed' || challenge.status === 'cancelled') {
      throw createHttpError(400, 'Cannot join completed or cancelled challenge');
    }

    const existingParticipation = await ChallengeParticipant.findOne({
      user: userId,
      challenge: id,
    });

    if (existingParticipation) {
      throw createHttpError(409, 'Already joined this challenge');
    }

    if (challenge.maxParticipants && challenge.totalParticipants >= challenge.maxParticipants) {
      throw createHttpError(400, 'Challenge is full');
    }

    const participation = new ChallengeParticipant({
      user: userId,
      challenge: id,
    });

    await participation.save();

    await Challenge.findByIdAndUpdate(id, {
      $inc: {totalParticipants: 1},
    });

    res.status(200).json({
      message: 'Successfully joined challenge',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Join challenge error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to join challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get leaderboard for a challenge
 * @route GET /api/challenges/:id/leaderboard
 * @access Private
 */
export const getChallengeLeaderboard = async (req, res) => {
  try {
    const {id} = req.params;
    const {limit = 10} = req.query;
    const userId = req.user.userId;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    const leaderboard = await ChallengeParticipant.getLeaderboard(id, limit);

    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const userRankData = await ChallengeParticipant.getUserRank(id, userId);
    const userRank = userRankData.length > 0 ? userRankData[0] : null;

    res.status(200).json({
      message: 'Leaderboard retrieved successfully',
      challenge: {
        id: challenge._id,
        title: challenge.title,
      },
      leaderboard,
      userRank,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get leaderboard error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update challenge progress for all participants
 * This would be called by a cron job or admin endpoint
 * @route POST /api/challenges/:id/update-progress
 * @access Private (Admin only)
 */
export const updateChallengeProgress = async (req, res) => {
  try {
    const {id} = req.params;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      throw createHttpError(404, 'Challenge not found');
    }

    if (challenge.status !== 'active') {
      throw createHttpError(400, 'Challenge is not active');
    }

    const participants = await ChallengeParticipant.find({
      challenge: id,
      status: 'active',
    }).populate('user', 'name email');

    const updates = participants.map(async (participant) => {
      await updateParticipantProgress(participant, challenge);
      return participant.save();
    });

    await Promise.all(updates);

    const totalSaved = await ChallengeParticipant.aggregate([
      {$match: {challenge: challenge._id, status: 'active'}},
      {$group: {_id: null, total: {$sum: '$emissionSaved'}}},
    ]);

    const totalEmissionSaved = totalSaved.length > 0 ? totalSaved[0].total : 0;

    await Challenge.findByIdAndUpdate(id, {
      totalEmissionSaved,
    });

    res.status(200).json({
      message: 'Challenge progress updated successfully',
      totalParticipants: participants.length,
      totalEmissionSaved,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update progress error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to update challenge progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Helper function to update participant progress
 * @param {Object} participant - ChallengeParticipant document
 * @param {Object} challenge - Challenge document
 */
const updateParticipantProgress = async (participant, challenge) => {
  try {
    // Calculate baseline (emissions before joining)
    if (participant.baselineEmission === 0) {
      const baselineActivities = await Activity.find({
        user: participant.user._id,
        date: {$lt: participant.joinedAt},
      }).sort({date: -1}).limit(30); // Last 30 days before joining

      const baselineAvg = baselineActivities.length > 0 ?
          baselineActivities.reduce((sum, activity) => sum + activity.emission, 0) / baselineActivities.length :
          0;

      participant.baselineEmission = baselineAvg * challenge.duration;
    }

    // Calculate current emissions during challenge
    const challengeActivities = await Activity.find({
      user: participant.user._id,
      date: {
        $gte: challenge.startDate,
        $lte: challenge.endDate,
      },
    });

    participant.currentEmission = challengeActivities.reduce((sum, activity) => sum + activity.emission, 0);

    // Calculate emission saved (baseline - current)
    participant.emissionSaved = Math.max(0, participant.baselineEmission - participant.currentEmission);

    // Calculate progress percentage
    const targetPerDay = challenge.targetEmission / challenge.duration;
    const daysParticipated = Math.min(
        challenge.duration,
        Math.ceil((new Date() - participant.joinedAt) / (1000 * 60 * 60 * 24)),
    );

    const expectedReduction = targetPerDay * daysParticipated;
    participant.progress = participant.baselineEmission > 0 ?
        Math.min(100, (participant.emissionSaved / expectedReduction) * 100) :
        0;

    // Award points based on progress
    participant.points = Math.floor(participant.emissionSaved / 10); // 1 point per 10kg CO2 saved

    // Update streak
    const today = new Date();
    const lastActivity = participant.lastActivityDate ?
        new Date(participant.lastActivityDate) :
        participant.joinedAt;

    const daysSinceLastActivity = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity <= 1) {
      participant.streakDays += 1;
    } else {
      participant.streakDays = 1;
    }

    participant.lastActivityDate = today;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update participant progress error:', error);
    }
  }
};
