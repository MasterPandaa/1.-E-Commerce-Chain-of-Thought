// Reasoning: Cart routes for authenticated users
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const ctrl = require('../controllers/cart.controller');
const { addItemValidation, updateItemValidation, removeItemValidation } = require('../validators/cart.validators');

router.get('/', auth(), ...ctrl.getCart);
router.post('/items', auth(), addItemValidation, handleValidation, ...ctrl.addItem);
router.patch('/items/:product_id', auth(), updateItemValidation, handleValidation, ...ctrl.updateItem);
router.delete('/items/:product_id', auth(), removeItemValidation, handleValidation, ...ctrl.removeItem);

module.exports = router;
