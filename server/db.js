const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[db] DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production" || process.env.PGSSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
