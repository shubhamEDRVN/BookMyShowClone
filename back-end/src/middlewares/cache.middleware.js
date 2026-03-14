const { getRedisClient } = require('../config/redis');

/**
 * Redis cache middleware factory
 * @param {string} keyPrefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (keyPrefix, ttl = 300) => async (req, res, next) => {
  const redis = getRedisClient();
  if (!redis || !redis.isReady) return next();

  try {
    const key = `${keyPrefix}:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.setEx(key, ttl, JSON.stringify(data)).catch((err) => {
          console.error('Cache write failed:', err.message);
        });
      }
      return originalJson(data);
    };

    next();
  } catch (_) {
    next();
  }
};

module.exports = { cacheMiddleware };
