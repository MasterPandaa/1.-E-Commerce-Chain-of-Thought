// Reasoning: Category model for product classification and filtering
const db = require('../config/database');

class CategoryModel {
  static async create({ name, slug }) {
    const sql = `INSERT INTO categories (name, slug) VALUES (?, ?)`;
    const [res] = await db.execute(sql, [name, slug]);
    return res.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM categories WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  static async findBySlug(slug) {
    const [rows] = await db.execute(`SELECT * FROM categories WHERE slug = ? LIMIT 1`, [slug]);
    return rows[0] || null;
  }

  static async list() {
    const [rows] = await db.execute(`SELECT * FROM categories ORDER BY name ASC`);
    return rows;
  }
}

module.exports = CategoryModel;
