const mysql = require('mysql2/promise');
const path  = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.HOSTINGER_DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.HOSTINGER_DB_PORT || process.env.MYSQL_PORT) || 3306,
    user: process.env.DB_USER || process.env.HOSTINGER_DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.HOSTINGER_DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.HOSTINGER_DB_NAME || process.env.MYSQL_DATABASE || 'eco_energy_solution_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
