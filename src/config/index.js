// Reasoning: Centralized config reads env and exposes typed config for consistency and safety
require("dotenv").config();

const env = process.env;

const config = {
  NODE_ENV: env.NODE_ENV || "development",
  PORT: parseInt(env.PORT || "3000", 10),
  APP_URL: env.APP_URL || "http://localhost:3000",
  DB: {
    host: env.DB_HOST || "127.0.0.1",
    port: parseInt(env.DB_PORT || "3306", 10),
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "ecommerce_db",
  },
  JWT: {
    secret: env.JWT_SECRET || "change_this",
    expiresIn: env.JWT_EXPIRES_IN || "1h",
  },
  BCRYPT_SALT_ROUNDS: parseInt(env.BCRYPT_SALT_ROUNDS || "10", 10),
  RATE_LIMIT: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    max: parseInt(env.RATE_LIMIT_MAX || "100", 10),
  },
  SMTP: {
    host: env.SMTP_HOST || "",
    port: parseInt(env.SMTP_PORT || "587", 10),
    secure: (env.SMTP_SECURE || "false") === "true",
    user: env.SMTP_USER || "",
    pass: env.SMTP_PASS || "",
    from: env.SMTP_FROM || "Shop <no-reply@example.com>",
  },
  UPLOAD: {
    dir: env.UPLOAD_DIR || "uploads",
    maxFileSizeMB: parseInt(env.UPLOAD_MAX_FILE_SIZE_MB || "5", 10),
  },
  INVOICE_DIR: env.INVOICE_DIR || "invoices",
};

module.exports = config;
