const express        = require('express');
const router         = express.Router();
const adminCtrl      = require('../controllers/adminController');
const isAuthenticated = require('../middlewares/isAuthenticated');

// ---------- Public: Login ----------
router.get('/login',  adminCtrl.getLogin);
router.post('/login', adminCtrl.postLogin);

// ---------- Public: Logout ----------
router.get('/logout', adminCtrl.logout);

// ---------- Protected: Dashboard ----------
router.get('/', isAuthenticated, adminCtrl.getDashboard);

// ---------- Protected: Register new admin (superadmin only) ----------
router.get('/register',  isAuthenticated, adminCtrl.getRegister);
router.post('/register', isAuthenticated, adminCtrl.postRegister);

// ---------- Protected: Manage admins (superadmin only) ----------
router.get('/manage-admins',          isAuthenticated, adminCtrl.getManageAdmins);
router.post('/manage-admins/delete',  isAuthenticated, adminCtrl.deleteAdmin);

module.exports = router;
