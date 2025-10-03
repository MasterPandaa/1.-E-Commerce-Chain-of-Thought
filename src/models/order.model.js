// Reasoning: Order model for retrieving orders and updating status
const db = require('../config/database');

class OrderModel {
  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM orders WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  static async listByUser(user_id, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );
    const [countRows] = await db.execute(`SELECT COUNT(*) AS count FROM orders WHERE user_id = ?`, [user_id]);
    const count = countRows[0]?.count || 0;
    return { rows, count };
  }

  static async listAll({ page = 1, limit = 20, status }) {
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (status) { where = 'WHERE status = ?'; params.push(status); }
    const [rows] = await db.execute(
      `SELECT * FROM orders ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await db.execute(`SELECT COUNT(*) AS count FROM orders ${where}`, params);
    const count = countRows[0]?.count || 0;
    return { rows, count };
  }

  static async getItems(order_id) {
    const [rows] = await db.execute(
      `SELECT id, product_id, product_name, unit_price_cents, quantity, line_total_cents FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [order_id]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const [res] = await db.execute(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    return res.affectedRows > 0;
  }

  static async setInvoiceFile(id, file) {
    const [res] = await db.execute(`UPDATE orders SET invoice_file = ? WHERE id = ?`, [file, id]);
    return res.affectedRows > 0;
  }

  static async stats() {
    const [rows] = await db.execute(
      `SELECT 
        SUM(CASE WHEN status IN ('paid','shipped','completed') THEN total_cents ELSE 0 END) AS revenue_cents,
        COUNT(*) AS orders_count
       FROM orders`
    );
    return rows[0] || { revenue_cents: 0, orders_count: 0 };
  }

  static async revenueByDate() {
    const [rows] = await db.execute(
      `SELECT DATE(created_at) as date, 
        SUM(CASE WHEN status IN ('paid','shipped','completed') THEN total_cents ELSE 0 END) AS revenue_cents
       FROM orders
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`
    );
    return rows;
  }
}

module.exports = OrderModel;
