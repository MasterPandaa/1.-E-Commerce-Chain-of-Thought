// Reasoning: Validators for product creation/update and listing filters
const { body, query, param } = require("express-validator");

const createProductValidation = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 2, max: 200 })
    .withMessage("Name 2-200 chars"),
  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 5000 })
    .withMessage("Desc too long"),
  body("price_cents").isInt({ min: 0 }).withMessage("price_cents must be >= 0"),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("currency must be 3 chars"),
  body("stock").isInt({ min: 0 }).withMessage("stock must be >= 0"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("category_id must be positive"),
];

const updateProductValidation = [
  param("id").isInt({ min: 1 }),
  body("name").optional().trim().escape().isLength({ min: 2, max: 200 }),
  body("description").optional().trim().escape().isLength({ max: 5000 }),
  body("price_cents").optional().isInt({ min: 0 }),
  body("currency").optional().isLength({ min: 3, max: 3 }),
  body("stock").optional().isInt({ min: 0 }),
  body("category_id").optional().isInt({ min: 1 }),
];

const listProductsValidation = [
  query("page").optional().toInt().isInt({ min: 1 }),
  query("limit").optional().toInt().isInt({ min: 1, max: 100 }),
  query("category_id").optional().toInt().isInt({ min: 1 }),
  query("min_price").optional().toInt().isInt({ min: 0 }),
  query("max_price").optional().toInt().isInt({ min: 0 }),
  query("q").optional().trim().escape().isLength({ max: 200 }),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  listProductsValidation,
};
