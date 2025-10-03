// Reasoning: Connection pool with mysql2/promise for prepared statements and efficient DB access
const mysql = require("mysql2/promise");
const config = require("./index");
const logger = require("./logger");

const pool = mysql.createPool({
  host: config.DB.host,
  port: config.DB.port,
  user: config.DB.user,
  password: config.DB.password,
  database: config.DB.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: false,
});

pool.on("connection", () => logger.debug("MySQL: New connection established"));

module.exports = pool;
