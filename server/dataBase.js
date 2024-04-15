const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  password: "SQL0100100101000001",
  host: "localhost",
  port: 5432,
  database: "whatsapp",
});

module.exports = pool;
