// Reasoning: Product model handling CRUD and browsing with prepared statements
const db = require("../config/database");

class ProductModel {
  static async create({
    name,
    slug,
    description,
    price_cents,
    currency,
    stock,
    category_id,
  }) {
    const sql = `INSERT INTO products (name, slug, description, price_cents, currency, stock, category_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await db.execute(sql, [
      name,
      slug,
      description,
      price_cents,
      currency,
      stock,
      category_id,
    ]);
    return res.insertId;
  }

  static async update(id, fields) {
    const allowed = [
      "name",
      "slug",
      "description",
      "price_cents",
      "currency",
      "stock",
      "category_id",
    ];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return false;
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => fields[k]);
    const sql = `UPDATE products SET ${setClause} WHERE id = ?`;
    const [res] = await db.execute(sql, [...values, id]);
    return res.affectedRows > 0;
  }

  static async delete(id) {
    const [res] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return res.affectedRows > 0;
  }

  static async findById(id) {
    const sql = `SELECT p.*, c.name AS category_name FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async findBySlug(slug) {
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE slug = ? LIMIT 1",
      [slug],
    );
    return rows[0] || null;
  }

  static async list({
    page = 1,
    limit = 20,
    category_id,
    min_price,
    max_price,
    q,
  }) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (category_id) {
      where.push("p.category_id = ?");
      params.push(category_id);
    }
    if (min_price != null) {
      where.push("p.price_cents >= ?");
      params.push(min_price);
    }
    if (max_price != null) {
      where.push("p.price_cents <= ?");
      params.push(max_price);
    }
    if (q) {
      where.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `SELECT p.*, c.name AS category_name
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 ${whereClause}
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?`;
    const rowsParams = [...params, limit, offset];
    const [rows] = await db.execute(sql, rowsParams);

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS count FROM products p ${whereClause}`,
      params,
    );
    const count = countRows[0]?.count || 0;
    return { rows, count };
  }

  static async decrementStock(product_id, quantity) {
    // Reasoning: Ensure stock does not go negative
    const sql =
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
    const [res] = await db.execute(sql, [quantity, product_id, quantity]);
    return res.affectedRows > 0;
  }
}

module.exports = ProductModel;
