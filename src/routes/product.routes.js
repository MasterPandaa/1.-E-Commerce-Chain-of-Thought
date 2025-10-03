// Reasoning: Product routes with admin guard for mutations, and public browsing
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { handleValidation } = require('../middleware/validation');
const ctrl = require('../controllers/product.controller');
const { createProductValidation, updateProductValidation, listProductsValidation } = require('../validators/product.validators');

router.get('/', listProductsValidation, handleValidation, ...ctrl.list);
router.get('/:id', ...ctrl.get);

router.post('/', auth(), requireRole('admin'), createProductValidation, handleValidation, ...ctrl.create);
router.patch('/:id', auth(), requireRole('admin'), updateProductValidation, handleValidation, ...ctrl.update);
router.delete('/:id', auth(), requireRole('admin'), ...ctrl.remove);

router.post('/:id/images', auth(), requireRole('admin'), upload.single('image'), ...ctrl.addImage);

module.exports = router;
