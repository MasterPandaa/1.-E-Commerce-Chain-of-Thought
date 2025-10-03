// Reasoning: Cart model to persist cart per user and manage items safely with prepared statements
const db = require('../config/database');

class CartModel {
  static async getOrCreateByUserId(user_id) {
    // Try find existing cart
    const [rows] = await db.execute(`SELECT * FROM carts WHERE user_id = ? LIMIT 1`, [user_id]);
    if (rows[0]) return rows[0];
    // Create if not exists
    const [res] = await db.execute(`INSERT INTO carts (user_id) VALUES (?)`, [user_id]);
    return { id: res.insertId, user_id };
  }

  static async getItems(cart_id) {
    const sql = `SELECT ci.id, ci.product_id, ci.quantity, ci.price_cents, p.name, p.currency, p.stock
                 FROM cart_items ci
                 JOIN products p ON ci.product_id = p.id
                 WHERE ci.cart_id = ?
                 ORDER BY ci.id ASC`;
    const [rows] = await db.execute(sql, [cart_id]);
    return rows;
  }

  static async findItem(cart_id, product_id) {
    const [rows] = await db.execute(
      `SELECT id, cart_id, product_id, quantity, price_cents FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1`,
      [cart_id, product_id]
    );
    return rows[0] || null;
  }

  static async insertItem({ cart_id, product_id, quantity, price_cents }) {
    const sql = `INSERT INTO cart_items (cart_id, product_id, quantity, price_cents) VALUES (?, ?, ?, ?)`;
    const [res] = await db.execute(sql, [cart_id, product_id, quantity, price_cents]);
    return res.insertId;
  }

  static async updateItemQuantity({ cart_id, product_id, quantity, price_cents }) {
    const sql = `UPDATE cart_items SET quantity = ?, price_cents = ? WHERE cart_id = ? AND product_id = ?`;
    const [res] = await db.execute(sql, [quantity, price_cents, cart_id, product_id]);
    return res.affectedRows > 0;
  }

  static async removeItem({ cart_id, product_id }) {
    const [res] = await db.execute(`DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cart_id, product_id]);
    return res.affectedRows > 0;
  }

  static async clear(cart_id) {
    await db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cart_id]);
  }
}

module.exports = CartModel;
