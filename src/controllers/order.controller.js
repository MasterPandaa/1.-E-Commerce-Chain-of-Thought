// Reasoning: Controller for checkout and order retrieval with consistent responses
const orderService = require("../services/order.service");
const { success } = require("../utils/response");

exports.checkout = [
  async (req, res, next) => {
    try {
      const result = await orderService.checkout(req.user.id, req.body);
      return success(res, result, "Order placed");
    } catch (err) {
      next(err);
    }
  },
];

exports.listMyOrders = [
  async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const data = await orderService.listUserOrders(req.user.id, {
        page,
        limit,
      });
      return success(res, data, "My orders");
    } catch (err) {
      next(err);
    }
  },
];

exports.getMyOrder = [
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await orderService.getUserOrder(req.user.id, id);
      return success(res, data, "Order");
    } catch (err) {
      next(err);
    }
  },
];
