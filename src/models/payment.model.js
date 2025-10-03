// Reasoning: Payment model to record simulated payments and ensure unique provider refs
const db = require("../config/database");

class PaymentModel {
  static async create({
    order_id,
    provider,
    provider_ref,
    amount_cents,
    currency,
    status,
  }) {
    const sql =
      "INSERT INTO payments (order_id, provider, provider_ref, amount_cents, currency, status) VALUES (?, ?, ?, ?, ?, ?)";
    const [res] = await db.execute(sql, [
      order_id,
      provider,
      provider_ref,
      amount_cents,
      currency,
      status,
    ]);
    return res.insertId;
  }
}

module.exports = PaymentModel;
