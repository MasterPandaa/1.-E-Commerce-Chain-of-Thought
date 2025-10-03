// Reasoning: Checkout and order flows with transactional integrity and side-effects (invoice, email)
const crypto = require("crypto");
const db = require("../config/database");
const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/errors");
const { generateInvoice } = require("../utils/pdf");
const { sendMail } = require("../config/mailer");

class OrderService {
  async checkout(user_id, shipping) {
    // Step 1: Load cart and ensure not empty
    const cart = await CartModel.getOrCreateByUserId(user_id);
    const items = await CartModel.getItems(cart.id);
    if (!items.length) throw ApiError.badRequest("Cart is empty");

    // Step 2: Validate stock and compute totals using cart line price for price consistency
    let subtotal_cents = 0;
    for (const it of items) {
      subtotal_cents += it.price_cents * it.quantity;
      const prod = await ProductModel.findById(it.product_id);
      if (!prod) {
        throw ApiError.badRequest(`Product not found: ${it.product_id}`);
      }
      if (prod.stock < it.quantity) {
        throw ApiError.badRequest(`Insufficient stock for ${prod.name}`);
      }
    }
    const shipping_cents = 0; // Reasoning: Simplify shipping for MVP
    const total_cents = subtotal_cents + shipping_cents;
    const currency = items[0]?.currency || "USD";

    // Step 3: Transaction to create order, order items, and decrement stock
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderRes] = await conn.execute(
        `INSERT INTO orders (
          user_id, status, subtotal_cents, shipping_cents, total_cents, currency,
          shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
          shipping_city, shipping_state, shipping_postal_code, shipping_country
        ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          subtotal_cents,
          shipping_cents,
          total_cents,
          currency,
          shipping.shipping_name,
          shipping.shipping_phone,
          shipping.shipping_address_line1,
          shipping.shipping_address_line2 || null,
          shipping.shipping_city,
          shipping.shipping_state,
          shipping.shipping_postal_code,
          shipping.shipping_country,
        ],
      );
      const order_id = orderRes.insertId;

      for (const it of items) {
        // Decrement stock atomically in the same transaction/connection
        const [decRes] = await conn.execute(
          "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
          [it.quantity, it.product_id, it.quantity],
        );
        if (decRes.affectedRows === 0) {
          throw ApiError.badRequest("Stock changed, please try again");
        }
        const line_total_cents = it.price_cents * it.quantity;
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            order_id,
            it.product_id,
            it.name,
            it.price_cents,
            it.quantity,
            line_total_cents,
          ],
        );
      }

      await conn.commit();

      // Step 4: Simulate payment success
      const provider_ref = crypto.randomBytes(8).toString("hex");
      await PaymentModel.create({
        order_id,
        provider: "simulated",
        provider_ref,
        amount_cents: total_cents,
        currency,
        status: "succeeded",
      });
      await OrderModel.updateStatus(order_id, "paid");

      // Step 5: Generate invoice PDF and attach to order
      const order = await OrderModel.findById(order_id);
      const orderItems = await OrderModel.getItems(order_id);
      const { filename } = await generateInvoice({ order, items: orderItems });
      await OrderModel.setInvoiceFile(order_id, `/invoices/${filename}`);

      // Step 6: Email confirmation
      const user = await UserModel.findById(user_id);
      try {
        await sendMail({
          to: user.email,
          subject: `Order Confirmation #${order_id}`,
          text: `Thank you for your order #${order_id}. Total: ${(total_cents / 100).toFixed(2)} ${currency}`,
        });
      } catch (e) {
        // Non-fatal
      }

      // Step 7: Clear cart
      await CartModel.clear(cart.id);

      return { order_id, total_cents, currency };
    } catch (err) {
      try {
        await conn.rollback();
      } catch (e) {}
      throw err;
    } finally {
      conn.release();
    }
  }

  async listUserOrders(user_id, { page = 1, limit = 20 }) {
    const { rows, count } = await OrderModel.listByUser(user_id, {
      page,
      limit,
    });
    return {
      items: rows,
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  async getUserOrder(user_id, id) {
    const order = await OrderModel.findById(id);
    if (!order || order.user_id !== user_id) {
      throw ApiError.notFound("Order not found");
    }
    const items = await OrderModel.getItems(id);
    return { ...order, items };
  }
}

module.exports = new OrderService();
