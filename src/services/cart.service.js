// Reasoning: Business logic for cart operations with inventory checks and totals calculation
const CartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');
const ApiError = require('../utils/errors');

class CartService {
  async getCart(user_id) {
    const cart = await CartModel.getOrCreateByUserId(user_id);
    const items = await CartModel.getItems(cart.id);
    const subtotal_cents = items.reduce((sum, it) => sum + it.quantity * it.price_cents, 0);
    return { id: cart.id, items, subtotal_cents };
  }

  async addItem(user_id, { product_id, quantity }) {
    const cart = await CartModel.getOrCreateByUserId(user_id);
    const product = await ProductModel.findById(product_id);
    if (!product) throw ApiError.notFound('Product not found');
    if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');

    const item = await CartModel.findItem(cart.id, product_id);
    if (item) {
      const newQty = Math.min(99, item.quantity + quantity);
      await CartModel.updateItemQuantity({ cart_id: cart.id, product_id, quantity: newQty, price_cents: product.price_cents });
    } else {
      await CartModel.insertItem({ cart_id: cart.id, product_id, quantity, price_cents: product.price_cents });
    }
    return this.getCart(user_id);
  }

  async updateItem(user_id, { product_id, quantity }) {
    const cart = await CartModel.getOrCreateByUserId(user_id);
    const product = await ProductModel.findById(product_id);
    if (!product) throw ApiError.notFound('Product not found');

    if (quantity === 0) {
      await CartModel.removeItem({ cart_id: cart.id, product_id });
      return this.getCart(user_id);
    }

    if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');
    await CartModel.updateItemQuantity({ cart_id: cart.id, product_id, quantity, price_cents: product.price_cents });
    return this.getCart(user_id);
  }

  async removeItem(user_id, { product_id }) {
    const cart = await CartModel.getOrCreateByUserId(user_id);
    await CartModel.removeItem({ cart_id: cart.id, product_id });
    return this.getCart(user_id);
  }
}

module.exports = new CartService();
