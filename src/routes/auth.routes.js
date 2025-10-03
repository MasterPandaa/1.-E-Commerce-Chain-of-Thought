// Reasoning: Auth routes with validation middleware before controllers
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { handleValidation } = require("../middleware/validation");
const { auth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validators/auth.validators");

router.post(
  "/register",
  authLimiter,
  registerValidation,
  handleValidation,
  ...authController.register,
);
router.post(
  "/login",
  authLimiter,
  loginValidation,
  handleValidation,
  ...authController.login,
);
router.post("/logout", auth(), ...authController.logout);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  handleValidation,
  ...authController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  handleValidation,
  ...authController.resetPassword,
);

module.exports = router;
