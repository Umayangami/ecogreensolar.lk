// Load environment variables at the very beginning
require('dotenv').config();

var createError   = require('http-errors');
var express       = require('express');
var path          = require('path');
var cookieParser  = require('cookie-parser');
var logger        = require('morgan');
var session       = require('express-session');
var MySQLStore    = require('express-mysql-session')(session);

var indexRouter   = require('./routes/index');
var usersRouter   = require('./routes/users');
var contactRouter = require('./routes/contactRoutes');
var quoteRouter   = require('./routes/quoteRoutes');
var adminRouter   = require('./routes/adminRoutes');

function createApp() {
  var app = express();

  // ── View engine ───────────────────────────────────────────────────
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // ── Request middleware ────────────────────────────────────────────
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ── Incoming request debug (Hostinger diagnostics)
  app.use(function (req, res, next) {
    console.log('REQ', req.method, req.url);
    next();
  });

  // ── Session store ──────────────────────────────────────────────────
  const dbOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eco_energy_solution_db'
  };

  let sessionStore = null;
  try {
    sessionStore = new MySQLStore(dbOptions);
  } catch (err) {
    console.warn('MySQL session store setup failed, falling back to memory store:', err.message);
  }

  app.use(session({
    secret: process.env.SESSION_SECRET || 'ecogreen_fallback_secret',
    store: sessionStore || undefined,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  }));

  // ── Static files ──────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, 'public')));

  // ── Routes ────────────────────────────────────────────────────────

  // Health check – visit /health to confirm server is working
  app.get('/health', function(req, res) {
    res.send('<h1 style="color:green">✅ Server is running!</h1><p>Node.js app is working correctly on Hostinger.</p><a href="/">Go to Home</a>');
  });

  // Optional favicon route to avoid 404 fallback HTML
  app.get('/favicon.ico', function(req, res) {
    res.status(204).end();
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
    console.error('Express error:', {
      status: status,
      message: message,
      stack: err.stack
    });
    res.status(status);
    // Send plain HTML so a broken error.ejs never causes a secondary crash
    res.send(
      '<!DOCTYPE html><html><head><title>Error ' + status + '</title></head>' +
      '<body><h1>' + status + ' – ' + message + '</h1>' +
      '<p><a href="/">Go back to Home</a></p></body></html>'
    );
  });

  return app;
}

function startServer() {
  const app = createApp();
  const PORT = process.env.PORT || process.env.HOSTINGER_PORT || process.env.PASSENGER_PORT || 3000;
  app.set('port', PORT);
  console.log('Node startup env:', {
    PORT: process.env.PORT,
    HOSTINGER_PORT: process.env.HOSTINGER_PORT,
    PASSENGER_PORT: process.env.PASSENGER_PORT
  });
  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = {
  createApp,
  startServer
};

if (require.main === module) {
  startServer();
}