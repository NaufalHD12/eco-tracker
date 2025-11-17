import Joi from 'joi';

// Schema for completing an onboarding step
export const completeStepSchema = Joi.object({
  stepId: Joi.string()
      .valid('welcome', 'set_target', 'first_activity', 'explore_dashboard')
      .required()
      .messages({
        'any.only': 'Step ID must be one of: welcome, set_target, first_activity, explore_dashboard',
        'any.required': 'Step ID is required',
      }),
  data: Joi.object({
    targetEmission: Joi.number().min(0).max(10000).when('stepId', {
      is: 'set_target',
      then: Joi.required(),
    }).messages({
      'number.min': 'Target emission must be at least 0',
      'number.max': 'Target emission cannot exceed 10,000',
      'any.required': 'Target emission is required when completing set_target step',
    }),
  }).optional(),
});
