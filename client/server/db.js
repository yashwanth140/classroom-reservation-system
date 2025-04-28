const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  ssl: { rejectUnauthorized: true }  // LINE for Azure Secure SSL
});

db.connect(err => {
  if (err) {
    console.error('Database connection error:', err.message);
    throw err;
  }
  console.log('MySQL Connected ✅');
});

module.exports = db;
