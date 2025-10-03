// Reasoning: Order routes for checkout and viewing user's own orders
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const ctrl = require('../controllers/order.controller');
const { checkoutValidation, listOrdersValidation } = require('../validators/order.validators');

router.post('/checkout', auth(), checkoutValidation, handleValidation, ...ctrl.checkout);
router.get('/', auth(), listOrdersValidation, handleValidation, ...ctrl.listMyOrders);
router.get('/:id', auth(), ...ctrl.getMyOrder);

module.exports = router;
