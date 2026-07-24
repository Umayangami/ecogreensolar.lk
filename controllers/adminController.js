const bcrypt      = require('bcrypt');
const db          = require('../config/db');
const AdminUser   = require('../models/adminUserModel');

const SALT_ROUNDS = 12;

/* ================================================================
   LOGIN
   ================================================================ */

// GET /admin/login
exports.getLogin = (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  const error   = req.query.error   || null;
  const success = req.query.success || null;
  res.render('admin/admin-login', { error, success });
};

// POST /admin/login  –  DB-backed with bcrypt
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('admin/admin-login', {
      error: 'Username and password are required.',
      success: null,
    });
  }

  try {
    const admin = await AdminUser.findByUsername(username.trim());

    if (!admin) {
      return res.render('admin/admin-login', {
        error: 'Invalid username or password.',
        success: null,
      });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.render('admin/admin-login', {
        error: 'Invalid username or password.',
        success: null,
      });
    }

    // ✅ Authenticated
    req.session.isAdmin    = true;
    req.session.adminUser  = admin.username;
    req.session.adminRole  = admin.role;
    req.session.adminId    = admin.id;
    return res.redirect('/admin');

  } catch (err) {
    console.error('Login error:', err);
    return res.render('admin/admin-login', {
      error: 'Server error. Please try again.',
      success: null,
    });
  }
};

/* ================================================================
   LOGOUT
   ================================================================ */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/admin/login');
  });
};

/* ================================================================
   DASHBOARD
   ================================================================ */
exports.getDashboard = async (req, res) => {
  try {
    const [contacts] = await db.query(
      'SELECT id, name, email, phone, message, created_at FROM contacts ORDER BY created_at DESC'
    );
    const [quotes] = await db.query(
      'SELECT id, service, preferred_date, preferred_time, name, email, phone, message, created_at FROM quote_requests ORDER BY created_at DESC'
    );

    res.render('admin/admin-dashboard', {
      contacts,
      quotes,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  } catch (err) {
    console.error('Dashboard DB error:', err);
    res.status(500).render('error', {
      message: 'Failed to load admin dashboard.',
      error: req.app.get('env') === 'development' ? err : {},
    });
  }
};

/* ================================================================
   REGISTER  (superadmin only)
   ================================================================ */

// GET /admin/register
exports.getRegister = (req, res) => {
  // Only superadmin may create new admins
  if (req.session.adminRole !== 'superadmin') {
    return res.redirect('/admin?error=Access+denied.+Only+superadmins+can+register+new+admins.');
  }
  res.render('admin/admin-register', {
    error   : req.query.error   || null,
    success : req.query.success || null,
    adminUser : req.session.adminUser,
    adminRole : req.session.adminRole,
  });
};

// POST /admin/register
exports.postRegister = async (req, res) => {
  if (req.session.adminRole !== 'superadmin') {
    return res.redirect('/admin?error=Access+denied.');
  }

  const { username, password, confirm_password, role } = req.body;

  // ---- Validation ----
  if (!username || !password || !confirm_password) {
    return res.render('admin/admin-register', {
      error     : 'All fields are required.',
      success   : null,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  }

  if (username.trim().length < 3 || username.trim().length > 80) {
    return res.render('admin/admin-register', {
      error     : 'Username must be between 3 and 80 characters.',
      success   : null,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  }

  if (password.length < 8) {
    return res.render('admin/admin-register', {
      error     : 'Password must be at least 8 characters long.',
      success   : null,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  }

  if (password !== confirm_password) {
    return res.render('admin/admin-register', {
      error     : 'Passwords do not match.',
      success   : null,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  }

  const allowedRoles = ['admin', 'superadmin'];
  const assignedRole = allowedRoles.includes(role) ? role : 'admin';

  try {
    const exists = await AdminUser.usernameExists(username.trim());
    if (exists) {
      return res.render('admin/admin-register', {
        error     : `Username "${username.trim()}" is already taken.`,
        success   : null,
        adminUser : req.session.adminUser,
        adminRole : req.session.adminRole,
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await AdminUser.create(username.trim(), hash, assignedRole);

    return res.redirect(
      `/admin/manage-admins?success=Admin+%22${encodeURIComponent(username.trim())}%22+registered+successfully.`
    );

  } catch (err) {
    console.error('Register error:', err);
    return res.render('admin/admin-register', {
      error     : 'Server error while registering. Please try again.',
      success   : null,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
    });
  }
};

/* ================================================================
   MANAGE ADMINS  (superadmin only)
   ================================================================ */

// GET /admin/manage-admins
exports.getManageAdmins = async (req, res) => {
  if (req.session.adminRole !== 'superadmin') {
    return res.redirect('/admin?error=Access+denied.');
  }

  try {
    const admins = await AdminUser.getAll();
    res.render('admin/admin-manage', {
      admins,
      adminUser : req.session.adminUser,
      adminRole : req.session.adminRole,
      error     : req.query.error   || null,
      success   : req.query.success || null,
    });
  } catch (err) {
    console.error('Manage admins error:', err);
    res.status(500).render('error', {
      message: 'Failed to load admin list.',
      error: req.app.get('env') === 'development' ? err : {},
    });
  }
};

// POST /admin/manage-admins/delete
exports.deleteAdmin = async (req, res) => {
  if (req.session.adminRole !== 'superadmin') {
    return res.redirect('/admin?error=Access+denied.');
  }

  const targetId = parseInt(req.body.id, 10);

  if (!targetId || isNaN(targetId)) {
    return res.redirect('/admin/manage-admins?error=Invalid+admin+ID.');
  }

  // Prevent self-deletion
  if (targetId === req.session.adminId) {
    return res.redirect('/admin/manage-admins?error=You+cannot+delete+your+own+account.');
  }

  try {
    const target = await AdminUser.findById(targetId);

    if (!target) {
      return res.redirect('/admin/manage-admins?error=Admin+not+found.');
    }

    await AdminUser.deleteById(targetId);
    return res.redirect(
      `/admin/manage-admins?success=Admin+%22${encodeURIComponent(target.username)}%22+deleted+successfully.`
    );

  } catch (err) {
    console.error('Delete admin error:', err);
    return res.redirect('/admin/manage-admins?error=Failed+to+delete+admin.');
  }
};
