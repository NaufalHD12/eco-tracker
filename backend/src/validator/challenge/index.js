import {
  createChallengeSchema,
  updateChallengeSchema,
  challengeQuerySchema,
  leaderboardQuerySchema,
} from './schema.js';

/**
 * Middleware to validate challenge creation data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateCreateChallenge = (req, res, next) => {
  const {error, value} = createChallengeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.body = value;
  next();
};

/**
 * Middleware to validate challenge update data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUpdateChallenge = (req, res, next) => {
  const {error, value} = updateChallengeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.body = value;
  next();
};

/**
 * Middleware to validate challenge query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateChallengeQuery = (req, res, next) => {
  const {error} = challengeQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Query validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Middleware to validate leaderboard query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateLeaderboardQuery = (req, res, next) => {
  const {error} = leaderboardQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Query validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};
