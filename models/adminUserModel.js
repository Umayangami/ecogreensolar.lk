const db = require('../config/db');

/**
 * Find an admin by username.
 * @param {string} username
 * @returns {Promise<object|null>}
 */
exports.findByUsername = async (username) => {
  const [rows] = await db.query(
    'SELECT * FROM admin_users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
};

/**
 * Find an admin by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
exports.findById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, username, role, created_at FROM admin_users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all admins (no password column).
 * @returns {Promise<object[]>}
 */
exports.getAll = async () => {
  const [rows] = await db.query(
    'SELECT id, username, role, created_at FROM admin_users ORDER BY created_at DESC'
  );
  return rows;
};

/**
 * Count total admins.
 * @returns {Promise<number>}
 */
exports.count = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM admin_users');
  return rows[0].total;
};

/**
 * Create a new admin user.
 * @param {string} username
 * @param {string} hashedPassword  - already bcrypt-hashed
 * @param {string} role            - 'admin' | 'superadmin'
 * @returns {Promise<number>} insertId
 */
exports.create = async (username, hashedPassword, role = 'admin') => {
  const [result] = await db.query(
    'INSERT INTO admin_users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role]
  );
  return result.insertId;
};

/**
 * Delete an admin by id.
 * @param {number} id
 */
exports.deleteById = async (id) => {
  await db.query('DELETE FROM admin_users WHERE id = ?', [id]);
};

/**
 * Check if a username already exists.
 * @param {string} username
 * @returns {Promise<boolean>}
 */
exports.usernameExists = async (username) => {
  const [rows] = await db.query(
    'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows.length > 0;
};
