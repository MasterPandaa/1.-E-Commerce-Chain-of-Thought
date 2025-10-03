// Reasoning: Product image model for storing image metadata and retrieval
const db = require("../config/database");

class ProductImageModel {
  static async create({ product_id, file_path }) {
    const sql =
      "INSERT INTO product_images (product_id, file_path) VALUES (?, ?)";
    const [res] = await db.execute(sql, [product_id, file_path]);
    return res.insertId;
  }

  static async listByProduct(product_id) {
    const [rows] = await db.execute(
      "SELECT id, product_id, file_path FROM product_images WHERE product_id = ? ORDER BY id ASC",
      [product_id],
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT id, product_id, file_path FROM product_images WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  static async delete(id) {
    const [res] = await db.execute("DELETE FROM product_images WHERE id = ?", [
      id,
    ]);
    return res.affectedRows > 0;
  }

  static async deleteByProduct(product_id) {
    const [res] = await db.execute(
      "DELETE FROM product_images WHERE product_id = ?",
      [product_id],
    );
    return res.affectedRows;
  }
}

module.exports = ProductImageModel;
