// Reasoning: Optional bootstrap to create a default admin if configured via env
const bcrypt = require('bcrypt');
const config = require('../config');
const logger = require('../config/logger');
const UserModel = require('../models/user.model');

async function initAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrator';
  if (!email || !password) {
    logger.debug('Admin bootstrap skipped (no ADMIN_EMAIL/ADMIN_PASSWORD)');
    return;
  }
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    if (existing.role !== 'admin') {
      await UserModel.updateRole(existing.id, 'admin');
      logger.info('Existing user promoted to admin: %s', email);
    } else {
      logger.debug('Admin already exists: %s', email);
    }
    return;
  }
  const hash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
  const id = await UserModel.create({ name, email, password_hash: hash, role: 'admin' });
  logger.info('Default admin created: %s (id=%s)', email, id);
}

module.exports = initAdmin;
