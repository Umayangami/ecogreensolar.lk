/**
 * seedSuperAdmin.js
 * -----------------
 * One-time script: reads ADMIN_USERNAME / ADMIN_PASSWORD from .env,
 * hashes the password with bcrypt, and inserts the super-admin into
 * the admin_users table (skips if the username already exists).
 *
 * Run once:  node scripts/seedSuperAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async () => {
  const username = process.env.ADMIN_USERNAME;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!username || !plainPassword) {
    console.error('❌  ADMIN_USERNAME or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  try {
    // Check if already seeded
    const [rows] = await db.query(
      'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length > 0) {
      console.log(`ℹ️   Super-admin "${username}" already exists. Skipping.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(plainPassword, 12);
    await db.query(
      'INSERT INTO admin_users (username, password, role) VALUES (?, ?, ?)',
      [username, hash, 'superadmin']
    );

    console.log(`✅  Super-admin "${username}" seeded successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  }
})();
