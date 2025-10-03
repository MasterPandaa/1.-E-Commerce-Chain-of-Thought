// Reasoning: Central router that mounts feature-specific routers under /api/v1
const express = require('express');
const router = express.Router();

const healthRouter = require('./health.routes');
const authRouter = require('./auth.routes');
const productRouter = require('./product.routes');
const cartRouter = require('./cart.routes');
const orderRouter = require('./order.routes');
const adminRouter = require('./admin.routes');

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);

// TODO: mount other routers
// Additional routers can be added here

module.exports = router;
