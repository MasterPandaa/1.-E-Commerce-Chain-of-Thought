// Reasoning: Store JWT jti values that have been logged out/revoked until they expire
const db = require("../config/database");

class JwtBlacklistModel {
  static async add(jti, expiresAt) {
    const sql = "INSERT INTO jwt_blacklist (jti, expires_at) VALUES (?, ?)";
    await db.execute(sql, [jti, expiresAt]);
    return true;
  }

  static async exists(jti) {
    const sql = "SELECT id FROM jwt_blacklist WHERE jti = ? LIMIT 1";
    const [rows] = await db.execute(sql, [jti]);
    return !!rows[0];
  }

  static async cleanupExpired(now = new Date()) {
    const sql = "DELETE FROM jwt_blacklist WHERE expires_at < ?";
    await db.execute(sql, [now]);
  }
}

module.exports = JwtBlacklistModel;
