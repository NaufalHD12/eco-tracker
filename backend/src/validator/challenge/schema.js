import Joi from 'joi';

// Base challenge schema
export const challengeBaseSchema = {
  title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Challenge title is required',
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Challenge title is required',
      }),

  description: Joi.string()
      .trim()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.empty': 'Challenge description is required',
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Challenge description is required',
      }),

  category: Joi.string()
      .valid('Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .required()
      .messages({
        'any.only': 'Category must be Transportation, Food, Energy, Shopping, or General',
        'any.required': 'Challenge category is required',
      }),

  startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'date.min': 'Start date cannot be in the past',
        'any.required': 'Start date is required',
      }),

  endDate: Joi.date()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startDate')).messages({
          'date.greater': 'End date must be after start date',
        }),
      })
      .required()
      .messages({
        'date.base': 'End date must be a valid date',
        'any.required': 'End date is required',
      }),

  targetEmission: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Target emission must be a number',
        'number.positive': 'Target emission must be positive',
        'any.required': 'Target emission is required',
      }),

  difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .default('Medium')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
      }),

  maxParticipants: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .allow(null)
      .messages({
        'number.base': 'Max participants must be a number',
        'number.min': 'Max participants must be at least 1',
        'number.max': 'Max participants cannot exceed 10,000',
      }),

  rules: Joi.array()
      .items(
          Joi.string()
              .trim()
              .min(5)
              .max(200)
              .messages({
                'string.min': 'Each rule must be at least 5 characters',
                'string.max': 'Each rule cannot exceed 200 characters',
              }),
      )
      .max(10)
      .messages({
        'array.max': 'Cannot have more than 10 rules',
      }),

  rewards: Joi.object({
    points: Joi.number()
        .integer()
        .min(0)
        .max(10000)
        .default(0)
        .messages({
          'number.base': 'Reward points must be a number',
          'number.min': 'Reward points cannot be negative',
          'number.max': 'Reward points cannot exceed 10,000',
        }),

    badge: Joi.string()
        .trim()
        .max(50)
        .messages({
          'string.max': 'Badge name cannot exceed 50 characters',
        }),

    description: Joi.string()
        .trim()
        .max(200)
        .messages({
          'string.max': 'Reward description cannot exceed 200 characters',
        }),
  }),
};

// Create challenge schema
export const createChallengeSchema = Joi.object({
  ...challengeBaseSchema,
});

// Update challenge schema (all fields optional)
export const updateChallengeSchema = Joi.object({
  title: challengeBaseSchema.title.optional(),
  description: challengeBaseSchema.description.optional(),
  category: challengeBaseSchema.category.optional(),
  startDate: challengeBaseSchema.startDate.optional(),
  endDate: challengeBaseSchema.endDate.optional(),
  targetEmission: challengeBaseSchema.targetEmission.optional(),
  difficulty: challengeBaseSchema.difficulty.optional(),
  maxParticipants: challengeBaseSchema.maxParticipants.optional(),
  rules: challengeBaseSchema.rules.optional(),
  rewards: challengeBaseSchema.rewards.optional(),
});

// Query parameters schema
export const challengeQuerySchema = Joi.object({
  page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1',
      }),

  limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),

  category: Joi.string()
      .valid('Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .messages({
        'any.only': 'Category must be Transportation, Food, Energy, Shopping, or General',
      }),

  status: Joi.string()
      .valid('upcoming', 'active', 'completed', 'cancelled')
      .messages({
        'any.only': 'Status must be upcoming, active, completed, or cancelled',
      }),

  difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
      }),

  sortBy: Joi.string()
      .valid('createdAt', 'startDate', 'endDate', 'targetEmission', 'totalParticipants')
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be createdAt, startDate, endDate, targetEmission, or totalParticipants',
      }),

  order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Order must be asc or desc',
      }),
});

// Leaderboard query schema
export const leaderboardQuerySchema = Joi.object({
  limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50',
      }),
});
