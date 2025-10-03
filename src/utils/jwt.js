// Reasoning: Isolated JWT utilities to sign and verify tokens securely
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

function signToken(user) {
  // Reasoning: Include minimal claims; use jti to support blacklist on logout
  const jti = uuidv4();
  const payload = { sub: user.id, role: user.role, jti };
  const token = jwt.sign(payload, config.JWT.secret, { expiresIn: config.JWT.expiresIn });
  return { token, jti };
}

function verifyToken(token) {
  return jwt.verify(token, config.JWT.secret);
}

module.exports = { signToken, verifyToken };
