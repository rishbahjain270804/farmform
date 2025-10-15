const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per minute
});

// Validation middleware
const validateRegistration = [
  body('name').trim().notEmpty().escape(),
  body('phone').trim().matches(/^[0-9]{10}$/),
  body('email').optional().isEmail().normalizeEmail(),
  body('aadhaar').trim().matches(/^[0-9]{12}$/),
  body('landSize').isFloat({ min: 0 }),
  body('areaNatural').isFloat({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Sanitization middleware
const sanitizeBody = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeHtml(req.body[key], {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {} // No attributes allowed
      });
    }
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({ 
      error: 'Duplicate Error', 
      message: 'This record already exists' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = {
  loginLimiter,
  apiLimiter,
  validateRegistration,
  sanitizeBody,
  errorHandler,
  securityMiddleware: [
    helmet(), // Secure HTTP headers
    sanitizeBody
  ]
};