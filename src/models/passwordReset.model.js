// Reasoning: Store password reset token hashes with expiry and single-use semantics
const db = require("../config/database");

class PasswordResetModel {
  static async create({ user_id, token_hash, expires_at }) {
    const sql =
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)";
    const [result] = await db.execute(sql, [user_id, token_hash, expires_at]);
    return result.insertId;
  }

  static async findValidByTokenHash(token_hash) {
    const sql =
      "SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > NOW() LIMIT 1";
    const [rows] = await db.execute(sql, [token_hash]);
    return rows[0] || null;
  }

  static async markUsed(id) {
    const sql = "UPDATE password_resets SET used = 1 WHERE id = ?";
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PasswordResetModel;
