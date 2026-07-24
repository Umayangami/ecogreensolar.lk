// Load environment variables at the very beginning
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

// 1. MySQL Session Store එක Load කරගන්න
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactRouter = require('./routes/contactRoutes');
var quoteRouter = require('./routes/quoteRoutes');
var adminRouter = require('./routes/adminRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// Configure body parsing for form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. MySQL Database විස්තර ලබා දෙන්න (env එකෙන්)
var sessionStoreOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecogreen_db'
};

// 3. MySQL Store එක හදන්න
var sessionStore = new MySQLStore(sessionStoreOptions);

// Session middleware – MySQL Store එක පාවිච්චි කරලා update කරලා තියෙන්නේ
app.use(session({
  key: 'ecogreen_session', // Cookie එකේ නම
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  store: sessionStore, // මෙතනින් තමයි Database එකට link වෙන්නේ
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Live දාද්දි (HTTPS තියෙනවා නම්) මේක true කරන්න
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(['/contact', '/contact.html'], contactRouter);
app.use(['/get-a-quote', '/get-a-quote.html', '/book-service', '/book-service.html', '/booking.php'], quoteRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Enable standalone server execution
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;