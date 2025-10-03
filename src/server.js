// Reasoning: Server entry that boots the Express app and handles graceful shutdown
const http = require("http");
const app = require("./app");
const config = require("./config");
const logger = require("./config/logger");
const initAdmin = require("./bootstrap/initAdmin");

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT} (${config.NODE_ENV})`);
  // Reasoning: Optionally bootstrap an admin user if ADMIN_EMAIL/PASSWORD are provided in env
  initAdmin().catch((err) =>
    logger.error("Admin bootstrap error: %s", err.message),
  );
});

function shutdown(signal) {
  logger.info(`${signal} received: closing server...`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  // Force close after 10s
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
