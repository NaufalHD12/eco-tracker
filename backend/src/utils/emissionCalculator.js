// Emission factors based on DEFRA 2024 data
const EMISSION_FACTORS = {
  transport: {
    car_medium_petrol: 0.18887, // kg CO2e per km
    motorcycle_avg: 0.11543, // kg CO2e per km
    bus_local: 0.13783, // kg CO2e per km
    rail_national: 0.03513, // kg CO2e per km
  },
  food: {
    beef_kg: 60.0, // kg CO2e per kg
    chicken_kg: 7.5, // kg CO2e per kg
    rice_kg: 2.5, // kg CO2e per kg
  },
  energy: {
    grid_uk: 0.20709, // kg CO2e per kWh
  },
  shopping: {
    clothing_item: 7.6, // kg CO2e per item
    electronics_item: 15.0, // kg CO2e per item
  },
};

// Cache for emission factors to avoid async operations
const factorCache = new Map();

Object.entries(EMISSION_FACTORS).forEach(([category, types]) => {
  Object.entries(types).forEach(([type, factor]) => {
    factorCache.set(`${category}:${type}`, factor);
  });
});

/**
 * Get emission factor for a specific category and type
 * @param {string} category - The category (transport, food, energy, shopping)
 * @param {string} type - The specific type within the category
 * @returns {number} The emission factor in kg CO2e per unit
 * @throws {Error} If category or type is not found
 */
export const getEmissionFactor = (category, type) => {
  const factor = factorCache.get(`${category}:${type}`);
  if (factor === undefined) {
    throw new Error(`Invalid emission type: ${type} for category: ${category}`);
  }
  return factor;
};

/**
 * Calculate total emission for an activity
 * @param {string} category - The activity category
 * @param {Object} inputData - The input data for calculation
 * @returns {number} Total emission in kg CO2e
 */
export const calculateActivityEmission = (category, inputData) => {
  try {
    let emission = 0;

    switch (category) {
      case 'Transportation':
        if (inputData.transportData) {
          const {distance, vehicleType} = inputData.transportData;
          const factor = getEmissionFactor('transport', vehicleType);
          emission = distance * factor;
        }
        break;

      case 'Food':
        if (inputData.foodData) {
          const {weight, foodType} = inputData.foodData;
          const factor = getEmissionFactor('food', foodType);
          emission = weight * factor;
        }
        break;

      case 'Energy':
        if (inputData.energyData) {
          const {energyConsumption, energyType = 'grid_uk'} = inputData.energyData;
          const factor = getEmissionFactor('energy', energyType);
          emission = energyConsumption * factor;
        }
        break;

      case 'Shopping':
        if (inputData.shoppingData) {
          const {quantity, itemType} = inputData.shoppingData;
          const factor = getEmissionFactor('shopping', itemType);
          emission = quantity * factor;
        }
        break;

      default:
        throw new Error(`Unsupported category: ${category}`);
    }

    return Math.round(emission * 100) / 100;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error calculating activity emission:', error);
    }
    throw error;
  }
};

/**
 * Get all emission factors for frontend consumption
 * @returns {Object} All emission factors organized by category
 */
export const getAllEmissionFactors = () => {
  return {
    transport: Object.entries(EMISSION_FACTORS.transport).map(([key, factor]) => ({
      key,
      label: getTransportLabel(key),
      unit: 'km',
      factor,
    })),
    food: Object.entries(EMISSION_FACTORS.food).map(([key, factor]) => ({
      key,
      label: getFoodLabel(key),
      unit: 'kg',
      factor,
    })),
    energy: Object.entries(EMISSION_FACTORS.energy).map(([key, factor]) => ({
      key,
      label: getEnergyLabel(key),
      unit: 'kWh',
      factor,
    })),
    shopping: Object.entries(EMISSION_FACTORS.shopping).map(([key, factor]) => ({
      key,
      label: getShoppingLabel(key),
      unit: 'item',
      factor,
    })),
  };
};

// Helper functions for labels
const getTransportLabel = (key) => {
  const labels = {
    car_medium_petrol: 'Medium petrol car (per km)',
    motorcycle_avg: 'Average motorcycle (per km)',
    bus_local: 'Local bus (per km)',
    rail_national: 'National rail (per km)',
  };
  return labels[key] || key;
};

const getFoodLabel = (key) => {
  const labels = {
    beef_kg: 'Beef (per kg)',
    chicken_kg: 'Chicken (per kg)',
    rice_kg: 'Rice (per kg)',
  };
  return labels[key] || key;
};

const getEnergyLabel = (key) => {
  const labels = {
    grid_uk: 'UK Grid electricity (per kWh)',
  };
  return labels[key] || key;
};

const getShoppingLabel = (key) => {
  const labels = {
    clothing_item: 'Clothing item',
    electronics_item: 'Electronics item',
  };
  return labels[key] || key;
};
