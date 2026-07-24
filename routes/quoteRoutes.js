const express = require('express');
const router = express.Router();
const QuoteController = require('../controllers/quoteController');
const validateQuote = require('../middlewares/validateQuote');

// GET /get-a-quote or /book-service - Renders the quote page
router.get('/', QuoteController.showQuotePage);

// POST /book-service - Validates and saves the quote request to the database
router.post('/', validateQuote, QuoteController.submitForm);

module.exports = router;
