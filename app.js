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


process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});


function createApp() {

  var app = express();


  // ── View engine ───────────────────────────────────────────────────
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');


  // ── Basic middleware ─────────────────────────────────────────────
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());


  // ── Debug middleware ─────────────────────────────────────────────
  app.use(function (req, res, next) {

    console.log('[REQUEST]', req.method, req.url);

    next();

  });


  // ── HEALTH CHECK BEFORE SESSION ──────────────────────────────────
  app.get('/health', function(req, res) {

    console.log('[HEALTH] OK');

    res.status(200).send(
      '<h1 style="color:green">✅ Node.js Server Working</h1>' +
      '<p>Hostinger Node application is responding correctly.</p>'
    );

  });


  // ── Session store ────────────────────────────────────────────────

  const dbOptions = {

    host: process.env.DB_HOST || 'localhost',

    port: Number(process.env.DB_PORT) || 3306,

    user: process.env.DB_USER || 'root',

    password: process.env.DB_PASSWORD || '',

    database: process.env.DB_NAME || 'eco_energy_solution_db',

    connectTimeout: 10000

  };


  console.log('[DATABASE CONFIG]', {

    host: dbOptions.host,

    database: dbOptions.database,

    user: dbOptions.user

  });


  let sessionStore;


  try {

    sessionStore = new MySQLStore(dbOptions);


    sessionStore.on('error', function(err){

      console.error('[MYSQL SESSION ERROR]', err);

    });


    console.log('[SESSION] MySQL session store initialized');


  } catch(err) {

    console.error('[SESSION] Failed, using memory session:', err.message);

  }



  app.use(session({

    secret: process.env.SESSION_SECRET || 'ecogreen_fallback_secret',

    store: sessionStore,

    resave: false,

    saveUninitialized: false,

    cookie: {

      httpOnly:true,

      secure:false,

      maxAge:1000 * 60 * 60 * 2

    }

  }));



  // ── Static files ─────────────────────────────────────────────────

  app.use(express.static(path.join(__dirname, 'public')));



  // ── Routes ───────────────────────────────────────────────────────

  app.get('/favicon.ico', function(req,res){

    res.status(204).end();

  });


  app.use('/', indexRouter);

  app.use('/users', usersRouter);

  app.use(['/contact','/contact.html'], contactRouter);

  app.use([
    '/get-a-quote',
    '/get-a-quote.html',
    '/book-service',
    '/book-service.html',
    '/booking.php'
  ], quoteRouter);


  app.use('/admin', adminRouter);



  // ── 404 ─────────────────────────────────────────────────────────

  app.use(function(req,res,next){

    next(createError(404));

  });



  // ── Error handler ────────────────────────────────────────────────

  app.use(function(err,req,res,next){

    console.error('EXPRESS ERROR:', {

      status: err.status,

      message: err.message,

      stack: err.stack

    });


    res.status(err.status || 500);


    res.send(`
      <html>
        <body>
          <h1>Error ${err.status || 500}</h1>
          <p>${err.message}</p>
        </body>
      </html>
    `);

  });


  return app;

}



function startServer(){

  const app = createApp();


  const PORT =
    process.env.PORT ||
    process.env.HOSTINGER_PORT ||
    process.env.PASSENGER_PORT ||
    3000;


  console.log('Node startup env:', {

    PORT:process.env.PORT,

    HOSTINGER_PORT:process.env.HOSTINGER_PORT,

    PASSENGER_PORT:process.env.PASSENGER_PORT

  });



  const server = app.listen(PORT,'0.0.0.0',()=>{

    console.log(`Server running on port ${PORT}`);

  });



  server.on('error',(err)=>{

    console.error('SERVER ERROR:',err);

  });


  return server;

}



module.exports = {
  createApp,
  startServer
};


if(require.main === module){

  startServer();

}