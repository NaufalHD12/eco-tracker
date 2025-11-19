import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';

// Lazy Redis initialization - only create when needed
let redisInstance = null;
let ipRateLimitInstance = null;
let userRateLimitInstance = null;

const getRedis = () => {
  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisInstance;
};

const getIpRateLimit = () => {
  if (!ipRateLimitInstance) {
    ipRateLimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(100, '15 m'),
      analytics: true,
    });
  }
  return ipRateLimitInstance;
};

const getUserRateLimit = () => {
  if (!userRateLimitInstance) {
    userRateLimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(1000, '1 h'),
      analytics: true,
    });
  }
  return userRateLimitInstance;
};

// Export getter functions - call them when needed
export {getRedis, getIpRateLimit, getUserRateLimit};

// Rate limiting middleware
export const ipRateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : 'unknown');

    const {success, reset} = await getIpRateLimit().limit(ip);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return res.status(429).json({
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: `${Math.ceil(retryAfter / 60)} minutes`,
        limit: '100 requests per 15 minutes',
      });
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    });

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('IP rate limit error:', error);
    }
    next(); // Continue if Redis fails (fail-open)
  }
};

export const userRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      const {success, reset} = await getUserRateLimit().limit(`user:${userId}`);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return res.status(429).json({
          message: 'Too many requests. Please try again later.',
          retryAfter: `${Math.ceil(retryAfter / 3600)} hours`,
          limit: '1000 requests per hour',
        });
      }
    }

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('User rate limit error:', error);
    }
    next(); // Continue if Redis fails (fail-open)
  }
};

// Caching helper functions
export const getCache = async (key) => {
  try {
    const cached = await getRedis().get(key);
    if (cached === null) return null;
    // If Upstash auto-parsed JSON to object, return it directly
    if (typeof cached === 'object') return cached;
    // Otherwise parse the string
    return JSON.parse(cached);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Cache get error:', error);
    }
    return null;
  }
};

export const setCache = async (key, value, ttl = 300) => {
  try {
    await getRedis().setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Cache set error:', error);
    }
  }
};

export const deleteCache = async (key) => {
  try {
    await getRedis().del(key);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Cache delete error:', error);
    }
  }
};

const getKeysMatchingPattern = async (pattern) => {
  const redis = getRedis();
  let cursor = 0;
  const allKeys = [];

  do {
    const result = await redis.scan(cursor, {count: 1000});
    cursor = parseInt(result[0]);
    allKeys.push(...result[1]);
  } while (cursor !== 0);

  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
  return allKeys.filter((key) => regex.test(key));
};

export const invalidateCachePattern = async (pattern) => {
  try {
    const redis = getRedis();
    const keys = await getKeysMatchingPattern(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Invalidated cache keys matching pattern "${pattern}": ${keys.join(', ')}`);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`No cache keys found for pattern: ${pattern}`);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Cache invalidation error:', error);
    }
  }
};

// Cache keys
export const CACHE_KEYS = {
  QUIZZES_ACTIVE: 'quizzes:active',
  QUIZZES_ALL: 'quizzes:all',
  QUIZZES_BY_CATEGORY: (category) => `quizzes:category:${category}`,
  EMISSION_FACTORS: 'factors:emission',
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_USER: (userId) => `dashboard:user:${userId}`,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  QUIZZES: 300, // 5 minutes
  FACTORS: 3600, // 1 hour
  DASHBOARD: 600, // 10 minutes
  USER_DATA: 1800, // 30 minutes
};
