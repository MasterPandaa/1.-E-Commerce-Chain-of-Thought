// Reasoning: Admin controller aggregates stats and manages orders/users; protected by admin role
const adminService = require("../services/admin.service");
const { success } = require("../utils/response");

exports.getStats = [
  async (req, res, next) => {
    try {
      const data = await adminService.getStats();
      return success(res, data, "Admin stats");
    } catch (err) {
      next(err);
    }
  },
];

exports.listOrders = [
  async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const status = req.query.status || undefined;
      const data = await adminService.listOrders({ page, limit, status });
      return success(res, data, "All orders");
    } catch (err) {
      next(err);
    }
  },
];

exports.updateOrderStatus = [
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      await adminService.updateOrderStatus(id, status);
      return success(res, null, "Order status updated");
    } catch (err) {
      next(err);
    }
  },
];

exports.listUsers = [
  async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const data = await adminService.listUsers({ page, limit });
      return success(res, data, "Users");
    } catch (err) {
      next(err);
    }
  },
];

exports.updateUserRole = [
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { role } = req.body;
      await adminService.updateUserRole(id, role);
      return success(res, null, "User role updated");
    } catch (err) {
      next(err);
    }
  },
];
