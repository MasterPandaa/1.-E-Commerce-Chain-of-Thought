// Reasoning: Validators for admin endpoints
const { query, body, param } = require("express-validator");

const listUsersValidation = [
  query("page").optional().toInt().isInt({ min: 1 }),
  query("limit").optional().toInt().isInt({ min: 1, max: 100 }),
];

const updateUserRoleValidation = [
  param("id").toInt().isInt({ min: 1 }),
  body("role").isIn(["customer", "admin"]).withMessage("Invalid role"),
];

module.exports = {
  listUsersValidation,
  updateUserRoleValidation,
};
