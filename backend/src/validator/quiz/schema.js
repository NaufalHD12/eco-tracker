import Joi from 'joi';

// Question schema for embedded questions
const questionSchema = Joi.object({
  question: Joi.string()
      .required()
      .min(10)
      .max(500)
      .messages({
        'string.empty': 'Question text is required',
        'string.min': 'Question must be at least 10 characters',
        'string.max': 'Question cannot exceed 500 characters',
        'any.required': 'Question text is required',
      }),

  options: Joi.array()
      .items(Joi.string().trim().min(1).max(200))
      .min(2)
      .max(6)
      .required()
      .messages({
        'array.min': 'At least 2 options are required',
        'array.max': 'Maximum 6 options allowed',
        'any.required': 'Options are required',
        'string.min': 'Option cannot be empty',
        'string.max': 'Option cannot exceed 200 characters',
      }),

  correctAnswer: Joi.number()
      .integer()
      .min(0)
      .max(5)
      .required()
      .messages({
        'number.base': 'Correct answer must be a number',
        'number.min': 'Correct answer index must be non-negative',
        'number.max': 'Correct answer index cannot exceed 5',
        'any.required': 'Correct answer is required',
      }),

  explanation: Joi.string()
      .trim()
      .max(300)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Explanation cannot exceed 300 characters',
      }),

  points: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.base': 'Points must be a number',
        'number.min': 'Points must be at least 1',
        'number.max': 'Points cannot exceed 50',
      }),

  category: Joi.string()
      .valid('Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .default('General')
      .messages({
        'any.only': 'Category must be Carbon Footprint, Transportation, Food, Energy, Shopping, or General',
      }),
});

// Quiz creation schema
export const createQuizSchema = Joi.object({
  title: Joi.string()
      .required()
      .min(5)
      .max(100)
      .trim()
      .messages({
        'string.empty': 'Quiz title is required',
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Quiz title is required',
      }),

  description: Joi.string()
      .required()
      .min(10)
      .max(300)
      .trim()
      .messages({
        'string.empty': 'Quiz description is required',
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 300 characters',
        'any.required': 'Quiz description is required',
      }),

  category: Joi.string()
      .valid('Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .required()
      .messages({
        'any.only': 'Category must be Carbon Footprint, Transportation, Food, Energy, Shopping, or General',
        'any.required': 'Quiz category is required',
      }),

  difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .default('Medium')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
      }),

  questions: Joi.array()
      .items(questionSchema)
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.min': 'At least 1 question is required',
        'array.max': 'Maximum 50 questions allowed',
        'any.required': 'Questions are required',
      }),

  estimatedTime: Joi.number()
      .integer()
      .min(1)
      .max(120)
      .default(10)
      .messages({
        'number.base': 'Estimated time must be a number',
        'number.min': 'Estimated time must be at least 1 minute',
        'number.max': 'Estimated time cannot exceed 120 minutes',
      }),

  isActive: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'isActive must be a boolean',
      }),

  tags: Joi.array()
      .items(Joi.string().trim().min(1).max(30))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Tag cannot exceed 30 characters',
      }),
});

// Quiz update schema (all fields optional)
export const updateQuizSchema = Joi.object({
  title: Joi.string()
      .min(5)
      .max(100)
      .trim()
      .messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 100 characters',
      }),

  description: Joi.string()
      .min(10)
      .max(300)
      .trim()
      .messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 300 characters',
      }),

  category: Joi.string()
      .valid('Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .messages({
        'any.only': 'Category must be Carbon Footprint, Transportation, Food, Energy, Shopping, or General',
      }),

  difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
      }),

  questions: Joi.array()
      .items(questionSchema)
      .min(1)
      .max(50)
      .messages({
        'array.min': 'At least 1 question is required',
        'array.max': 'Maximum 50 questions allowed',
      }),

  estimatedTime: Joi.number()
      .integer()
      .min(1)
      .max(120)
      .messages({
        'number.base': 'Estimated time must be a number',
        'number.min': 'Estimated time must be at least 1 minute',
        'number.max': 'Estimated time cannot exceed 120 minutes',
      }),

  isActive: Joi.boolean()
      .messages({
        'boolean.base': 'isActive must be a boolean',
      }),

  tags: Joi.array()
      .items(Joi.string().trim().min(1).max(30))
      .max(10)
      .messages({
        'array.max': 'Maximum 10 tags allowed',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Tag cannot exceed 30 characters',
      }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Quiz query schema
export const quizQuerySchema = Joi.object({
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
      .valid('Carbon Footprint', 'Transportation', 'Food', 'Energy', 'Shopping', 'General')
      .messages({
        'any.only': 'Category must be Carbon Footprint, Transportation, Food, Energy, Shopping, or General',
      }),

  difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
      }),

  isActive: Joi.string()
      .valid('true', 'false')
      .messages({
        'any.only': 'isActive must be true or false',
      }),

  sortBy: Joi.string()
      .valid('createdAt', 'title', 'category', 'difficulty')
      .default('createdAt')
      .messages({
        'any.only': 'sortBy must be createdAt, title, category, or difficulty',
      }),

  order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'order must be asc or desc',
      }),
});

// Quiz submission schema
export const submitQuizSchema = Joi.object({
  answers: Joi.array()
      .items(Joi.object({
        questionId: Joi.string()
            .required()
            .messages({
              'string.empty': 'Question ID is required',
              'any.required': 'Question ID is required',
            }),

        selectedAnswer: Joi.number()
            .integer()
            .min(0)
            .max(5)
            .required()
            .messages({
              'number.base': 'Selected answer must be a number',
              'number.min': 'Selected answer index must be non-negative',
              'number.max': 'Selected answer index cannot exceed 5',
              'any.required': 'Selected answer is required',
            }),

        timeSpent: Joi.number()
            .integer()
            .min(0)
            .max(3600) // Max 1 hour per question
            .default(0)
            .messages({
              'number.base': 'Time spent must be a number',
              'number.min': 'Time spent cannot be negative',
              'number.max': 'Time spent cannot exceed 3600 seconds',
            }),
      }))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least 1 answer is required',
        'any.required': 'Answers are required',
      }),

  timeSpent: Joi.number()
      .integer()
      .min(0)
      .max(7200) // Max 2 hours for entire quiz
      .default(0)
      .messages({
        'number.base': 'Total time spent must be a number',
        'number.min': 'Total time spent cannot be negative',
        'number.max': 'Total time spent cannot exceed 7200 seconds',
      }),
});
