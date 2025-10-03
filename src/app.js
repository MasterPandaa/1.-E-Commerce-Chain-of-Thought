// Reasoning: App initialization with security middleware, logging, rate limiting, routes, and error handling
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Ensure directories exist for uploads and invoices
const uploadDir = path.join(process.cwd(), config.UPLOAD.dir);
const invoiceDir = path.join(process.cwd(), config.INVOICE_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: true, credentials: true }));

// Body parsers with sensible limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate limiting (general)
app.use(generalLimiter);

// Static files
app.use('/uploads', express.static(uploadDir));
app.use('/invoices', express.static(invoiceDir));

// Routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use(errorHandler);

module.exports = app;
