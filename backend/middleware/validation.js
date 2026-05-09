const { body, validationResult } = require('express-validator');

// Middleware to check validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// Auth validators
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Video validators
const analyzeValidation = [
  body('url').notEmpty().withMessage('YouTube URL is required').isURL().withMessage('Must be a valid URL'),
  body('summaryLength').optional().isIn(['brief', 'medium', 'detailed']).withMessage('Invalid summary length'),
  validate,
];

module.exports = { registerValidation, loginValidation, analyzeValidation, validate };
