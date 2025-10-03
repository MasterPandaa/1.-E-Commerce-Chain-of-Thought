// Reasoning: Controller for cart operations with consistent responses
const cartService = require('../services/cart.service');
const { success } = require('../utils/response');

exports.getCart = [async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user.id);
    return success(res, data, 'Cart');
  } catch (err) { next(err); }
}];

exports.addItem = [async (req, res, next) => {
  try {
    const data = await cartService.addItem(req.user.id, req.body);
    return success(res, data, 'Item added');
  } catch (err) { next(err); }
}];

exports.updateItem = [async (req, res, next) => {
  try {
    const data = await cartService.updateItem(req.user.id, { product_id: parseInt(req.params.product_id, 10), quantity: req.body.quantity });
    return success(res, data, 'Item updated');
  } catch (err) { next(err); }
}];

exports.removeItem = [async (req, res, next) => {
  try {
    const data = await cartService.removeItem(req.user.id, { product_id: parseInt(req.params.product_id, 10) });
    return success(res, data, 'Item removed');
  } catch (err) { next(err); }
}];
