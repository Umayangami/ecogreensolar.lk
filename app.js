// Load environment variables at the very beginning
require('dotenv').config();

var createError   = require('http-errors');
var express       = require('express');
var path          = require('path');
var cookieParser  = require('cookie-parser');
var logger        = require('morgan');
var session       = require('express-session');

var indexRouter   = require('./routes/index');
var usersRouter   = require('./routes/users');
var contactRouter = require('./routes/contactRoutes');
var quoteRouter   = require('./routes/quoteRoutes');
var adminRouter   = require('./routes/adminRoutes');

var app = express();

// ── View engine ───────────────────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ── Request middleware ────────────────────────────────────────────
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Session (in-memory – works on every host, no filesystem/DB needed)
app.use(session({
  secret:            process.env.SESSION_SECRET || 'ecogreen_fallback_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   false,   // Hostinger handles HTTPS termination itself
    maxAge:   1000 * 60 * 60 * 2   // 2 hours
  }
}));

// ── Static files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────

// Health check – visit /health to confirm server is working
app.get('/health', function(req, res) {
  res.send('<h1 style="color:green">✅ Server is running!</h1><p>Node.js app is working correctly on Hostinger.</p><a href="/">Go to Home</a>');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(['/contact', '/contact.html'], contactRouter);
app.use(['/get-a-quote', '/get-a-quote.html', '/book-service', '/book-service.html', '/booking.php'], quoteRouter);
app.use('/admin', adminRouter);

// ── 404 handler ───────────────────────────────────────────────────
app.use(function (req, res, next) {
  next(createError(404));
});

// ── Error handler ─────────────────────────────────────────────────
app.use(function (err, req, res, next) {
  var status  = err.status || err.statusCode || 500;
  var message = err.message || 'Internal Server Error';
  res.status(status);
  // Send plain HTML so a broken error.ejs never causes a secondary crash
  res.send(
    '<!DOCTYPE html><html><head><title>Error ' + status + '</title></head>' +
    '<body><h1>' + status + ' – ' + message + '</h1>' +
    '<p><a href="/">Go back to Home</a></p></body></html>'
  );
});

// Start directly from app.js for Hostinger compatibility
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});