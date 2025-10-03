// Reasoning: Central error handling to avoid leaking internals and ensure consistent responses
const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.publicMessage || err.message || "Internal Server Error";

  // Log full error for debugging (without exposing to client)
  logger.error(
    "Error: %s | Code: %s | Path: %s | Stack: %s",
    message,
    code,
    req.originalUrl,
    err.stack,
  );

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
