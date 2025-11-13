import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
      }),
  email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
      }),
  password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required',
      }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
      }),

  password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
      }),

  targetEmission: Joi.number()
      .min(0)
      .max(10000)
      .messages({
        'number.min': 'Target emission cannot be negative',
        'number.max': 'Target emission cannot exceed 10,000',
      }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Current password is required',
        'any.required': 'Current password is required',
      }),

  newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 6 characters',
        'string.max': 'New password cannot exceed 128 characters',
        'any.required': 'New password is required',
      }),
});
