const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const validateContact = require('../middlewares/validateContact');

// GET /contact - Renders the contact page
router.get('/', ContactController.showContactPage);

// POST /contact - Validates and processes the contact form submission
router.post('/', validateContact, ContactController.submitForm);

module.exports = router;
