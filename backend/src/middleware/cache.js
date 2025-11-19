import {getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL} from '../config/upstash.js';

/**
 * Cache middleware for emission factors
 */
export const factorsCacheMiddleware = async (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  try {
    const cacheKey = CACHE_KEYS.EMISSION_FACTORS;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        cached: true,
        cacheExpiry: new Date(Date.now() + CACHE_TTL.FACTORS * 1000).toISOString(),
      });
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      if (res.statusCode === 200 && data.message && data.message.includes('successfully')) {
        setCache(cacheKey, data, CACHE_TTL.FACTORS).catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Factors cache set error:', err);
          }
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Factors cache middleware error:', error);
    }
    next(); // Continue without caching
  }
};

export const invalidateFactorsCache = async () => {
  try {
    await deleteCache(CACHE_KEYS.EMISSION_FACTORS);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Factors cache invalidation error:', error);
    }
  }
};
