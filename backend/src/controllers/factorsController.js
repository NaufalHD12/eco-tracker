import {getAllEmissionFactors} from '../utils/emissionCalculator.js';

/**
 * Get all emission factors for frontend consumption
 * @route GET /api/factors
 * @access Private
 */
export const getFactors = async (req, res) => {
  try {
    const factors = getAllEmissionFactors();

    res.status(200).json({
      message: 'Emission factors retrieved successfully',
      factors,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get factors error:', error);
    }
    res.status(500).json({
      message: 'Failed to retrieve emission factors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
