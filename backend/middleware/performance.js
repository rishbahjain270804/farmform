const compression = require('compression');

// Check if request should be compressed
const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

// Performance middleware
const performanceMiddleware = [
  // Compress responses
  compression({
    filter: shouldCompress,
    level: 6, // Balanced between speed and compression ratio
    threshold: 1024 // Only compress responses larger than 1KB
  }),

  // Add performance headers
  (req, res, next) => {
    // Set cache headers for static content
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
    next();
  },

  // Track response time
  (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log slow requests (over 1 second)
        console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
      }
    });
    next();
  }
];

// Database query optimization
const optimizeQuery = (query) => {
  // Add necessary indexes
  query.lean(); // Convert documents to plain objects
  
  // Select only needed fields
  if (!query._fields) {
    query.select('-__v'); // Exclude version key by default
  }
  
  return query;
};

module.exports = {
  performanceMiddleware,
  optimizeQuery
};