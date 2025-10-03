// Reasoning: Validators for checkout and admin order status updates
const { body, query, param } = require('express-validator');

const checkoutValidation = [
  body('shipping_name').trim().isLength({ min: 2, max: 100 }).withMessage('shipping_name 2-100 chars').escape(),
  body('shipping_phone').trim().isLength({ min: 6, max: 30 }).withMessage('shipping_phone length').matches(/^[+0-9\-\s()]+$/).withMessage('Invalid phone').escape(),
  body('shipping_address_line1').trim().isLength({ min: 5, max: 200 }).withMessage('address_line1 5-200').escape(),
  body('shipping_address_line2').optional().trim().isLength({ max: 200 }).escape(),
  body('shipping_city').trim().isLength({ min: 2, max: 100 }).escape(),
  body('shipping_state').trim().isLength({ min: 2, max: 100 }).escape(),
  body('shipping_postal_code').trim().isLength({ min: 3, max: 20 }).escape(),
  body('shipping_country').trim().isLength({ min: 2, max: 2 }).matches(/^[A-Za-z]{2}$/).withMessage('country must be ISO2'),
];

const listOrdersValidation = [
  query('page').optional().toInt().isInt({ min: 1 }),
  query('limit').optional().toInt().isInt({ min: 1, max: 100 }),
];

const adminListOrdersValidation = [
  query('page').optional().toInt().isInt({ min: 1 }),
  query('limit').optional().toInt().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending','paid','shipped','completed','cancelled']),
];

const updateOrderStatusValidation = [
  param('id').toInt().isInt({ min: 1 }),
  body('status').isIn(['pending','paid','shipped','completed','cancelled']).withMessage('Invalid status'),
];

module.exports = {
  checkoutValidation,
  listOrdersValidation,
  adminListOrdersValidation,
  updateOrderStatusValidation,
};
