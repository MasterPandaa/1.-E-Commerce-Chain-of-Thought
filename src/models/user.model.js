// Reasoning: Model layer focusing on database operations for users using prepared statements
const db = require("../config/database");

class UserModel {
  static async create({ name, email, password_hash, role = "customer" }) {
    const sql =
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(sql, [name, email, password_hash, role]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const sql =
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1";
    const [rows] = await db.execute(sql, [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const sql =
      "SELECT id, name, email, password_hash, role FROM users WHERE id = ? LIMIT 1";
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async updatePassword(id, newHash) {
    const sql = "UPDATE users SET password_hash = ? WHERE id = ?";
    const [result] = await db.execute(sql, [newHash, id]);
    return result.affectedRows > 0;
  }

  static async list({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users");
    return { rows, count };
  }

  static async updateRole(id, role) {
    const sql = "UPDATE users SET role = ? WHERE id = ?";
    const [result] = await db.execute(sql, [role, id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
