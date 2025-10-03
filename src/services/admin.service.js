// Reasoning: Admin service aggregates stats and manages users and orders
const OrderModel = require('../models/order.model');
const UserModel = require('../models/user.model');
const ApiError = require('../utils/errors');

class AdminService {
  async getStats() {
    const stats = await OrderModel.stats();
    const series = await OrderModel.revenueByDate();
    return { revenue_cents: stats.revenue_cents || 0, orders_count: stats.orders_count || 0, revenue_series: series };
  }

  async listOrders({ page = 1, limit = 20, status }) {
    const { rows, count } = await OrderModel.listAll({ page, limit, status });
    return { items: rows, page, limit, total: count, pages: Math.ceil(count / limit) };
  }

  async updateOrderStatus(id, status) {
    const ok = await OrderModel.updateStatus(id, status);
    if (!ok) throw ApiError.notFound('Order not found');
    return true;
  }

  async listUsers({ page = 1, limit = 20 }) {
    const { rows, count } = await UserModel.list({ page, limit });
    return { items: rows, page, limit, total: count, pages: Math.ceil(count / limit) };
  }

  async updateUserRole(id, role) {
    const ok = await UserModel.updateRole(id, role);
    if (!ok) throw ApiError.notFound('User not found');
    return true;
  }
}

module.exports = new AdminService();
