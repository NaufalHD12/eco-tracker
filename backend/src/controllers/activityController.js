import Activity from '../models/Activity.js';
import {calculateActivityEmission} from '../utils/emissionCalculator.js';

const buildFilterQuery = (userId, query) => {
  const filter = {user: userId};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.date.$lte = new Date(query.endDate);
    }
  }

  return filter;
};

const buildSortOptions = (sortBy, order) => {
  const sortOptions = {};
  const sortOrder = order === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'date':
      sortOptions.date = sortOrder;
      break;
    case 'emission':
      sortOptions.emission = sortOrder;
      break;
    default:
      sortOptions.date = -1;
  }

  return sortOptions;
};

const generateActivityDetails = (category, inputData) => {
  switch (category) {
    case 'Transportation':
      if (inputData.transportData) {
        const {distance, vehicleType} = inputData.transportData;
        return `${vehicleType} (${distance} km)`;
      }
      break;
    case 'Food':
      if (inputData.foodData) {
        const {weight, foodType} = inputData.foodData;
        return `${foodType} (${weight} kg)`;
      }
      break;
    case 'Energy':
      if (inputData.energyData) {
        const {energyConsumption, energyType} = inputData.energyData;
        return `${energyType} (${energyConsumption} kWh)`;
      }
      break;
    case 'Shopping':
      if (inputData.shoppingData) {
        const {quantity, itemType} = inputData.shoppingData;
        return `${itemType} (${quantity} item${quantity > 1 ? 's' : ''})`;
      }
      break;
  }
  return 'Activity details';
};

/**
 * Get all activities for a user
 * @route GET /api/activities
 * @access Private
 */
export const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = buildFilterQuery(req.user.userId, req.query);
    const sortOptions = buildSortOptions(req.query.sortBy, req.query.order);

    const activities = await Activity.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email');

    const total = await Activity.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get activities error:', error);
    }
    res.status(500).json({
      message: 'Failed to fetch activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single activity
 * @route GET /api/activities/:id
 * @access Private
 */
export const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate('user', 'name email');

    if (!activity) {
      return res.status(404).json({message: 'Activity not found'});
    }

    res.status(200).json(activity);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get activity error:', error);
    }
    if (error.name === 'CastError') {
      return res.status(400).json({message: 'Invalid activity ID'});
    }
    res.status(500).json({
      message: 'Failed to fetch activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create new activity
 * @route POST /api/activities
 * @access Private
 */
export const createActivity = async (req, res) => {
  try {
    const {category, note, ...inputData} = req.body;

    const emission = calculateActivityEmission(category, inputData);

    const details = generateActivityDetails(category, inputData);

    const activity = await Activity.create({
      user: req.user.userId,
      category,
      details,
      emission,
      note,
      inputData,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    await activity.populate('user', 'name email');

    res.status(201).json({
      message: 'Activity logged successfully',
      activity,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create activity error:', error);
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    res.status(500).json({
      message: 'Failed to create activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update activity
 * @route PUT /api/activities/:id
 * @access Private
 */
export const updateActivity = async (req, res) => {
  try {
    const {category, note, date, ...inputData} = req.body;

    const existingActivity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!existingActivity) {
      return res.status(404).json({message: 'Activity not found'});
    }

    let emission = existingActivity.emission;
    let details = existingActivity.details;
    const finalCategory = category || existingActivity.category;
    const finalInputData = Object.keys(inputData).length > 0 ? inputData : existingActivity.inputData;

    if (category !== undefined || JSON.stringify(inputData) !== JSON.stringify(existingActivity.inputData)) {
      emission = calculateActivityEmission(finalCategory, finalInputData);
      details = generateActivityDetails(finalCategory, finalInputData);
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        {
          category: category || existingActivity.category,
          details,
          emission,
          note: note !== undefined ? note : existingActivity.note,
          inputData: Object.keys(inputData).length > 0 ? inputData : existingActivity.inputData,
          date: date ? new Date(date) : existingActivity.date,
        },
        {
          new: true,
          runValidators: true,
        },
    ).populate('user', 'name email');

    res.status(200).json({
      message: 'Activity updated successfully',
      activity: updatedActivity,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update activity error:', error);
    }
    if (error.name === 'CastError') {
      return res.status(400).json({message: 'Invalid activity ID'});
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    res.status(500).json({
      message: 'Failed to update activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete activity
 * @route DELETE /api/activities/:id
 * @access Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!activity) {
      return res.status(404).json({message: 'Activity not found'});
    }

    res.status(204).send();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete activity error:', error);
    }
    if (error.name === 'CastError') {
      return res.status(400).json({message: 'Invalid activity ID'});
    }
    res.status(500).json({
      message: 'Failed to delete activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get activity statistics
 * @route GET /api/activities/stats/summary
 * @access Private
 */
export const getActivityStats = async (req, res) => {
  try {
    const {period = 'weekly', startDate, endDate} = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      switch (period) {
        case 'weekly':
          dateFilter.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          dateFilter.$gte = new Date(now.getFullYear(), 0, 1);
          break;
      }
    }

    const stats = await Activity.aggregate([
      {
        $match: {
          user: req.user.userId,
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: '$category',
          totalEmission: {$sum: '$emission'},
          count: {$sum: 1},
        },
      },
      {
        $sort: {totalEmission: -1},
      },
    ]);

    const totalEmission = stats.reduce((sum, stat) => sum + stat.totalEmission, 0);
    const totalActivities = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.status(200).json({
      period,
      totalEmission: Math.round(totalEmission * 100) / 100,
      totalActivities,
      categoryBreakdown: stats.map((stat) => ({
        category: stat._id,
        totalEmission: Math.round(stat.totalEmission * 100) / 100,
        count: stat.count,
        percentage: totalEmission > 0 ? Math.round((stat.totalEmission / totalEmission) * 100 * 100) / 100 : 0,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get activity stats error:', error);
    }
    res.status(500).json({
      message: 'Failed to fetch activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
