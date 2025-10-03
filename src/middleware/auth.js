// Reasoning: JWT auth middleware to protect routes and enforce roles
const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/errors");
const JwtBlacklistModel = require("../models/jwtBlacklist.model");

function auth(required = true) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      if (!token) {
        if (required) {
          return next(ApiError.unauthorized("Missing authorization token"));
        }
        req.user = null;
        return next();
      }
      const decoded = verifyToken(token);
      // Reasoning: Check if token jti is blacklisted (logout/revoked)
      if (decoded.jti && (await JwtBlacklistModel.exists(decoded.jti))) {
        return next(ApiError.unauthorized("Token has been revoked"));
      }
      // Reasoning: Attach limited user context from JWT, not from client input
      req.user = { id: decoded.sub, role: decoded.role, jti: decoded.jti };
      req.auth = decoded; // includes exp
      return next();
    } catch (err) {
      return next(ApiError.unauthorized("Invalid or expired token"));
    }
  };
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized("Unauthorized"));
    if (req.user.role !== role) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}

module.exports = { auth, requireRole };
