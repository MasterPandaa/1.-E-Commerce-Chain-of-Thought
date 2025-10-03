// Reasoning: Service layer containing business logic for authentication flows
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dayjs = require('dayjs');
const UserModel = require('../models/user.model');
const JwtBlacklistModel = require('../models/jwtBlacklist.model');
const PasswordResetModel = require('../models/passwordReset.model');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/errors');
const config = require('../config');
const { sendMail } = require('../config/mailer');

class AuthService {
  // Register a new user after checking email uniqueness
  async register({ name, email, password }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email already registered', 'EMAIL_EXISTS');
    }
    const password_hash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
    const userId = await UserModel.create({ name, email, password_hash });
    return { id: userId, name, email, role: 'customer' };
  }

  // Login: verify credentials, issue JWT
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');

    const { token, jti } = signToken({ id: user.id, role: user.role });
    return {
      token,
      jti,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  // Logout: add token jti to blacklist until it expires
  async logout({ jti, exp }) {
    // Convert exp (seconds) to Date
    const expiresAt = exp ? new Date(exp * 1000) : dayjs().add(1, 'hour').toDate();
    await JwtBlacklistModel.add(jti, expiresAt);
    return true;
  }

  // Forgot password: generate token, store hashed token, email user
  async requestPasswordReset(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) return true; // Do not reveal existence of accounts

    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires_at = dayjs().add(1, 'hour').toDate();

    await PasswordResetModel.create({ user_id: user.id, token_hash, expires_at });

    const resetUrl = `${config.APP_URL}/api/v1/auth/reset-password?token=${rawToken}`;
    try {
      await sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `Use this link to reset your password: ${resetUrl} (valid for 1 hour)`
      });
    } catch (e) {
      // Reasoning: Do not expose mail failure to client to avoid user enumeration & leakage
    }

    return true;
  }

  // Reset password using token
  async resetPassword({ token, newPassword }) {
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const rec = await PasswordResetModel.findValidByTokenHash(token_hash);
    if (!rec) throw ApiError.badRequest('Invalid or expired token', 'INVALID_TOKEN');

    const new_hash = await bcrypt.hash(newPassword, config.BCRYPT_SALT_ROUNDS);
    await UserModel.updatePassword(rec.user_id, new_hash);
    await PasswordResetModel.markUsed(rec.id);
    return true;
  }
}

module.exports = new AuthService();
