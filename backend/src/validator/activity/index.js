import {createActivitySchema, updateActivitySchema, activityQuerySchema, activityStatsQuerySchema} from './schema.js';

const validateCreateActivity = (req, res, next) => {
  const {error, value} = createActivitySchema.validate(req.body, {abortEarly: false});

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

const validateUpdateActivity = (req, res, next) => {
  const {error, value} = updateActivitySchema.validate(req.body, {abortEarly: false});

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

const validateActivityQuery = (req, res, next) => {
  const {error, value} = activityQuerySchema.validate(req.query, {abortEarly: false});

  if (error) {
    return res.status(400).json({
      message: 'Query validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.query = value;
  next();
};

const validateActivityStatsQuery = (req, res, next) => {
  const {error, value} = activityStatsQuerySchema.validate(req.query, {abortEarly: false});

  if (error) {
    return res.status(400).json({
      message: 'Query validation failed',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.query = value;
  next();
};

export {
  validateCreateActivity,
  validateUpdateActivity,
  validateActivityQuery,
  validateActivityStatsQuery,
};
