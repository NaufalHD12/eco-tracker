import createHttpError from 'http-errors';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';


/**
 * Get all quizzes with filtering and pagination
 * @route GET /api/quizzes
 * @access Private
 */
export const getQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      isActive = true,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const userId = req.user.userId;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Find quizzes user has completed in last 30 days (cooldown period)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts = await QuizAttempt.find({
      user: userId,
      status: 'completed',
      completedAt: {$gte: thirtyDaysAgo},
    }).distinct('quiz');

    // Exclude recently completed quizzes
    filter._id = {$nin: recentAttempts};

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-questions'); // Don't include questions in list view

    const total = await Quiz.countDocuments(filter);

    const pagination = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    // Calculate next available quiz date
    let nextAvailableDate = null;
    if (recentAttempts.length > 0) {
      const latestAttempt = await QuizAttempt.findOne({
        user: userId,
        quiz: {$in: recentAttempts},
      }).sort({completedAt: -1});

      if (latestAttempt) {
        nextAvailableDate = new Date(latestAttempt.completedAt);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 30);
      }
    }

    const response = {
      message: 'Quizzes retrieved successfully',
      quizzes,
      pagination,
    };

    if (recentAttempts.length > 0) {
      response.cooldownInfo = {
        recentlyCompleted: recentAttempts.length,
        nextAvailableDate,
        cooldownDays: 30,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get quizzes error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get active quizzes
 * @route GET /api/quizzes/active
 * @access Private
 */
export const getActiveQuizzes = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find quizzes user has completed in last 30 days (cooldown period)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts = await QuizAttempt.find({
      user: userId,
      status: 'completed',
      completedAt: {$gte: thirtyDaysAgo},
    }).distinct('quiz');

    // Get active quizzes excluding recently completed ones
    const quizzes = await Quiz.find({
      isActive: true,
      _id: {$nin: recentAttempts},
    })
        .populate('createdBy', 'name email')
        .select('-questions')
        .sort({createdAt: -1});

    // Calculate next available quiz date
    let nextAvailableDate = null;
    if (recentAttempts.length > 0) {
      const latestAttempt = await QuizAttempt.findOne({
        user: userId,
        quiz: {$in: recentAttempts},
      }).sort({completedAt: -1});

      if (latestAttempt) {
        nextAvailableDate = new Date(latestAttempt.completedAt);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 30);
      }
    }

    const response = {
      message: 'Active quizzes retrieved successfully',
      quizzes,
    };

    if (recentAttempts.length > 0) {
      response.cooldownInfo = {
        recentlyCompleted: recentAttempts.length,
        nextAvailableDate,
        cooldownDays: 30,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get active quizzes error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve active quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single quiz by ID (without answers for taking quiz)
 * @route GET /api/quizzes/:id
 * @access Private
 */
export const getQuiz = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.userId;

    const quiz = await Quiz.findById(id)
        .populate('createdBy', 'name email');

    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    if (!quiz.isActive) {
      throw createHttpError(404, 'Quiz is not available');
    }

    // Check if user has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: id,
      status: 'completed',
    });

    // Remove correct answers from questions for quiz taking
    const quizForTaking = quiz.toObject();
    quizForTaking.questions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
      category: q.category,
    }));

    const response = {
      message: 'Quiz retrieved successfully',
      quiz: quizForTaking,
      hasAttempted: !!existingAttempt,
    };

    if (existingAttempt) {
      response.previousAttempt = {
        score: existingAttempt.score,
        percentage: existingAttempt.percentage,
        grade: existingAttempt.grade,
        completedAt: existingAttempt.completedAt,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get quiz error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new quiz
 * @route POST /api/quizzes
 * @access Private (Admin only)
 */
export const createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    await quiz.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create quiz error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to create quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a quiz
 * @route PUT /api/quizzes/:id
 * @access Private (Admin only)
 */
export const updateQuiz = async (req, res) => {
  try {
    const {id} = req.params;

    const quiz = await Quiz.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
    ).populate('createdBy', 'name email');

    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update quiz error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to update quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a quiz
 * @route DELETE /api/quizzes/:id
 * @access Private (Admin only)
 */
export const deleteQuiz = async (req, res) => {
  try {
    const {id} = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    // Remove all attempts for this quiz
    await QuizAttempt.deleteMany({quiz: id});

    res.status(204).send();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete quiz error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to delete quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Start or continue a quiz attempt
 * @route POST /api/quizzes/:id/attempt
 * @access Private
 */
export const startQuizAttempt = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = req.user.userId;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    if (!quiz.isActive) {
      throw createHttpError(400, 'Quiz is not available');
    }

    // Check if user already has a completed attempt
    let attempt = await QuizAttempt.findOne({
      user: userId,
      quiz: id,
    });

    if (!attempt) {
      // Create new attempt
      attempt = new QuizAttempt({
        user: userId,
        quiz: id,
        status: 'in_progress',
      });
      await attempt.save();
    } else if (attempt.status === 'completed') {
      throw createHttpError(409, 'Quiz already completed. Cannot retake.');
    }

    res.status(200).json({
      message: 'Quiz attempt started successfully',
      attempt: {
        id: attempt._id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        answers: attempt.answers.length,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Start quiz attempt error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to start quiz attempt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Submit quiz answers
 * @route POST /api/quizzes/:id/submit
 * @access Private
 */
export const submitQuiz = async (req, res) => {
  try {
    const {id} = req.params;
    const {answers, timeSpent} = req.body;
    const userId = req.user.userId;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    // Get or create attempt
    const attempt = await QuizAttempt.findOne({
      user: userId,
      quiz: id,
    });

    if (!attempt) {
      throw createHttpError(400, 'No active quiz attempt found');
    }

    if (attempt.status === 'completed') {
      throw createHttpError(409, 'Quiz already completed');
    }

    // Create question map for efficient lookup
    const questionMap = new Map();
    quiz.questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    // Process answers
    const processedAnswers = answers.map((answer) => {
      const question = questionMap.get(answer.questionId.toString());

      if (!question) {
        throw createHttpError(400, `Question ${answer.questionId} not found`);
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      const pointsEarned = isCorrect ? question.points : 0;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: answer.timeSpent || 0,
      };
    });

    // Update attempt
    attempt.answers = processedAnswers;
    attempt.timeSpent = timeSpent || 0;
    attempt.status = 'completed';
    await attempt.save();

    res.status(200).json({
      message: 'Quiz submitted successfully',
      result: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        grade: attempt.grade,
        timeSpent: attempt.timeSpent,
        isPassed: attempt.isPassed,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Submit quiz error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get quiz results for a specific attempt
 * @route GET /api/quizzes/:id/results/:attemptId
 * @access Private
 */
export const getQuizResults = async (req, res) => {
  try {
    const {id, attemptId} = req.params;
    const userId = req.user.userId;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: id,
      user: userId,
      status: 'completed',
    }).populate('quiz', 'title description category difficulty totalPoints');

    if (!attempt) {
      throw createHttpError(404, 'Quiz attempt not found');
    }

    // Get full quiz with answers for detailed results
    const quiz = await Quiz.findById(id);

    // Combine attempt answers with question details
    const detailedResults = attempt.answers.map((answer) => {
      // Find question by ID (handle both string and ObjectId)
      const question = quiz.questions.find((q) =>
        q._id.toString() === answer.questionId.toString(),
      );

      if (!question) {
        // Fallback if question not found
        return {
          question: 'Question not found',
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: null,
          selectedAnswerText: 'Unknown',
          correctAnswerText: 'Unknown',
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          pointsPossible: 0,
          explanation: null,
          timeSpent: answer.timeSpent,
        };
      }

      return {
        question: question.question,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        selectedAnswerText: question.options[answer.selectedAnswer] || 'Invalid option',
        correctAnswerText: question.options[question.correctAnswer] || 'Invalid option',
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        pointsPossible: question.points,
        explanation: question.explanation,
        timeSpent: answer.timeSpent,
      };
    });

    res.status(200).json({
      message: 'Quiz results retrieved successfully',
      quiz: {
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        category: attempt.quiz.category,
        difficulty: attempt.quiz.difficulty,
      },
      results: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        grade: attempt.grade,
        timeSpent: attempt.timeSpent,
        isPassed: attempt.isPassed,
        completedAt: attempt.completedAt,
      },
      answers: detailedResults,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get quiz results error:', error);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve quiz results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user's quiz statistics
 * @route GET /api/quizzes/stats/user
 * @access Private
 */
export const getUserQuizStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await QuizAttempt.getUserStats(userId);

    const userStats = stats && stats.length > 0 ? stats[0] : {
      totalAttempts: 0,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      totalTimeSpent: 0,
      passedCount: 0,
    };

    // Get recent attempts
    const recentAttempts = await QuizAttempt.find({
      user: userId,
      status: 'completed',
    })
        .populate('quiz', 'title category difficulty totalQuestions totalPoints')
        .sort({completedAt: -1})
        .limit(5)
        .select('score percentage grade completedAt quiz correctAnswers totalQuestions');

    res.status(200).json({
      message: 'User quiz statistics retrieved successfully',
      statistics: userStats,
      recentAttempts,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get user quiz stats error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve user quiz statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get quiz statistics for admin
 * @route GET /api/quizzes/:id/stats
 * @access Private (Admin only)
 */
export const getQuizStats = async (req, res) => {
  try {
    const {id} = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw createHttpError(404, 'Quiz not found');
    }

    const stats = await QuizAttempt.getQuizStats(id);

    const quizStats = stats && stats.length > 0 ? stats[0] : {
      totalAttempts: 0,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      averageTimeSpent: 0,
    };

    res.status(200).json({
      message: 'Quiz statistics retrieved successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
      },
      statistics: quizStats,
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve quiz statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
