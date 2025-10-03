// Reasoning: Business logic for products including admin CRUD and public browsing
const ProductModel = require('../models/product.model');
const ProductImageModel = require('../models/productImage.model');
const ApiError = require('../utils/errors');
const slugify = require('../utils/slugify');

class ProductService {
  async create(data) {
    const slug = slugify(data.name);
    const existing = await ProductModel.findBySlug(slug);
    if (existing) throw ApiError.conflict('Product with similar name already exists', 'PRODUCT_EXISTS');
    const id = await ProductModel.create({ ...data, slug });
    return await ProductModel.findById(id);
  }

  async update(id, data) {
    if (data.name) data.slug = slugify(data.name);
    if (!(await ProductModel.update(id, data))) throw ApiError.notFound('Product not found');
    return await ProductModel.findById(id);
  }

  async remove(id) {
    const ok = await ProductModel.delete(id);
    if (!ok) throw ApiError.notFound('Product not found');
    await ProductImageModel.deleteByProduct(id);
    return true;
  }

  async list(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const { rows, count } = await ProductModel.list(filters);
    return { items: rows, page, limit, total: count, pages: Math.ceil(count / limit) };
  }

  async get(id) {
    const prod = await ProductModel.findById(id);
    if (!prod) throw ApiError.notFound('Product not found');
    const images = await ProductImageModel.listByProduct(id);
    return { ...prod, images };
  }

  async addImage(product_id, filePath) {
    const prod = await ProductModel.findById(product_id);
    if (!prod) throw ApiError.notFound('Product not found');
    const imageId = await ProductImageModel.create({ product_id, file_path: filePath });
    const images = await ProductImageModel.listByProduct(product_id);
    return images;
  }
}

module.exports = new ProductService();
