var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(['/', '/index.html'], function(req, res, next) {
  res.render('index', { title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Home' });
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
