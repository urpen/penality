const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pen_match',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
  enableKeepAlive: true
};

// Enable SSL for production/cloud databases (required for TiDB/Aiven)
if (process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: false // Allow self-signed certs for compatibility
  };
}

console.log('DB Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: !!dbConfig.ssl
});

const pool = mysql.createPool(dbConfig);

// Test connection (non-blocking, won't crash if fails)
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ MySQL connection error:', err.message);
    // Don't exit process in serverless environment
  });

module.exports = pool;

