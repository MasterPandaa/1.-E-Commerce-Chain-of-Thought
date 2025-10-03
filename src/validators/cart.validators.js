// Reasoning: Validators for cart operations to ensure integrity and avoid abuse
const { body, param } = require("express-validator");

const addItemValidation = [
  body("product_id")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("product_id must be positive"),
  body("quantity")
    .toInt()
    .isInt({ min: 1, max: 99 })
    .withMessage("quantity 1-99"),
];

const updateItemValidation = [
  param("product_id")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("product_id must be positive"),
  body("quantity")
    .toInt()
    .isInt({ min: 0, max: 99 })
    .withMessage("quantity 0-99"),
];

const removeItemValidation = [
  param("product_id")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("product_id must be positive"),
];

module.exports = {
  addItemValidation,
  updateItemValidation,
  removeItemValidation,
};
