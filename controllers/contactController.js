const ContactModel = require('../models/contactModel');

class ContactController {
    /**
     * Renders the contact us page.
     */
    static showContactPage(req, res) {
        res.render('contact');
    }

    /**
     * Handles the contact form submission.
     */
    static async submitForm(req, res) {
        try {
            const { name, email, phone, message } = req.body;
            
            // Insert contact form data into the database
            await ContactModel.create({ name, email, phone, message });
            
            // Send 'sent' as expected by Solaria's validation-contact.js AJAX handler
            res.send('sent');
        } catch (error) {
            console.error('Error handling contact form submission:', error);
            res.status(500).send('failed');
        }
    }
}

module.exports = ContactController;
