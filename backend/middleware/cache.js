const { createClient } = require('redis');

// Create Redis client
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
(async () => {
  await client.connect();
})();

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await client.get(key);
      
      if (cachedResponse) {
        console.log('Cache hit for:', key);
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json to intercept the response
      const originalJson = res.json;
      res.json = function(body) {
        client.setEx(key, duration, JSON.stringify(body))
          .catch(err => console.error('Redis cache error:', err));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache for specific patterns
const clearCache = async (pattern) => {
  try {
    const keys = await client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await client.del(keys);
      console.log('Cleared cache for pattern:', pattern);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

module.exports = {
  cache,
  clearCache
};