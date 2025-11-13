import {getCache, setCache, deleteCache, invalidateCachePattern, CACHE_KEYS, CACHE_TTL} from '../config/upstash.js';

/**
 * Cache middleware for quiz endpoints
 */
export const quizCacheMiddleware = async (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  try {
    let cacheKey;
    const ttl = CACHE_TTL.QUIZZES;

    // Determine cache key based on route
    if (req.path === '/active') {
      cacheKey = CACHE_KEYS.QUIZZES_ACTIVE;
    } else if (req.path === '/' && req.query.category) {
      cacheKey = CACHE_KEYS.QUIZZES_BY_CATEGORY(req.query.category);
    } else if (req.path === '/') {
      cacheKey = CACHE_KEYS.QUIZZES_ALL;
    } else {
      // Don't cache other routes like /:id, /:id/results/:attemptId, etc.
      return next();
    }

    // Try to get cached data
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        cached: true,
        cacheExpiry: new Date(Date.now() + ttl * 1000).toISOString(),
      });
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      if (res.statusCode === 200 && data.message && data.message.includes('successfully')) {
        setCache(cacheKey, data, ttl).catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Cache set error:', err);
          }
        });
      }
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Quiz cache middleware error:', error);
    }
    next(); // Continue without caching
  }
};

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

/**
 * Cache middleware for dashboard data
 */
export const dashboardCacheMiddleware = async (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  try {
    const userId = req.user?.userId;
    let cacheKey;
    let ttl = CACHE_TTL.DASHBOARD;

    if (userId) {
      // Include query parameters in cache key to prevent collisions
      const {period = 'weekly', startDate, endDate} = req.query;
      let keySuffix = period;

      if (startDate && endDate) {
        keySuffix = `custom:${startDate}:${endDate}`;
      }

      cacheKey = `dashboard:user:${userId}:${keySuffix}`;
      ttl = CACHE_TTL.USER_DATA; // Longer cache for user-specific data
    } else {
      cacheKey = CACHE_KEYS.DASHBOARD_STATS;
    }

    // Try to get cached data
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        cached: true,
        cacheExpiry: new Date(Date.now() + ttl * 1000).toISOString(),
      });
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      if (res.statusCode === 200 && data.message && data.message.includes('successfully')) {
        setCache(cacheKey, data, ttl).catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Dashboard cache set error:', err);
          }
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard cache middleware error:', error);
    }
    next(); // Continue without caching
  }
};

/**
 * Invalidate cache when data is modified
 */
export const invalidateQuizCache = async () => {
  try {
    await deleteCache(CACHE_KEYS.QUIZZES_ACTIVE);
    await deleteCache(CACHE_KEYS.QUIZZES_ALL);
    await invalidateCachePattern('quizzes:category:*');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Quiz cache invalidation error:', error);
    }
  }
};

export const invalidateDashboardCache = async (userId = null) => {
  try {
    await deleteCache(CACHE_KEYS.DASHBOARD_STATS);
    if (userId) {
      // Invalidate all dashboard cache variants for the user (weekly, monthly, yearly, custom)
      await invalidateCachePattern(`dashboard:user:${userId}:*`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard cache invalidation error:', error);
    }
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
