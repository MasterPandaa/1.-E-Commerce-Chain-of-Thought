// Reasoning: Controller focuses on HTTP handling, delegates to service, enforces consistent responses
const authService = require("../services/auth.service");
const { handleValidation } = require("../middleware/validation");
const { success, created } = require("../utils/response");

exports.register = [
  // validation handled in route via validators and handleValidation
  async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      return created(res, user, "Registration successful");
    } catch (err) {
      return next(err);
    }
  },
];

exports.login = [
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      return success(res, result, "Login successful");
    } catch (err) {
      return next(err);
    }
  },
];

exports.logout = [
  async (req, res, next) => {
    try {
      // Reasoning: jti and exp from decoded JWT stored in req.user and token payload
      const { jti } = req.user;
      const { exp } = req.auth || {}; // req.auth can be set by middleware (optional)
      await authService.logout({ jti, exp });
      return success(res, null, "Logged out");
    } catch (err) {
      return next(err);
    }
  },
];

exports.forgotPassword = [
  async (req, res, next) => {
    try {
      await authService.requestPasswordReset(req.body.email);
      return success(
        res,
        null,
        "If that email exists, a reset link has been sent",
      );
    } catch (err) {
      return next(err);
    }
  },
];

exports.resetPassword = [
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword({ token, newPassword });
      return success(res, null, "Password has been reset");
    } catch (err) {
      return next(err);
    }
  },
];
