// Reasoning: Controller handling HTTP for product flows and delegating to service
const productService = require("../services/product.service");
const { success, created } = require("../utils/response");

exports.create = [
  async (req, res, next) => {
    try {
      const prod = await productService.create(req.body);
      return created(res, prod, "Product created");
    } catch (err) {
      next(err);
    }
  },
];

exports.update = [
  async (req, res, next) => {
    try {
      const prod = await productService.update(
        parseInt(req.params.id, 10),
        req.body,
      );
      return success(res, prod, "Product updated");
    } catch (err) {
      next(err);
    }
  },
];

exports.remove = [
  async (req, res, next) => {
    try {
      await productService.remove(parseInt(req.params.id, 10));
      return success(res, null, "Product deleted");
    } catch (err) {
      next(err);
    }
  },
];

exports.list = [
  async (req, res, next) => {
    try {
      const data = await productService.list({
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        category_id: req.query.category_id
          ? parseInt(req.query.category_id, 10)
          : undefined,
        min_price: req.query.min_price
          ? parseInt(req.query.min_price, 10)
          : undefined,
        max_price: req.query.max_price
          ? parseInt(req.query.max_price, 10)
          : undefined,
        q: req.query.q || undefined,
      });
      return success(res, data, "Products");
    } catch (err) {
      next(err);
    }
  },
];

exports.get = [
  async (req, res, next) => {
    try {
      const prod = await productService.get(parseInt(req.params.id, 10));
      return success(res, prod, "Product");
    } catch (err) {
      next(err);
    }
  },
];

exports.addImage = [
  async (req, res, next) => {
    try {
      if (!req.file) return next(new Error("No file uploaded"));
      const images = await productService.addImage(
        parseInt(req.params.id, 10),
        `/uploads/${req.file.filename}`,
      );
      return success(res, images, "Image uploaded");
    } catch (err) {
      next(err);
    }
  },
];
