var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(['/', '/index.html'], function(req, res, next) {
  console.log('Route handler: GET / triggered');
  res.render('index', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Home' }, function(err, html) {
    if (err) {
      console.error('EJS Render Error on / :', err.message, err.stack);
      console.error('Full error:', JSON.stringify(err));
      return res.status(500).send('<h2>EJS Error:</h2><p>' + err.message + '</p>');
    }
    console.log('EJS Render Success - HTML length:', html ? html.length : 0);
    console.log('Sending HTML response...');
    res.send(html);
    console.log('HTML response sent.');
  });
});

router.get('/ping', function(req, res) {
  res.send('Router is working!');
});

/* GET services page. */
router.get(['/services', '/services.html'], function(req, res, next) {
  res.render('services', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Services' });
});

/* GET projects page. */
router.get(['/projects', '/projects.html'], function(req, res, next) {
  res.render('projects', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Projects' });
});

/* GET about page. */
router.get(['/about', '/about.html'], function(req, res, next) {
  res.render('about', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - About Us' });
});

// GET /get-a-quote and /book-service are handled by quoteRoutes

/* GET solar savings calculator page. */
router.get(['/solar-calculator', '/solar-calculator.html'], function(req, res, next) {
  res.render('solar-calculator', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Solar Savings Calculator' });
});

module.exports = router;
