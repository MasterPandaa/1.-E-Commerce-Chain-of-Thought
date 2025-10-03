// Reasoning: Custom error class with helpers for clean error handling across layers
class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', publicMessage = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage || message;
  }

  static badRequest(msg = 'Bad Request', code = 'BAD_REQUEST') { return new ApiError(400, msg, code); }
  static unauthorized(msg = 'Unauthorized', code = 'UNAUTHORIZED') { return new ApiError(401, msg, code); }
  static forbidden(msg = 'Forbidden', code = 'FORBIDDEN') { return new ApiError(403, msg, code); }
  static notFound(msg = 'Not Found', code = 'NOT_FOUND') { return new ApiError(404, msg, code); }
  static conflict(msg = 'Conflict', code = 'CONFLICT') { return new ApiError(409, msg, code); }
  static unprocessable(msg = 'Unprocessable Entity', code = 'UNPROCESSABLE_ENTITY') { return new ApiError(422, msg, code); }
  static internal(msg = 'Internal Server Error', code = 'INTERNAL_ERROR') { return new ApiError(500, msg, code); }
}

module.exports = ApiError;
