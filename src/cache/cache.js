const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Middleware to wrap GET requests with cache.
 *
 * @param {Function} keyBuilder - function(req) => string (unique cache key)
 */
function cacheMiddleware(keyBuilder) {
  return (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = cache.get(key);

      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        cache.set(key, body);
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err.message);
      next();
    }
  };
}

/**
 * Invalidate cache entries by key.
 *
 * @param {string[]} keys
 */
function invalidate(keys = []) {
  try {
    keys.forEach((key) => cache.del(key));
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
}

/**
 * Clear all cached entries.
 */
function clearAll() {
  try {
    cache.flushAll();
    console.log("Cache cleared");
  } catch (err) {
    console.error("Cache flush error:", err.message);
  }
}

module.exports = {
  cacheMiddleware,
  invalidate,
  clearAll,
  cache,
};
