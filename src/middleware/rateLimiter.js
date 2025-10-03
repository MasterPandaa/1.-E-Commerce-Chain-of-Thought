// Reasoning: Rate limiting to prevent brute force and abuse
const rateLimit = require("express-rate-limit");
const config = require("../config");

const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later.",
    },
  },
});

const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: Math.min(20, config.RATE_LIMIT.max),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
