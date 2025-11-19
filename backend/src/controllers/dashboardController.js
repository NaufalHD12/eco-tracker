import Activity from '../models/Activity.js';
import User from '../models/User.js';
import {calculateMonthlySavingsTrees} from '../utils/treeCalculator.js';

/**
 * Get dashboard data with aggregated emissions
 * @route GET /api/dashboard
 * @access Private
 */
export const getDashboard = async (req, res) => {
  try {
    const {period = 'weekly', startDate, endDate} = req.query;
    const userId = req.user.userId;

    // Get user profile for target emission
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Determine date range
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      // Custom date range
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Period-based filtering
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
        default:
          dateFilter.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    // Get total emission for the period
    const totalEmissionResult = await Activity.aggregate([
      {
        $match: {
          user: userId,
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalEmission: {$sum: '$emission'},
        },
      },
    ]);

    const totalEmission = totalEmissionResult.length > 0 ?
      Math.round(totalEmissionResult[0].totalEmission * 100) / 100 :
      0;

    // Calculate daily average
    const periodDays = Math.ceil((dateFilter.$gte - now) / (1000 * 60 * 60 * 24)) * -1;
    const dailyAverage = periodDays > 0 ?
      Math.round((totalEmission / periodDays) * 100) / 100 :
      0;

    // Calculate trees based on period type
    let totalTrees = user.totalTrees || 0; // Start with already awarded trees

    // Only calculate savings-based trees for monthly period
    if (period === 'monthly' && user.targetEmission > 0) {
      const monthlySavingsTrees = calculateMonthlySavingsTrees(user.targetEmission, totalEmission);
      totalTrees += monthlySavingsTrees;
    }

    // Get category breakdown
    const categoryBreakdown = await Activity.aggregate([
      {
        $match: {
          user: userId,
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

    // Calculate percentages
    const categoryBreakdownWithPercentages = categoryBreakdown.map((category) => ({
      category: category._id,
      total: Math.round(category.totalEmission * 100) / 100,
      count: category.count,
      percentage: totalEmission > 0 ?
        Math.round((category.totalEmission / totalEmission) * 100 * 100) / 100 :
        0,
    }));

    // Get chart data (daily emissions for the period)
    const chartData = await getChartData(userId, dateFilter, period);

    const dashboardData = {
      summary: {
        totalEmission,
        targetEmission: user.targetEmission || 0,
        dailyAverage,
        totalTrees,
      },
      chartData,
      categoryBreakdown: categoryBreakdownWithPercentages,
    };

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      dashboard: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      message: 'Failed to retrieve dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get chart data for the specified period
 * @param {string} userId - User ID
 * @param {Object} dateFilter - Date filter object
 * @param {string} period - Period type (weekly, monthly, yearly)
 * @returns {Object} Chart data with labels and data arrays
 */
const getChartData = async (userId, dateFilter, period) => {
  const now = new Date();
  let groupBy;
  let labels = [];

  // Determine grouping and labels based on period
  switch (period) {
    case 'weekly':
      groupBy = {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$date',
        },
      };
      // Generate last 7 days labels
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(date.toISOString().split('T')[0]);
      }
      break;

    case 'monthly': {
      groupBy = {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$date',
        },
      };
      // Generate monthly labels (simplified to show daily for current month)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        labels.push(d.toISOString().split('T')[0]);
      }
      break;
    }

    case 'yearly': {
      groupBy = {
        year: {$year: '$date'},
        month: {$month: '$date'},
      };
      // Generate monthly labels for the year
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      labels = monthNames;
      break;
    }

    default:
      // Default to weekly
      groupBy = {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$date',
        },
      };
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(date.toISOString().split('T')[0]);
      }
  }

  const chartResult = await Activity.aggregate([
    {
      $match: {
        user: userId,
        date: dateFilter,
      },
    },
    {
      $group: {
        _id: groupBy,
        totalEmission: {$sum: '$emission'},
      },
    },
    {
      $sort: {_id: 1},
    },
  ]);

  // Create data array matching labels
  const data = labels.map((label) => {
    if (period === 'yearly') {
      // For yearly, find by month name
      const monthIndex = labels.indexOf(label) + 1;
      const found = chartResult.find((item) => item._id.month === monthIndex);
      return found ? Math.round(found.totalEmission * 100) / 100 : 0;
    } else {
      // For weekly/monthly, find by date string
      const found = chartResult.find((item) => item._id === label);
      return found ? Math.round(found.totalEmission * 100) / 100 : 0;
    }
  });

  return {
    labels,
    data,
  };
};
