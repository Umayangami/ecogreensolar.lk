/**
 * Auth middleware – blocks unauthenticated access to admin routes.
 * Redirects to /admin/login with a flash-style query param when not logged in.
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  return res.redirect('/admin/login?error=Please+log+in+to+continue');
}

module.exports = isAuthenticated;
