import Joi from 'joi';

export const createActivitySchema = Joi.object({
  category: Joi.string()
      .valid('Transportation', 'Food', 'Energy', 'Shopping')
      .required()
      .messages({
        'any.required': 'Category is required',
        'any.only': 'Category must be one of: Transportation, Food, Energy, Shopping',
      }),

  note: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Note cannot exceed 500 characters',
      }),

  date: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Date must be in ISO format',
      }),

  transportData: Joi.when('category', {
    is: 'Transportation',
    then: Joi.object({
      distance: Joi.number()
          .min(0.1)
          .max(10000)
          .required()
          .messages({
            'number.min': 'Distance must be at least 0.1 km',
            'number.max': 'Distance cannot exceed 10,000 km',
            'any.required': 'Distance is required for transport activities',
          }),
      vehicleType: Joi.string()
          .valid('car_medium_petrol', 'motorcycle_avg', 'bus_local', 'rail_national')
          .required()
          .messages({
            'any.required': 'Vehicle type is required for transport activities',
            'any.only': 'Invalid vehicle type',
          }),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  foodData: Joi.when('category', {
    is: 'Food',
    then: Joi.object({
      weight: Joi.number()
          .min(0.01)
          .max(1000)
          .required()
          .messages({
            'number.min': 'Weight must be at least 0.01 kg',
            'number.max': 'Weight cannot exceed 1,000 kg',
            'any.required': 'Weight is required for food activities',
          }),
      foodType: Joi.string()
          .valid('beef_kg', 'chicken_kg', 'rice_kg')
          .required()
          .messages({
            'any.required': 'Food type is required for food activities',
            'any.only': 'Invalid food type',
          }),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  energyData: Joi.when('category', {
    is: 'Energy',
    then: Joi.object({
      energyConsumption: Joi.number()
          .min(0.01)
          .max(10000)
          .required()
          .messages({
            'number.min': 'Energy consumption must be at least 0.01 kWh',
            'number.max': 'Energy consumption cannot exceed 10,000 kWh',
            'any.required': 'Energy consumption is required for energy activities',
          }),
      energyType: Joi.string()
          .valid('grid_uk')
          .default('grid_uk')
          .messages({
            'any.only': 'Invalid energy type',
          }),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  shoppingData: Joi.when('category', {
    is: 'Shopping',
    then: Joi.object({
      quantity: Joi.number()
          .integer()
          .min(1)
          .max(1000)
          .required()
          .messages({
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity cannot exceed 1,000',
            'number.integer': 'Quantity must be a whole number',
            'any.required': 'Quantity is required for shopping activities',
          }),
      itemType: Joi.string()
          .valid('clothing_item', 'electronics_item')
          .required()
          .messages({
            'any.required': 'Item type is required for shopping activities',
            'any.only': 'Invalid item type',
          }),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
}).messages({
  'object.unknown': 'Unknown field: {#label}',
});

export const updateActivitySchema = Joi.object({
  category: Joi.string()
      .valid('Transportation', 'Food', 'Energy', 'Shopping')
      .optional()
      .messages({
        'any.only': 'Category must be one of: Transportation, Food, Energy, Shopping',
      }),

  note: Joi.string()
      .trim()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Note cannot exceed 500 characters',
      }),

  date: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Date must be in ISO format',
      }),

  transportData: Joi.object({
    distance: Joi.number()
        .min(0.1)
        .max(10000)
        .required()
        .messages({
          'number.min': 'Distance must be at least 0.1 km',
          'number.max': 'Distance cannot exceed 10,000 km',
          'any.required': 'Distance is required for transport activities',
        }),
    vehicleType: Joi.string()
        .valid('car_medium_petrol', 'motorcycle_avg', 'bus_local', 'rail_national')
        .required()
        .messages({
          'any.required': 'Vehicle type is required for transport activities',
          'any.only': 'Invalid vehicle type',
        }),
  }).optional(),

  foodData: Joi.object({
    weight: Joi.number()
        .min(0.01)
        .max(1000)
        .required()
        .messages({
          'number.min': 'Weight must be at least 0.01 kg',
          'number.max': 'Weight cannot exceed 1,000 kg',
          'any.required': 'Weight is required for food activities',
        }),
    foodType: Joi.string()
        .valid('beef_kg', 'chicken_kg', 'rice_kg')
        .required()
        .messages({
          'any.required': 'Food type is required for food activities',
          'any.only': 'Invalid food type',
        }),
  }).optional(),

  energyData: Joi.object({
    energyConsumption: Joi.number()
        .min(0.01)
        .max(10000)
        .required()
        .messages({
          'number.min': 'Energy consumption must be at least 0.01 kWh',
          'number.max': 'Energy consumption cannot exceed 10,000 kWh',
          'any.required': 'Energy consumption is required for energy activities',
        }),
    energyType: Joi.string()
        .valid('grid_uk')
        .default('grid_uk')
        .messages({
          'any.only': 'Invalid energy type',
        }),
  }).optional(),

  shoppingData: Joi.object({
    quantity: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
        .messages({
          'number.min': 'Quantity must be at least 1',
          'number.max': 'Quantity cannot exceed 1,000',
          'number.integer': 'Quantity must be a whole number',
          'any.required': 'Quantity is required for shopping activities',
        }),
    itemType: Joi.string()
        .valid('clothing_item', 'electronics_item')
        .required()
        .messages({
          'any.required': 'Item type is required for shopping activities',
          'any.only': 'Invalid item type',
        }),
  }).optional(),
}).messages({
  'object.unknown': 'Unknown field: {#label}',
});

export const activityQuerySchema = Joi.object({
  page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.min': 'Page must be at least 1',
        'number.integer': 'Page must be an integer',
      }),

  limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.integer': 'Limit must be an integer',
      }),

  category: Joi.string()
      .valid('Transportation', 'Food', 'Energy', 'Shopping')
      .optional()
      .messages({
        'any.only': 'Category must be one of: Transportation, Food, Energy, Shopping',
      }),

  startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),

  endDate: Joi.date()
      .iso()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startDate')).messages({
          'date.greater': 'End date must be after start date',
        }),
        otherwise: Joi.optional(),
      })
      .messages({
        'date.format': 'End date must be in ISO format',
      }),

  sortBy: Joi.string()
      .valid('date', 'emission')
      .default('date')
      .messages({
        'any.only': 'Sort by must be either date or emission',
      }),

  order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Order must be either asc or desc',
      }),
});

export const activityStatsQuerySchema = Joi.object({
  period: Joi.string()
      .valid('weekly', 'monthly', 'yearly')
      .default('weekly')
      .messages({
        'any.only': 'Period must be one of: weekly, monthly, yearly',
      }),

  startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),

  endDate: Joi.date()
      .iso()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startDate')).messages({
          'date.greater': 'End date must be after start date',
        }),
        otherwise: Joi.optional(),
      })
      .messages({
        'date.format': 'End date must be in ISO format',
      }),
});
