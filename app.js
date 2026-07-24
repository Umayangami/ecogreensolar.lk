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

// ── View engine ──────────────────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ── Request middleware ────────────────────────────────────────────
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Session (file-based – works on any host without extra DB config)
var FileStore = require('session-file-store')(session);

app.use(session({
  store: new FileStore({
    path:   path.join(__dirname, 'sessions'), // stored inside project folder
    ttl:    7200,   // 2 hours in seconds
    reapInterval: 3600
  }),
  secret:            process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production', // HTTPS-only in production
    maxAge:   1000 * 60 * 60 * 2  // 2 hours
  }
}));

// ── Static files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────
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
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
