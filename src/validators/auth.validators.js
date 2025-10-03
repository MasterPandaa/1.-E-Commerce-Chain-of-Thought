// Reasoning: Centralized validators for auth flows using express-validator
const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().escape().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 chars'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include upper, lower, and number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isString().isLength({ min: 8 }).withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').isString().isLength({ min: 20 }).withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include upper, lower, and number'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
